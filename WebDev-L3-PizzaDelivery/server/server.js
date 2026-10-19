require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { initCronJobs } = require('./services/cronService');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/authRoutes');
const pizzaRoutes = require('./routes/pizzaRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing — webhook route needs raw body so it's handled in paymentRoutes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5050;

const start = async () => {
  await connectDB();

  // Initialize Socket.IO
  initSocket(server);

  // Initialize scheduled cron jobs
  initCronJobs();

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  Port ${PORT} is momentarily busy. Retrying in 1s...`);
      setTimeout(() => {
        try {
          server.close();
        } catch (_) {}
        server.listen(PORT);
      }, 1000);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(PORT, () => {
    console.log(`\n🍕 SliceCraft Pizza Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Client URL:  ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
  });
};

const shutdown = () => {
  try {
    server.close(() => process.exit(0));
  } catch (_) {
    process.exit(0);
  }
  setTimeout(() => process.exit(0), 1000).unref();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
