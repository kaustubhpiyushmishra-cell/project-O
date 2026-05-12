const pool = require('../db/pool');

// POST /mentorship/request
async function createRequest(req, res) {
  try {
    const { mentorId, message, topic } = req.body;
    if (!mentorId) {
      return res.status(400).json({ error: 'mentorId is required' });
    }

    if (mentorId === req.user.id) {
      return res.status(400).json({ error: 'Cannot request mentorship from yourself' });
    }

    // Check mentor exists
    const mentor = await pool.query('SELECT id FROM users WHERE id = $1 AND is_banned = FALSE', [mentorId]);
    if (mentor.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    const result = await pool.query(
      `INSERT INTO mentorship_requests (requester_id, mentor_id, message, topic)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, mentorId, message || null, topic || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('createRequest error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /mentorship/respond
async function respondToRequest(req, res) {
  try {
    const { requestId, action, scheduledAt } = req.body;
    if (!requestId || !['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'requestId and valid action (accepted/rejected) are required' });
    }

    // Only the mentor can respond
    const request = await pool.query(
      `SELECT * FROM mentorship_requests WHERE id = $1 AND mentor_id = $2 AND status = 'pending'`,
      [requestId, req.user.id]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found or not authorized' });
    }

    const updateFields = { status: action };
    let query = `UPDATE mentorship_requests SET status = $1`;
    const params = [action];
    let paramIdx = 2;

    if (action === 'accepted' && scheduledAt) {
      query += `, scheduled_at = $${paramIdx}`;
      params.push(scheduledAt);
      paramIdx++;
    }

    query += ` WHERE id = $${paramIdx} RETURNING *`;
    params.push(requestId);

    const result = await pool.query(query, params);

    // If accepted, increment mentor reputation
    if (action === 'accepted') {
      await pool.query('UPDATE users SET reputation = reputation + 1 WHERE id = $1', [req.user.id]);
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('respondToRequest error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /mentorship/list
async function listRequests(req, res) {
  try {
    const { role, status } = req.query;

    let query;
    const params = [req.user.id];

    if (role === 'mentor') {
      query = `SELECT mr.*, u.name as requester_name, u.college as requester_college
               FROM mentorship_requests mr
               JOIN users u ON u.id = mr.requester_id
               WHERE mr.mentor_id = $1`;
    } else {
      query = `SELECT mr.*, u.name as mentor_name, u.college as mentor_college
               FROM mentorship_requests mr
               JOIN users u ON u.id = mr.mentor_id
               WHERE mr.requester_id = $1`;
    }

    if (status) {
      query += ` AND mr.status = $2`;
      params.push(status);
    }

    query += ` ORDER BY mr.created_at DESC`;

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('listRequests error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createRequest, respondToRequest, listRequests };
