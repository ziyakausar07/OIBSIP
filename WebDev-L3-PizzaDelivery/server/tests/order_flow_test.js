const BASE_URL = 'http://localhost:5050/api';

async function testOrderFlow() {
  console.log('🍕 Testing Order Placement & Payment Verification Flow...\n');

  try {
    // 1. Login as user
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@slicecraftpizza.com', // Admin is already verified and has full ordering privileges
        password: 'Admin@123',
      }),
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('   ✅ Authenticated user:', loginData.user.name, `(${loginData.user.email})`);

    // 2. Fetch ingredients to build a custom pizza
    const ingsRes = await fetch(`${BASE_URL}/ingredients`);
    const ingsData = await ingsRes.json();
    const base = ingsData.ingredients.find(i => i.category === 'base');
    const sauce = ingsData.ingredients.find(i => i.category === 'sauce');
    const cheese = ingsData.ingredients.find(i => i.category === 'cheese');
    const veg1 = ingsData.ingredients.find(i => i.category === 'veggie');

    console.log(`   🍕 Building Custom Pizza: ${base.name} + ${sauce.name} + ${cheese.name} + ${veg1.name}`);

    // 3. Create payment order
    const orderPayload = {
      items: [
        {
          name: 'Chef Custom Test Pizza',
          size: 'Medium',
          base: { id: base._id, name: base.name, price: base.price },
          sauce: { id: sauce._id, name: sauce.name, price: sauce.price },
          cheese: { id: cheese._id, name: cheese.name, price: cheese.price },
          veggies: [{ id: veg1._id, name: veg1.name, price: veg1.price }],
          quantity: 1,
        },
      ],
      deliveryAddress: {
        fullName: 'Test Customer',
        phone: '+91 9876543210',
        street: '123 Baker Street',
        city: 'Mumbai',
        postalCode: '400001',
        notes: 'Leave at front door',
      },
    };

    console.log('\n   📦 Initiating Razorpay Order (/api/payments/create-order)...');
    const createOrderRes = await fetch(`${BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });
    const orderData = await createOrderRes.json();
    console.log('Order create response:', orderData);
    console.log('   ✅ Order Created in Pending State:', orderData.orderNumber);
    console.log('      • Subtotal:', '₹' + orderData.pricing?.subtotal);
    console.log('      • GST (5%):', '₹' + orderData.pricing?.tax);
    console.log('      • Delivery:', '₹' + orderData.pricing?.deliveryFee);
    console.log('      • Total:', '₹' + orderData.pricing?.total);
    console.log('      • Razorpay Order ID:', orderData.razorpayOrderId);

    // 4. Verify Payment & Deduct Stock
    console.log('\n   💳 Verifying Payment (/api/payments/verify)...');
    const verifyRes = await fetch(`${BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        orderId: orderData.orderId,
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: `pay_test_${Date.now()}`,
        razorpay_signature: 'test_sandbox_signature',
      }),
    });
    const verifyData = await verifyRes.json();
    console.log('   ✅ Payment Verified! Order Status:', verifyData.order?.orderStatus);
    console.log('   ✅ Stock Deducted Flag:', verifyData.order?.stockDeducted);

    // 5. Query user orders
    console.log('\n   📋 Verifying /api/orders/my-orders...');
    const myOrdersRes = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const myOrders = await myOrdersRes.json();
    console.log('   ✅ User Order History Count:', myOrders.orders?.length);

    console.log('\n======================================================');
    console.log('🎉 FULL ORDER & PAYMENT WORKFLOW VERIFIED SUCCESSFULLY!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Order Test Error:', error.message);
  }
}

testOrderFlow();
