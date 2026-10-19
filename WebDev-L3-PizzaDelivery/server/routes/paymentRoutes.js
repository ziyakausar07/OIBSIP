const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');
const { protect, requireVerified } = require('../middleware/authMiddleware');

router.post('/create-order', protect, requireVerified, createPaymentOrder);
router.post('/verify', protect, requireVerified, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
