const pool = require('../db/pool');

// POST /safety/report
async function reportUser(req, res) {
  try {
    const { reportedId, reason, sessionId } = req.body;

    if (!reportedId || !reason) {
      return res.status(400).json({ error: 'reportedId and reason are required' });
    }

    if (reportedId === req.user.id) {
      return res.status(400).json({ error: 'Cannot report yourself' });
    }

    const result = await pool.query(
      `INSERT INTO reports (reporter_id, reported_id, reason, session_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, reportedId, reason, sessionId || null]
    );

    // Auto-ban check: if user has 5+ pending reports, ban them
    const reportCount = await pool.query(
      `SELECT COUNT(*)::INTEGER as count FROM reports
       WHERE reported_id = $1 AND status = 'pending'`,
      [reportedId]
    );

    if (reportCount.rows[0].count >= 5) {
      await pool.query('UPDATE users SET is_banned = TRUE WHERE id = $1', [reportedId]);
    }

    return res.status(201).json({ message: 'Report submitted', report: result.rows[0] });
  } catch (err) {
    console.error('reportUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /safety/block
async function blockUser(req, res) {
  try {
    const { blockedId } = req.body;

    if (!blockedId) {
      return res.status(400).json({ error: 'blockedId is required' });
    }

    if (blockedId === req.user.id) {
      return res.status(400).json({ error: 'Cannot block yourself' });
    }

    await pool.query(
      `INSERT INTO blocked_users (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [req.user.id, blockedId]
    );

    return res.json({ message: 'User blocked' });
  } catch (err) {
    console.error('blockUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /safety/block/:id — unblock
async function unblockUser(req, res) {
  try {
    await pool.query(
      `DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2`,
      [req.user.id, req.params.id]
    );
    return res.json({ message: 'User unblocked' });
  } catch (err) {
    console.error('unblockUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /safety/blocked — list blocked users
async function listBlocked(req, res) {
  try {
    const result = await pool.query(
      `SELECT bu.blocked_id, u.name, u.college, bu.created_at
       FROM blocked_users bu
       JOIN users u ON u.id = bu.blocked_id
       WHERE bu.blocker_id = $1
       ORDER BY bu.created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('listBlocked error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { reportUser, blockUser, unblockUser, listBlocked };
