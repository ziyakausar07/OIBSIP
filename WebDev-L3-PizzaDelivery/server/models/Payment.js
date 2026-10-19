const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
      index: true,
    },
    razorpaySignature: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true, // in currency units (INR)
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['CREATED', 'CAPTURED', 'FAILED', 'VERIFIED'],
      default: 'CREATED',
    },
    method: {
      type: String,
      default: 'card', // card, upi, netbanking, etc.
    },
    errorDetails: {
      code: String,
      description: String,
      source: String,
      step: String,
      reason: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
