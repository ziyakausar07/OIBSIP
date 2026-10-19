const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        socket.user = decoded;
      } catch (err) {
        // Continue unauthenticated, but socket.user will be undefined
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    // Join user-specific room if logged in
    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
      if (socket.user.role === 'admin') {
        socket.join('admin_room');
      }
    }

    // Allow subscribing to specific order updates
    socket.on('join_order', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    socket.on('leave_order', (orderId) => {
      if (orderId) {
        socket.leave(`order_${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitOrderStatusUpdate = (order) => {
  if (!io || !order) return;
  const payload = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    statusHistory: order.statusHistory,
    updatedAt: new Date(),
  };

  // Emit to specific order room
  io.to(`order_${order._id}`).emit('order_status_changed', payload);

  // Emit to user room
  if (order.user) {
    const userId = typeof order.user === 'object' ? order.user._id : order.user;
    io.to(`user_${userId}`).emit('order_status_changed', payload);
  }

  // Emit to admin dashboard
  io.to('admin_room').emit('order_status_changed', payload);
};

const emitNewOrderToAdmin = (order) => {
  if (!io || !order) return;
  io.to('admin_room').emit('new_order_placed', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    total: order.pricing?.total,
    customerName: order.deliveryAddress?.fullName,
    itemsCount: order.items?.length,
    createdAt: order.createdAt,
  });
};

const emitInventoryUpdated = (item) => {
  if (!io || !item) return;
  io.to('admin_room').emit('inventory_updated', {
    itemId: item._id,
    itemName: item.itemName,
    category: item.category,
    quantity: item.quantity,
    isLowStock: item.quantity <= item.lowStockThreshold,
  });
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdate,
  emitNewOrderToAdmin,
  emitInventoryUpdated,
};
