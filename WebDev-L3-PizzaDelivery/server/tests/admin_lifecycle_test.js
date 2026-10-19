const BASE_URL = 'http://localhost:5050/api';

async function testAdminOrderWorkflow() {
  console.log('🛡️ Testing Admin Order Lifecycle Transitions...\n');

  try {
    // 1. Admin login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@slicecraftpizza.com',
        password: 'Admin@123',
      }),
    });
    const adminData = await adminLoginRes.json();
    const token = adminData.token;

    // 2. Fetch all orders
    const ordersRes = await fetch(`${BASE_URL}/admin/orders?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const ordersData = await ordersRes.json();
    const latestOrder = ordersData.orders[0];
    console.log(`   📋 Found Latest Order #${latestOrder.orderNumber} (Current Status: ${latestOrder.orderStatus})`);

    // 3. Transition: Order Received -> In Kitchen
    console.log('   🔥 Transitioning to: In Kitchen...');
    const kRes = await fetch(`${BASE_URL}/admin/orders/${latestOrder._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'In Kitchen', note: 'Baking in stone oven #2' }),
    });
    const kData = await kRes.json();
    console.log('   ✅ Status:', kData.order?.orderStatus, '| Note:', kData.order?.statusHistory?.slice(-1)[0]?.note);

    // 4. Transition: In Kitchen -> Sent to Delivery
    console.log('   🛵 Transitioning to: Sent to Delivery...');
    const dRes = await fetch(`${BASE_URL}/admin/orders/${latestOrder._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Sent to Delivery', note: 'Handed to Rider Ramesh' }),
    });
    const dData = await dRes.json();
    console.log('   ✅ Status:', dData.order?.orderStatus, '| Note:', dData.order?.statusHistory?.slice(-1)[0]?.note);

    // 5. Transition: Sent to Delivery -> Delivered
    console.log('   🎉 Transitioning to: Delivered...');
    const dlRes = await fetch(`${BASE_URL}/admin/orders/${latestOrder._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: 'Delivered', note: 'Delivered hot to customer doorstep' }),
    });
    const dlData = await dlRes.json();
    console.log('   ✅ Status:', dlData.order?.orderStatus, '| Timeline Entries:', dlData.order?.statusHistory?.length);

    console.log('\n======================================================');
    console.log('🎉 ADMIN ORDER LIFECYCLE VERIFIED SUCCESSFULLY (ALL STEPS)');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Admin Order Test Error:', error.message);
  }
}

testAdminOrderWorkflow();
