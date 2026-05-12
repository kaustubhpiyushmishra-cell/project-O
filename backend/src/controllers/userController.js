const pool = require('../db/pool');
const { redis } = require('../db/redis');

const PRESENCE_PREFIX = 'match:presence:';

// GET /user/profile
async function getProfile(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, email, name, college, branch, year, interests, reputation, is_verified, is_mentor, mentor_status, mentor_rate, mentor_bio, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      college: u.college,
      branch: u.branch,
      year: u.year,
      interests: u.interests,
      reputation: u.reputation,
      isVerified: u.is_verified,
      isMentor: u.is_mentor,
      mentorStatus: u.mentor_status,
      mentorRate: u.mentor_rate,
      mentorBio: u.mentor_bio,
      createdAt: u.created_at,
    });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /user/profile
async function updateProfile(req, res) {
  try {
    const { name, college, branch, year, interests } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           college = COALESCE($2, college),
           branch = COALESCE($3, branch),
           year = COALESCE($4, year),
           interests = COALESCE($5, interests)
       WHERE id = $6
       RETURNING id, email, name, college, branch, year, interests, reputation, is_verified`,
      [name, college, branch, year, interests, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      college: u.college,
      branch: u.branch,
      year: u.year,
      interests: u.interests,
      reputation: u.reputation,
      isVerified: u.is_verified,
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /user/profile/complete
async function completeProfile(req, res) {
  try {
    const { name, college, branch, year, interests } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = $1, college = $2, branch = $3, year = $4, interests = COALESCE($5, interests)
       WHERE id = $6
       RETURNING id, email, name, college, branch, year, interests, reputation, is_verified, is_mentor, mentor_status, mentor_rate, mentor_bio`,
      [name, college, branch, year, interests, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    return res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      college: u.college,
      branch: u.branch,
      year: u.year,
      interests: u.interests,
      reputation: u.reputation,
      isVerified: u.is_verified,
      isMentor: u.is_mentor,
      mentorStatus: u.mentor_status,
      mentorRate: u.mentor_rate,
      mentorBio: u.mentor_bio,
    });
  } catch (err) {
    console.error('completeProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /user/mentors
const MENTOR_CACHE_KEY = 'cache:mentors:all';
const MENTOR_CACHE_TTL = 60; // seconds

async function listMentors(req, res) {
  try {
    const { search, domain } = req.query;
    const isUnfiltered = !search && !domain;

    // Serve from cache for unfiltered requests
    if (isUnfiltered) {
      const cached = await redis.get(MENTOR_CACHE_KEY);
      if (cached) {
        const mentors = JSON.parse(cached);
        // Refresh online status (fast: only Redis reads)
        const refreshed = await Promise.all(mentors.map(async (m) => {
          const presence = await redis.get(`${PRESENCE_PREFIX}${m.id}`);
          return { ...m, isOnline: !!presence };
        }));
        return res.json(refreshed);
      }
    }

    // We only list approved mentors
    let query = `
      SELECT id, name, college, branch, year, interests, reputation, mentor_rate, mentor_bio
      FROM users
      WHERE is_mentor = TRUE AND mentor_status = 'approved' AND is_banned = FALSE
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR mentor_bio ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (domain) {
      query += ` AND $${paramIndex} = ANY(interests)`;
      params.push(domain);
      paramIndex++;
    }

    query += ` ORDER BY reputation DESC LIMIT 50`;

    const result = await pool.query(query, params);
    
    // Check online status for each mentor
    const mentors = await Promise.all(result.rows.map(async (u) => {
      const presence = await redis.get(`${PRESENCE_PREFIX}${u.id}`);
      return {
        id: u.id,
        name: u.name,
        college: u.college,
        branch: u.branch,
        year: u.year,
        interests: u.interests,
        reputation: u.reputation,
        mentorRate: u.mentor_rate,
        mentorBio: u.mentor_bio,
        isOnline: !!presence,
      };
    }));

    // Cache unfiltered results (without isOnline — refreshed on read)
    if (isUnfiltered) {
      const toCache = mentors.map(({ isOnline, ...rest }) => rest);
      await redis.set(MENTOR_CACHE_KEY, JSON.stringify(toCache), { EX: MENTOR_CACHE_TTL });
    }
    
    return res.json(mentors);
  } catch (err) {
    console.error('listMentors error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /user/mentor-apply
async function applyForMentor(req, res) {
  try {
    const { mentor_bio, mentor_rate } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET mentor_status = 'pending', mentor_bio = $1, mentor_rate = $2
       WHERE id = $3 AND (mentor_status IS NULL OR mentor_status = 'rejected')
       RETURNING id, mentor_status`
      , [mentor_bio, mentor_rate, req.user.id]
    );

    if (result.rows.length === 0) {
      // Find out why
      const check = await pool.query('SELECT mentor_status, is_mentor FROM users WHERE id = $1', [req.user.id]);
      if (check.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      
      const { mentor_status, is_mentor } = check.rows[0];
      if (is_mentor) return res.status(400).json({ error: 'Already a mentor' });
      if (mentor_status === 'pending') return res.status(400).json({ error: 'Application already pending' });
      if (mentor_status === 'approved') return res.status(400).json({ error: 'Already approved' });
    }

    return res.json({ message: 'Mentor application submitted successfully' });
  } catch (err) {
    console.error('applyForMentor error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /user/:id — public profile
async function getPublicProfile(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, name, college, branch, year, interests, reputation, is_mentor, mentor_status, mentor_rate, mentor_bio
       FROM users WHERE id = $1 AND is_banned = FALSE`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = result.rows[0];
    const presence = await redis.get(`${PRESENCE_PREFIX}${u.id}`);
    
    return res.json({
      id: u.id,
      name: u.name,
      college: u.college,
      branch: u.branch,
      year: u.year,
      interests: u.interests,
      reputation: u.reputation,
      isMentor: u.is_mentor,
      mentorStatus: u.mentor_status,
      mentorRate: u.mentor_rate,
      mentorBio: u.mentor_bio,
      isOnline: !!presence,
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getProfile, updateProfile, getPublicProfile, completeProfile, listMentors, applyForMentor };
