const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const User = require('../models/User');
const NotificationLog = require('../models/NotificationLog');
const { adjustStock } = require('../services/inventoryService');
const { checkAndAlertLowStock } = require('../services/cronService');
const { emitOrderStatusUpdate } = require('../config/socket');

// @desc    Get Admin Dashboard Summary Analytics
// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Order Received' });
    const kitchenOrders = await Order.countDocuments({ orderStatus: 'In Kitchen' });
    const deliveryOrders = await Order.countDocuments({ orderStatus: 'Sent to Delivery' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Low stock items count
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    });

    // Total revenue from Paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } },
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(6);

    // Current low-stock ingredients list
    const criticalInventory = await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        kitchenOrders,
        deliveryOrders,
        deliveredOrders,
        cancelledOrders,
        totalUsers,
        lowStockCount,
        totalRevenue,
      },
      recentOrders,
      criticalInventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders with filtering, pagination, and search
// @route   GET /api/admin/orders
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'deliveryAddress.fullName': { $regex: search, $options: 'i' } },
        { 'deliveryAddress.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page, 10),
      pages: Math.ceil(total / parseInt(limit, 10)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status with timeline tracking
// @route   PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Order updated to ${status} by Administrator`,
    });

    await order.save();

    // Broadcast real-time order update to user and admin rooms
    emitOrderStatusUpdate(order);

    res.status(200).json({
      success: true,
      message: `Order status successfully updated to '${status}'.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all inventory items with search & category filters
// @route   GET /api/admin/inventory
const getInventory = async (req, res, next) => {
  try {
    const { category, search, lowStockOnly } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.itemName = { $regex: search, $options: 'i' };
    }

    if (lowStockOnly === 'true') {
      filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }

    const inventory = await Inventory.find(filter)
      .populate('ingredient', 'name price image isAvailable')
      .sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually adjust stock quantity
// @route   POST /api/admin/inventory/:id/adjust
const adjustInventoryStock = async (req, res, next) => {
  try {
    const { delta, reason } = req.body;

    if (delta === undefined || isNaN(delta)) {
      return res.status(400).json({ success: false, message: 'Delta amount is required.' });
    }

    const updatedItem = await adjustStock(
      req.params.id,
      parseInt(delta, 10),
      reason || 'Admin Adjustment',
      req.user._id
    );

    res.status(200).json({
      success: true,
      message: `Stock updated successfully to ${updatedItem.quantity} ${updatedItem.unit}.`,
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item settings (threshold, unit)
// @route   PUT /api/admin/inventory/:id
const updateInventoryDetails = async (req, res, next) => {
  try {
    const { lowStockThreshold, unit } = req.body;
    const inv = await Inventory.findById(req.params.id);

    if (!inv) {
      return res.status(404).json({ success: false, message: 'Inventory item not found.' });
    }

    if (lowStockThreshold !== undefined) {
      inv.lowStockThreshold = Math.max(1, parseInt(lowStockThreshold, 10));
    }
    if (unit) {
      inv.unit = unit;
    }

    await inv.save();

    res.status(200).json({
      success: true,
      message: 'Inventory settings updated.',
      item: inv,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Inventory Transaction History
// @route   GET /api/admin/inventory/transactions
const getInventoryTransactions = async (req, res, next) => {
  try {
    const transactions = await InventoryTransaction.find()
      .populate('performedBy', 'name email')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Notification Logs (Email history)
// @route   GET /api/admin/notifications
const getNotificationLogs = async (req, res, next) => {
  try {
    const logs = await NotificationLog.find().sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger Manual Low-Stock Check & Dispatches Alert Email
// @route   POST /api/admin/inventory/check-low-stock
const triggerManualStockCheck = async (req, res, next) => {
  try {
    const result = await checkAndAlertLowStock(true); // force check
    res.status(200).json({
      success: true,
      message: result.message,
      count: result.count,
      items: result.items,
      emailResult: result.emailResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getInventory,
  adjustInventoryStock,
  updateInventoryDetails,
  getInventoryTransactions,
  getNotificationLogs,
  triggerManualStockCheck,
};
