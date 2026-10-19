const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOW_STOCK_ALERT', 'ORDER_CONFIRMATION', 'ORDER_STATUS_UPDATE', 'EMAIL_VERIFICATION', 'PASSWORD_RESET'],
      required: true,
      index: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    contentSnippet: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['SENT', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    error: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
