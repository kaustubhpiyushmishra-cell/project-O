const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db/pool');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Socket.IO auth middleware — verifies JWT and checks banned status.
 * Attach to socket namespaces via: namespace.use(socketAuthMiddleware)
 */
async function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    
    // Check if user is banned
    const result = await pool.query(
      'SELECT is_banned FROM users WHERE id = $1',
      [payload.sub]
    );
    if (result.rows.length === 0) {
      return next(new Error('User not found'));
    }
    if (result.rows[0].is_banned) {
      return next(new Error('Account suspended'));
    }

    socket.userId = payload.sub;
    socket.userEmail = payload.email;
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
}

/**
 * Admin middleware — checks if the authenticated user's email
 * is in the ADMIN_EMAILS env variable (comma-separated list).
 * Must be used AFTER authMiddleware.
 */
function adminMiddleware(req, res, next) {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(req.user.email?.toLowerCase())) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authMiddleware, socketAuthMiddleware, adminMiddleware };
