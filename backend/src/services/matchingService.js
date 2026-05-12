const { v4: uuidv4 } = require('uuid');
const { redis } = require('../db/redis');
const pool = require('../db/pool');

const QUEUE_KEY = 'match:queue';
const PRESENCE_PREFIX = 'match:presence:';
const SESSION_PREFIX = 'match:session:';
const PRESENCE_TTL = 300; // 5 minutes

// Track user's socket for emitting events
const userSockets = new Map(); // userId -> socket

function registerSocket(userId, socket) {
  userSockets.set(userId, socket);
}

function unregisterSocket(userId) {
  userSockets.delete(userId);
}

function getSocket(userId) {
  return userSockets.get(userId);
}

// Set user as online
async function setPresence(userId) {
  await redis.set(`${PRESENCE_PREFIX}${userId}`, 'online', { EX: PRESENCE_TTL });
}

// Remove user presence
async function removePresence(userId) {
  await redis.del(`${PRESENCE_PREFIX}${userId}`);
}

// Get list of users this user has blocked (or has been blocked by)
async function getBlockedSet(userId) {
  const result = await pool.query(
    `SELECT blocked_id FROM blocked_users WHERE blocker_id = $1
     UNION
     SELECT blocker_id FROM blocked_users WHERE blocked_id = $1`,
    [userId]
  );
  return new Set(result.rows.map(r => r.blocked_id || r.blocker_id));
}

// Get the partner from a Redis session
async function getSessionPartner(sessionId, userId) {
  const session = await redis.hGetAll(`${SESSION_PREFIX}${sessionId}`);
  if (!session || (!session.user1 && !session.user2)) return null;
  const partnerId = session.user1 === userId ? session.user2 : session.user1;
  return { partnerId };
}

// Join queue and attempt immediate match
async function joinQueue(userId) {
  await setPresence(userId);

  // Check if user is already in queue
  const queue = await redis.lRange(QUEUE_KEY, 0, -1);
  if (queue.includes(userId)) {
    return { status: 'already_in_queue' };
  }

  const blockedSet = await getBlockedSet(userId);

  // Try to match with someone already in queue
  for (let i = 0; i < queue.length; i++) {
    const candidateId = queue[i];
    if (blockedSet.has(candidateId)) continue;

    // Check candidate is still present
    const isOnline = await redis.get(`${PRESENCE_PREFIX}${candidateId}`);
    if (!isOnline) {
      await redis.lRem(QUEUE_KEY, 1, candidateId);
      continue;
    }

    // Match found — remove candidate from queue (atomic check)
    const removed = await redis.lRem(QUEUE_KEY, 1, candidateId);
    if (removed === 0) continue; // race condition: someone else matched them

    const sessionId = uuidv4();

    // Store session in Redis for quick lookup
    await redis.hSet(`${SESSION_PREFIX}${sessionId}`, {
      user1: userId,
      user2: candidateId,
      startedAt: Date.now().toString(),
    });
    await redis.expire(`${SESSION_PREFIX}${sessionId}`, 3600); // 1h TTL

    // Store session in PostgreSQL
    await pool.query(
      `INSERT INTO sessions (id, user1_id, user2_id, type, status)
       VALUES ($1, $2, $3, 'casual', 'active')`,
      [sessionId, userId, candidateId]
    );

    return { status: 'matched', sessionId, partnerId: candidateId };
  }

  // No match found — add to queue
  await redis.rPush(QUEUE_KEY, userId);
  return { status: 'queued' };
}

// Leave queue
async function leaveQueue(userId) {
  await redis.lRem(QUEUE_KEY, 0, userId);
  await removePresence(userId);
  return { status: 'left' };
}

// Skip current match and re-queue
async function skipMatch(userId, currentSessionId) {
  // End current session
  if (currentSessionId) {
    await redis.del(`${SESSION_PREFIX}${currentSessionId}`);
    await pool.query(
      `UPDATE sessions SET status = 'ended', ended_at = NOW(),
       duration_sec = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
       WHERE id = $1`,
      [currentSessionId]
    );
  }

  // Re-join queue
  return joinQueue(userId);
}

// Cleanup on disconnect
async function handleDisconnect(userId, currentSessionId) {
  await leaveQueue(userId);
  if (currentSessionId) {
    await redis.del(`${SESSION_PREFIX}${currentSessionId}`);
    await pool.query(
      `UPDATE sessions SET status = 'ended', ended_at = NOW(),
       duration_sec = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
       WHERE id = $1 AND status = 'active'`,
      [currentSessionId]
    );
  }
  unregisterSocket(userId);
}

module.exports = {
  joinQueue,
  leaveQueue,
  skipMatch,
  handleDisconnect,
  registerSocket,
  unregisterSocket,
  getSocket,
  setPresence,
  getSessionPartner,
};
