const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config');
const { redis } = require('../db/redis');

const OTP_TTL = 300; // 5 minutes
const OTP_PREFIX = 'otp:';

function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

async function storeOTP(email, otp) {
  await redis.set(`${OTP_PREFIX}${email}`, otp, { EX: OTP_TTL });
}

async function verifyOTP(email, otp) {
  const stored = await redis.get(`${OTP_PREFIX}${email}`);
  if (!stored) return false;
  if (stored !== otp) return false;
  await redis.del(`${OTP_PREFIX}${email}`);
  return true;
}

async function sendOTPEmail(email, otp) {
  // In development, log OTP to console instead of sending email
  if (config.nodeEnv === 'development') {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"Project O" <${config.smtp.user}>`,
    to: email,
    subject: 'Your Project O Login Code',
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Your verification code</h2>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #D52518;">${otp}</p>
        <p>This code expires in 5 minutes.</p>
        <p style="color: #888;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { generateOTP, storeOTP, verifyOTP, sendOTPEmail };
