const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
    },
    itemName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['DEDUCTION', 'RESTOCK', 'ADJUSTMENT', 'INITIAL_SEED'],
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      default: '',
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
