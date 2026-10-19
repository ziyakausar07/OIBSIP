const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  adjustInventoryStock,
  updateInventoryDetails,
  getInventoryTransactions,
  getNotificationLogs,
  triggerManualStockCheck,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/inventory', getInventory);
router.put('/inventory/:id', updateInventoryDetails);
router.post('/inventory/:id/adjust', adjustInventoryStock);
router.get('/inventory/transactions', getInventoryTransactions);
router.get('/notifications', getNotificationLogs);
router.post('/inventory/check-low-stock', triggerManualStockCheck);

module.exports = router;
