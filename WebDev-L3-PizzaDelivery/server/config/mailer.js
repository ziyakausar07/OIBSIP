const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  if (user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    console.log(`[Mailer] Configured custom SMTP (${host}:${port})`);
  } else {
    // Generate an automatic Ethereal test account for dev/testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Mailer] Test Ethereal account generated: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Mailer] Could not create Ethereal account, falling back to console transport:', err.message);
      // Fallback pseudo transporter
      transporter = {
        sendMail: async (opts) => {
          console.log('\n--- [EMAIL DISPATCHED (CONSOLE FALLBACK)] ---');
          console.log(`To: ${opts.to}`);
          console.log(`Subject: ${opts.subject}`);
          console.log(`Content:\n${opts.text || opts.html}`);
          console.log('---------------------------------------------\n');
          return { messageId: `msg_${Date.now()}` };
        },
      };
    }
  }

  return transporter;
};

module.exports = { getTransporter };
