/**
 * Create Admin account securely.
 * Run with: npm run create-admin
 *
 * Usage:
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="admin@slicecraft.com" ADMIN_PASS="Admin@123" npm run create-admin
 *
 * Or it will use defaults below for development.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  try {
    await connectDB();

    const name = process.env.ADMIN_NAME || 'SliceCraft Admin';
    const email = (process.env.ADMIN_EMAIL || 'admin@slicecraft.com').toLowerCase().trim();
    const password = process.env.ADMIN_PASS || 'Admin@123';

    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`\n⚠️  Admin account already exists: ${email}\n`);
      } else {
        existing.role = 'admin';
        existing.isVerified = true;
        await existing.save();
        console.log(`\n✅ Existing user promoted to admin: ${email}\n`);
      }
      process.exit(0);
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true,
    });

    console.log(`\n✅ Admin account created successfully!`);
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log(`   Password: ${password}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Admin creation error:', error.message);
    process.exit(1);
  }
};

run();
