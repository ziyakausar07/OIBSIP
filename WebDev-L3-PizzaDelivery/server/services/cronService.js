const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendLowStockAlert } = require('./emailService');

let cronJob = null;

/**
 * Core low-stock check logic. Can be invoked on schedule or on demand.
 */
const checkAndAlertLowStock = async (forceAlert = false) => {
  try {
    const query = {
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    };

    if (!forceAlert) {
      query.alertSent = false;
    }

    const lowStockItems = await Inventory.find(query);

    if (lowStockItems.length === 0) {
      return {
        count: 0,
        items: [],
        message: 'All inventory items are currently above their safety thresholds.',
      };
    }

    // Send email alert to admin
    const emailResult = await sendLowStockAlert(lowStockItems);

    // Update alertSent to true to avoid spamming the admin
    const ids = lowStockItems.map((item) => item._id);
    await Inventory.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          alertSent: true,
          lastAlertSentAt: new Date(),
        },
      }
    );

    console.log(`[Low-Stock Cron] Alert dispatched for ${lowStockItems.length} items.`);

    return {
      count: lowStockItems.length,
      items: lowStockItems,
      emailResult,
      message: `Alert sent for ${lowStockItems.length} low-stock item(s).`,
    };
  } catch (error) {
    console.error(`[Low-Stock Cron Error]: ${error.message}`);
    throw error;
  }
};

/**
 * Initializes the node-cron scheduled task
 */
const initCronJobs = () => {
  const schedule = process.env.LOW_STOCK_CRON_SCHEDULE || '*/15 * * * *';

  cronJob = cron.schedule(schedule, async () => {
    console.log(`[Cron] Running scheduled low-stock inventory check... (${new Date().toLocaleTimeString()})`);
    try {
      await checkAndAlertLowStock(false);
    } catch (err) {
      console.error('[Cron] Error running low-stock check:', err.message);
    }
  });

  console.log(`[Cron] Low-stock monitor scheduled with pattern: "${schedule}"`);
  return cronJob;
};

module.exports = {
  initCronJobs,
  checkAndAlertLowStock,
};
