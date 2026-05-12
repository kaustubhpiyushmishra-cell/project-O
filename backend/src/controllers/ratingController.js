const pool = require('../db/pool');

// POST /rating/submit
async function submitRating(req, res) {
  try {
    const { sessionId, ratedId, score, comment } = req.body;

    if (!sessionId || !ratedId || !score) {
      return res.status(400).json({ error: 'sessionId, ratedId, and score are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Score must be between 1 and 5' });
    }

    if (ratedId === req.user.id) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }

    // Verify session exists and user was a participant
    const session = await pool.query(
      `SELECT * FROM sessions WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
      [sessionId, req.user.id]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or you were not a participant' });
    }

    // Insert rating
    const result = await pool.query(
      `INSERT INTO ratings (session_id, rater_id, rated_id, score, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sessionId, req.user.id, ratedId, score, comment || null]
    );

    // Update reputation: +1 for ratings >= 4
    if (score >= 4) {
      await pool.query('UPDATE users SET reputation = reputation + 1 WHERE id = $1', [ratedId]);
    }

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // unique violation
      return res.status(409).json({ error: 'You already rated this session' });
    }
    console.error('submitRating error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /rating/user/:id — get average rating for a user
async function getUserRatings(req, res) {
  try {
    const result = await pool.query(
      `SELECT
        COUNT(*)::INTEGER as total_ratings,
        ROUND(AVG(score), 2)::FLOAT as average_score,
        json_agg(json_build_object(
          'score', score, 'comment', comment, 'createdAt', created_at
        ) ORDER BY created_at DESC) as recent_ratings
       FROM ratings
       WHERE rated_id = $1`,
      [req.params.id]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('getUserRatings error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { submitRating, getUserRatings };
