const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  pizza: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza',
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    enum: ['Regular', 'Medium', 'Large'],
    default: 'Medium',
  },
  base: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  sauce: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  cheese: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
  },
  veggies: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ingredient', required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, default: 0 },
    },
  ],
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  itemPrice: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: 'Maharashtra' },
      postalCode: { type: String, required: true },
      instructions: { type: String, default: '' },
    },
    orderStatus: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Received',
      index: true,
    },
    statusHistory: [statusHistorySchema],
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay',
    },
    razorpayOrderId: {
      type: String,
      default: '',
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    stockDeducted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
