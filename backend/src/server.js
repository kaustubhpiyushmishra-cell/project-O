const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const config = require('./config');
const { connectRedis } = require('./db/redis');
const pool = require('./db/pool');
const routes = require('./routes');
const { generalLimiter } = require('./middlewares/rateLimiter');
const initMatchSocket = require('./sockets/matchSocket');
const initSignalingSocket = require('./sockets/signalingSocket');

const helmet = require('helmet');
const hpp = require('hpp');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// --- Global Security Middlewares ---
app.use(helmet()); // Basic security headers
app.use(hpp());    // Prevent HTTP parameter pollution

// Specialized Helmet config for development/modern apps
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "connect-src": ["'self'", config.cors.origin, "ws:", "wss:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:", "blob:"],
      "upgrade-insecure-requests": [],
    },
  })
);

app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json());
app.use(generalLimiter);

// Request logging in dev
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// --- Routes ---
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// --- WebSocket namespaces ---
initMatchSocket(io);
initSignalingSocket(io);

// --- Start ---
async function start() {
  try {
    // Test PostgreSQL connection
    const pgResult = await pool.query('SELECT NOW()');
    console.log('✓ PostgreSQL connected:', pgResult.rows[0].now);

    // Connect Redis
    await connectRedis();

    server.listen(config.port, () => {
      console.log(`\n🚀 Project O Backend running on port ${config.port}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Health: http://localhost:${config.port}/health`);
      console.log(`   API:    http://localhost:${config.port}/api`);
      console.log(`   WS:     ws://localhost:${config.port}/match`);
      console.log(`   WS:     ws://localhost:${config.port}/signaling\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = { app, server, io };
