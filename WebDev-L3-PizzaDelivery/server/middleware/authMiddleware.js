const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: requires valid JWT in Bearer token or cookie
 */
const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};

/**
 * Requires verified email before placing orders or performing user actions
 */
const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      isUnverified: true,
      message: 'Please verify your email address to access this feature.',
    });
  }

  next();
};

/**
 * Restricts access to Administrators only
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Administrator privileges required.',
    });
  }
  next();
};

module.exports = {
  protect,
  requireVerified,
  adminOnly,
};
