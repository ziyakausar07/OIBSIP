const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: true,
      unique: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['base', 'sauce', 'cheese', 'veggie'],
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      default: 'portions',
      enum: ['pieces', 'portions', 'grams', 'ml'],
    },
    lowStockThreshold: {
      type: Number,
      required: true,
      default: 20,
    },
    alertSent: {
      type: Boolean,
      default: false,
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
    lastRestockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

inventorySchema.virtual('isLowStock').get(function () {
  return this.quantity <= this.lowStockThreshold;
});

inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
