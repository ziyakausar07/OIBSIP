const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  const isDummy =
    !key_id ||
    !key_secret ||
    key_id.includes('placeholder') ||
    key_id.includes('demo') ||
    key_secret.includes('placeholder') ||
    key_secret.includes('demo');

  if (!isDummy) {
    try {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
      console.log(`[Razorpay] Initialized with credentials (${key_id.slice(0, 8)}...)`);
    } catch (err) {
      console.warn('[Razorpay] Init warning:', err.message);
    }
  } else {
    console.log('[Razorpay] Running in Sandbox Simulation mode (demo/placeholder keys configured).');
  }

  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
