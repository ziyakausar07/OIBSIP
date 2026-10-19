const nodemailer = require('nodemailer');
const { getTransporter } = require('../config/mailer');
const NotificationLog = require('../models/NotificationLog');

const FROM_EMAIL = process.env.SMTP_FROM || '"SliceCraft Pizza" <orders@slicecraftpizza.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Sends Email Verification Link to newly registered users
 */
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
  const subject = 'SliceCraft Pizza: Verify your email address';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #e11d48, #ea580c); padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">🍕 SliceCraft Pizza</h1>
        <p style="color: #fef2f2; margin: 8px 0 0 0; font-size: 15px;">Welcome to authentic wood-fired perfection!</p>
      </div>
      <div style="padding: 32px 28px; color: #1e293b;">
        <h2 style="font-size: 20px; color: #0f172a; margin-top: 0;">Hi ${user.name},</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Thank you for joining SliceCraft Pizza. Please confirm your email address to activate your account and start ordering custom artisan pizzas.
        </p>
        <div style="text-align: center; margin: 36px 0;">
          <a href="${verifyUrl}" style="background-color: #e11d48; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);">
            Verify My Email
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          Or copy and paste this link in your browser:<br/>
          <a href="${verifyUrl}" style="color: #ea580c; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This verification link expires in 24 hours. If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    type: 'EMAIL_VERIFICATION',
    to: user.email,
    subject,
    html,
    text: `Welcome to SliceCraft Pizza, ${user.name}! Please verify your email: ${verifyUrl}`,
    metadata: { userId: user._id, token },
  });
};

/**
 * Sends Password Reset link
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;
  const subject = 'SliceCraft Pizza: Reset your password';
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 28px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🍕 SliceCraft Pizza</h1>
        <p style="color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px;">Password Reset Request</p>
      </div>
      <div style="padding: 32px 28px; color: #1e293b;">
        <p style="font-size: 15px; line-height: 1.6; color: #475569;">
          Hello ${user.name}, we received a request to reset your password. Click the button below to choose a new password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #ea580c; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Link: <a href="${resetUrl}" style="color: #ea580c; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
        </p>
      </div>
    </div>
  `;

  return await dispatchEmail({
    type: 'PASSWORD_RESET',
    to: user.email,
    subject,
    html,
    text: `Hello ${user.name}, reset your password here: ${resetUrl}`,
    metadata: { userId: user._id, token },
  });
};

/**
 * Sends Automated Low-Stock Alert to configured Admin
 */
const sendLowStockAlert = async (lowStockItems) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@slicecraftpizza.com';
  const subject = `⚠️ URGENT: Low Stock Alert (${lowStockItems.length} ingredient${lowStockItems.length > 1 ? 's' : ''} below threshold)`;

  const itemsTableRows = lowStockItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #fee2e2;">
        <td style="padding: 12px 14px; font-weight: 600; color: #0f172a;">${item.itemName}</td>
        <td style="padding: 12px 14px; text-transform: capitalize; color: #64748b;">${item.category}</td>
        <td style="padding: 12px 14px; color: #e11d48; font-weight: 700;">${item.quantity} ${item.unit}</td>
        <td style="padding: 12px 14px; color: #475569;">${item.lowStockThreshold} ${item.unit}</td>
        <td style="padding: 12px 14px; color: #0284c7; font-size: 13px;">Restock immediately</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #fecaca; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #e11d48; padding: 24px; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 22px;">⚠️ SliceCraft Inventory Alert</h2>
        <p style="color: #fee2e2; margin: 6px 0 0 0; font-size: 14px;">Ingredients reached or fallen below safety stock thresholds</p>
      </div>
      <div style="padding: 24px;">
        <p style="color: #334155; font-size: 15px; margin-top: 0;">
          The automated inventory monitoring scheduled job detected the following items requiring immediate restocking to prevent order fulfillment disruption:
        </p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; text-align: left; font-size: 14px;">
          <thead>
            <tr style="background-color: #fff1f2; color: #9f1239;">
              <th style="padding: 10px 14px; border-radius: 6px 0 0 0;">Item Name</th>
              <th style="padding: 10px 14px;">Category</th>
              <th style="padding: 10px 14px;">Current Stock</th>
              <th style="padding: 10px 14px;">Threshold</th>
              <th style="padding: 10px 14px; border-radius: 0 6px 0 0;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTableRows}
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 28px;">
          <a href="${CLIENT_URL}/admin/inventory" style="background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
            Open Admin Inventory Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  return await dispatchEmail({
    type: 'LOW_STOCK_ALERT',
    to: adminEmail,
    subject,
    html,
    text: `Low stock alert: ${lowStockItems.map((i) => `${i.itemName}: ${i.quantity}/${i.lowStockThreshold} ${i.unit}`).join(', ')}`,
    metadata: { itemsCount: lowStockItems.length },
  });
};

/**
 * Internal mail dispatcher with logging to NotificationLog
 */
const dispatchEmail = async ({ type, to, subject, html, text, metadata = {} }) => {
  let log = new NotificationLog({
    type,
    recipient: to,
    subject,
    contentSnippet: text ? text.substring(0, 160) : '',
    status: 'PENDING',
    metadata,
  });

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });

    log.status = 'SENT';
    await log.save();

    // Check for Ethereal preview link
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Preview URL]: ${previewUrl}`);
      log.metadata = { ...log.metadata, previewUrl };
      await log.save();
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Email Dispatch Error]: ${error.message}`);
    log.status = 'FAILED';
    log.error = error.message;
    await log.save();
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlert,
  dispatchEmail,
};
