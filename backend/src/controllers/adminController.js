const pool = require('../db/pool');
const { getSocket } = require('../services/matchingService');

// GET /admin/stats — aggregate dashboard stats
async function getStats(req, res) {
  try {
    const [mentors, reports, sessions, users] = await Promise.all([
      pool.query(`SELECT COUNT(*)::INTEGER as count FROM users WHERE mentor_status = 'pending'`),
      pool.query(`SELECT COUNT(*)::INTEGER as count FROM reports WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*)::INTEGER as count FROM sessions WHERE status = 'active'`),
      pool.query(`SELECT COUNT(*)::INTEGER as count FROM users WHERE is_banned = FALSE`),
    ]);

    return res.json({
      pendingMentors: mentors.rows[0].count,
      pendingReports: reports.rows[0].count,
      activeSessions: sessions.rows[0].count,
      totalUsers: users.rows[0].count,
    });
  } catch (err) {
    console.error('getStats error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /admin/pending-mentors — list users with mentor_status = 'pending'
async function getPendingMentors(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, college, branch, year, mentor_bio, mentor_rate, created_at
       FROM users
       WHERE mentor_status = 'pending'
       ORDER BY created_at ASC`
    );

    return res.json(result.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      college: u.college,
      branch: u.branch,
      year: u.year,
      mentorBio: u.mentor_bio,
      mentorRate: u.mentor_rate,
      createdAt: u.created_at,
    })));
  } catch (err) {
    console.error('getPendingMentors error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /admin/mentor-action — approve or reject a mentor application
async function mentorAction(req, res) {
  try {
    const { userId, action } = req.body;

    if (!userId || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'userId and action (approved/rejected) are required' });
    }

    const isMentor = action === 'approved';

    const result = await pool.query(
      `UPDATE users
       SET mentor_status = $1, is_mentor = $2
       WHERE id = $3 AND mentor_status = 'pending'
       RETURNING id, name, mentor_status, is_mentor`,
      [action, isMentor, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No pending application found for this user' });
    }

    // Notify user if online
    const userSocket = getSocket(userId);
    if (userSocket) {
      userSocket.emit('notification', {
        type: action === 'approved' ? 'success' : 'error',
        message: action === 'approved' 
          ? 'Congratulations! Your mentor application has been approved.' 
          : 'Your mentor application was not approved at this time.',
      });
    }

    return res.json({ message: `Mentor ${action}`, user: result.rows[0] });
  } catch (err) {
    console.error('mentorAction error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /admin/reports — list pending reports with reporter & reported user info
async function getReports(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.id, r.reason, r.status, r.created_at, r.session_id,
              reporter.name as reporter_name, reporter.email as reporter_email,
              reported.name as reported_name, reported.email as reported_email,
              reported.id as reported_id
       FROM reports r
       JOIN users reporter ON reporter.id = r.reporter_id
       JOIN users reported ON reported.id = r.reported_id
       WHERE r.status = 'pending'
       ORDER BY r.created_at ASC`
    );

    return res.json(result.rows.map(r => ({
      id: r.id,
      reason: r.reason,
      status: r.status,
      sessionId: r.session_id,
      reporterName: r.reporter_name,
      reporterEmail: r.reporter_email,
      reportedName: r.reported_name,
      reportedEmail: r.reported_email,
      reportedId: r.reported_id,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('getReports error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /admin/report-action — resolve, dismiss, or ban from report
async function reportAction(req, res) {
  try {
    const { reportId, action } = req.body;

    if (!reportId || !['resolved', 'dismissed'].includes(action)) {
      return res.status(400).json({ error: 'reportId and action (resolved/dismissed) are required' });
    }

    const result = await pool.query(
      `UPDATE reports SET status = $1 WHERE id = $2 AND status = 'pending' RETURNING *`,
      [action, reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found or already processed' });
    }

    // If resolved, ban the reported user if they have 3+ resolved reports
    if (action === 'resolved') {
      const reportedId = result.rows[0].reported_id;
      const countResult = await pool.query(
        `SELECT COUNT(*)::INTEGER as count FROM reports WHERE reported_id = $1 AND status = 'resolved'`,
        [reportedId]
      );
      if (countResult.rows[0].count >= 3) {
        await pool.query('UPDATE users SET is_banned = TRUE WHERE id = $1', [reportedId]);
      }
    }

    return res.json({ message: `Report ${action}`, report: result.rows[0] });
  } catch (err) {
    console.error('reportAction error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getStats, getPendingMentors, mentorAction, getReports, reportAction };
