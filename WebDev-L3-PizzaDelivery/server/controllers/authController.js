const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailVerificationToken = require('../models/EmailVerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Role cannot be set to 'admin' during registration
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: 'user',
      isVerified: false,
    });

    // Create Email Verification Token (valid for 24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.create({
      user: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Dispatch verification email
    const emailResult = await sendVerificationEmail(user, verificationToken);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      previewUrl: emailResult?.previewUrl || null,
      verificationTokenDev: process.env.NODE_ENV !== 'production' ? verificationToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user / admin
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        defaultAddress: user.defaultAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify customer email address
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required.' });
    }

    const record = await EmailVerificationToken.findOne({ token });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired. Please request a new verification email.',
      });
    }

    const user = await User.findById(record.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isVerified = true;
    await user.save();

    await EmailVerificationToken.deleteMany({ user: user._id });

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! You can now place orders.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend email verification
// @route   POST /api/auth/resend-verification
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'This email is already verified.' });
    }

    await EmailVerificationToken.deleteMany({ user: user._id });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await EmailVerificationToken.create({
      user: user._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const emailResult = await sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      success: true,
      message: 'A fresh verification email has been sent.',
      previewUrl: emailResult?.previewUrl || null,
      verificationTokenDev: process.env.NODE_ENV !== 'production' ? verificationToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Security: Don't disclose if account exists
      return res.status(200).json({
        success: true,
        message: 'If an account matches that email address, a password reset link has been dispatched.',
      });
    }

    // Invalidate previous reset tokens
    await PasswordResetToken.deleteMany({ user: user._id });

    const resetToken = crypto.randomBytes(32).toString('hex');
    await PasswordResetToken.create({
      user: user._id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const emailResult = await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent! Please check your email.',
      previewUrl: emailResult?.previewUrl || null,
      resetTokenDev: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const record = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, expired, or already used.',
      });
    }

    const user = await User.findById(record.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    record.used = true;
    await record.save();

    res.status(200).json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        defaultAddress: user.defaultAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & address
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, defaultAddress } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (defaultAddress) {
      user.defaultAddress = {
        street: defaultAddress.street || '',
        city: defaultAddress.city || '',
        state: defaultAddress.state || '',
        postalCode: defaultAddress.postalCode || '',
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        defaultAddress: user.defaultAddress,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
};
