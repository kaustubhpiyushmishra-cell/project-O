const { v4: uuidv4 } = require('uuid');
const pool = require('../db/pool');

// POST /session/create
async function createSession(req, res) {
  try {
    const { userId2, type, mentorshipId } = req.body;
    if (!userId2 || !type) {
      return res.status(400).json({ error: 'userId2 and type are required' });
    }

    if (!['casual', 'mentorship'].includes(type)) {
      return res.status(400).json({ error: 'type must be casual or mentorship' });
    }

    // Prevent duplicate sessions for the same mentorship request
    if (type === 'mentorship' && mentorshipId) {
      const existing = await pool.query(
        `SELECT * FROM sessions WHERE mentorship_id = $1 AND status = 'active'`,
        [mentorshipId]
      );
      if (existing.rows.length > 0) {
        return res.status(200).json(existing.rows[0]);
      }
    }

    const sessionId = uuidv4();
    const result = await pool.query(
      `INSERT INTO sessions (id, user1_id, user2_id, type, mentorship_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, req.user.id, userId2, type, mentorshipId || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createSession error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /session/:id
async function getSession(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.*,
              u1.name as user1_name, u1.college as user1_college,
              u2.name as user2_name, u2.college as user2_college
       FROM sessions s
       JOIN users u1 ON u1.id = s.user1_id
       JOIN users u2 ON u2.id = s.user2_id
       WHERE s.id = $1 AND (s.user1_id = $2 OR s.user2_id = $2)`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('getSession error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /session/:id/end
async function endSession(req, res) {
  try {
    const result = await pool.query(
      `UPDATE sessions
       SET status = 'ended', ended_at = NOW(),
           duration_sec = EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER
       WHERE id = $1 AND (user1_id = $2 OR user2_id = $2) AND status = 'active'
       RETURNING *`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('endSession error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /session/history — user's past sessions
async function getHistory(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT s.id, s.type, s.status, s.started_at, s.ended_at, s.duration_sec,
              CASE WHEN s.user1_id = $1 THEN u2.id ELSE u1.id END as partner_id,
              CASE WHEN s.user1_id = $1 THEN u2.name ELSE u1.name END as partner_name,
              CASE WHEN s.user1_id = $1 THEN u2.college ELSE u1.college END as partner_college,
              (SELECT score FROM ratings WHERE session_id = s.id AND rater_id = $1) as my_rating,
              (SELECT score FROM ratings WHERE session_id = s.id AND rated_id = $1) as received_rating
       FROM sessions s
       JOIN users u1 ON u1.id = s.user1_id
       JOIN users u2 ON u2.id = s.user2_id
       WHERE (s.user1_id = $1 OR s.user2_id = $1)
       ORDER BY s.started_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    return res.json(result.rows.map(s => ({
      id: s.id,
      type: s.type,
      status: s.status,
      startedAt: s.started_at,
      endedAt: s.ended_at,
      durationSec: s.duration_sec,
      partnerId: s.partner_id,
      partnerName: s.partner_name,
      partnerCollege: s.partner_college,
      myRating: s.my_rating,
      receivedRating: s.received_rating,
    })));
  } catch (err) {
    console.error('getHistory error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createSession, getSession, endSession, getHistory };
