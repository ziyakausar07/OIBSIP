const Order = require('../models/Order');

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Authorization: User can only see their own order unless they are an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order (if not yet in kitchen)
// @route   PUT /api/orders/:id/cancel
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this order.' });
    }

    if (order.orderStatus !== 'Order Received') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${order.orderStatus}'.`,
      });
    }

    order.orderStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: 'Cancelled by customer.',
    });
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyOrders,
  getOrderById,
  cancelOrder,
};
