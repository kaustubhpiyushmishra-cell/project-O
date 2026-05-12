const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db/pool');
const { generateOTP, storeOTP, verifyOTP, sendOTPEmail } = require('../services/otpService');

/**
 * Validate email against college domain whitelist.
 * Returns true if domains list is empty (allow all) or email matches a listed domain.
 */
function isCollegeEmail(email) {
  const domains = config.collegeEmailDomains;
  if (!domains || domains.length === 0) return true; // no restriction

  const emailDomain = email.substring(email.indexOf('@') + 1).toLowerCase();
  return domains.some((d) => {
    const domain = d.trim().toLowerCase();
    // Support both 'kiit.ac.in' (exact) and '.edu' (suffix) formats
    if (domain.startsWith('.')) {
      return emailDomain.endsWith(domain);
    }
    return emailDomain === domain;
  });
}

// POST /auth/login — send OTP to email
async function login(req, res) {
  try {
    const { email } = req.body; // already validated + trimmed by Zod middleware

    if (!isCollegeEmail(email)) {
      return res.status(400).json({ error: 'Only college email addresses are allowed' });
    }

    const otp = generateOTP();
    await storeOTP(email, otp);
    await sendOTPEmail(email, otp);

    return res.json({ message: 'OTP sent to your email' });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /auth/verify — verify OTP, return JWT
async function verify(req, res) {
  try {
    const { email, otp } = req.body; // already validated by Zod middleware

    const valid = await verifyOTP(email, otp);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    // Upsert user — create if first login
    const upsertResult = await pool.query(
      `INSERT INTO users (email, is_verified)
       VALUES ($1, TRUE)
       ON CONFLICT (email)
       DO UPDATE SET is_verified = TRUE, updated_at = NOW()
       RETURNING id, email, name, college, branch, year, interests, reputation, is_verified, is_banned`,
      [email]
    );

    const user = upsertResult.rows[0];

    // Block banned users from getting a token
    if (user.is_banned) {
      return res.status(403).json({ error: 'Your account has been suspended due to policy violations' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        college: user.college,
        branch: user.branch,
        year: user.year,
        interests: user.interests,
        reputation: user.reputation,
        isVerified: user.is_verified,
        needsOnboarding: !user.name, // flag for frontend redirect
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { login, verify };
