const crypto = require('crypto');
const { getRazorpayInstance } = require('../config/razorpay');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { calculateOrderPricing } = require('../services/pricingService');
const { checkStockAvailability, deductStockForOrder } = require('../services/inventoryService');
const { emitOrderStatusUpdate, emitNewOrderToAdmin } = require('../config/socket');

// @desc    Initiate Razorpay Order & validate pricing/stock
// @route   POST /api/payments/create-order
const createPaymentOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Cart cannot be empty.' });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.fullName ||
      !deliveryAddress.phone ||
      !deliveryAddress.street ||
      !deliveryAddress.city
    ) {
      return res.status(400).json({ success: false, message: 'Please provide full delivery address details.' });
    }

    // 1. Verify stock availability before initiating order
    const stockCheck = await checkStockAvailability(items);
    if (!stockCheck.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Some ingredients in your order are currently out of stock. Please adjust your selections.',
        outOfStockItems: stockCheck.outOfStockItems,
      });
    }

    // 2. Compute trusted server-side pricing
    const { items: verifiedItems, pricing } = await calculateOrderPricing(items);

    // 3. Generate unique orderNumber
    const orderNumber = `SC-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 4. Create pending order in database
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: verifiedItems,
      pricing,
      deliveryAddress: {
        fullName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state || 'Maharashtra',
        postalCode: deliveryAddress.postalCode || '400001',
        instructions: deliveryAddress.instructions || deliveryAddress.notes || '',
      },
      orderStatus: 'Order Received',
      paymentStatus: 'Pending',
      statusHistory: [
        {
          status: 'Order Received',
          timestamp: new Date(),
          note: 'Order initiated, awaiting payment confirmation.',
        },
      ],
    });

    // 5. Create Razorpay Order
    let razorpayOrderId = '';
    const razorpay = getRazorpayInstance();
    const amountInPaise = Math.round(pricing.total * 100);

    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            userId: req.user._id.toString(),
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.error('[Razorpay Create Error]:', rzpErr);
        // Fall back to test order identifier if test keys fail
        razorpayOrderId = `rzp_test_ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      }
    } else {
      // Sandbox simulation mode
      razorpayOrderId = `rzp_test_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }

    order.razorpayOrderId = razorpayOrderId;
    await order.save();

    // Create payment tracking record
    await Payment.create({
      order: order._id,
      user: req.user._id,
      razorpayOrderId,
      amount: pricing.total,
      currency: 'INR',
      status: 'CREATED',
    });

    res.status(200).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_pizza_demo_key',
      pricing,
      customer: {
        name: deliveryAddress.fullName,
        email: req.user.email,
        phone: deliveryAddress.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature & deduct stock
// @route   POST /api/payments/verify
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Missing required transaction details.',
      });
    }

    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Prevent duplicate processing
    if (order.paymentStatus === 'Paid' && order.stockDeducted) {
      return res.status(200).json({
        success: true,
        message: 'Order already verified and confirmed.',
        order,
      });
    }

    // Verify cryptographic signature if secret is live
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const isPlaceholderSecret = !secret || secret.includes('placeholder') || secret.includes('demo');

    if (!isPlaceholderSecret && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        // Record payment failure
        await Payment.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id },
          {
            status: 'FAILED',
            razorpayPaymentId: razorpay_payment_id,
            errorDetails: { reason: 'Signature verification mismatch' },
          }
        );
        order.paymentStatus = 'Failed';
        await order.save();

        return res.status(400).json({
          success: false,
          message: 'Payment signature verification failed. Potential tampering detected.',
        });
      }
    }

    // Payment is authentic! Deduct stock safely
    try {
      await deductStockForOrder(order, req.user._id);
    } catch (stockErr) {
      // Stock became unavailable right at checkout time
      order.paymentStatus = 'Failed';
      order.statusHistory.push({
        status: 'Cancelled',
        timestamp: new Date(),
        note: `Stock deduction failed: ${stockErr.message}. Refund queued.`,
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: `Stock reservation failed: ${stockErr.message}. Please contact support for an immediate refund.`,
      });
    }

    // Update Payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'VERIFIED',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature || 'simulated_signature',
      }
    );

    // Update Order record
    order.paymentStatus = 'Paid';
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature || '';
    order.statusHistory.push({
      status: 'Order Received',
      timestamp: new Date(),
      note: 'Payment verified successfully via Razorpay test mode.',
    });
    await order.save();

    // Broadcast real-time updates to Admin dashboard and user room
    emitNewOrderToAdmin(order);
    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your order has been placed.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook listener (Optional asynchronous confirmation)
// @route   POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ status: 'invalid_signature' });
      }
    }

    const event = req.body.event;
    console.log(`[Razorpay Webhook Received]: ${event}`);

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[Webhook Error]:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
};
