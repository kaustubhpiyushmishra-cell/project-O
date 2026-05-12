const matchingService = require('../services/matchingService');

// POST /match/join
async function joinQueue(req, res) {
  try {
    const result = await matchingService.joinQueue(req.user.id);
    return res.json(result);
  } catch (err) {
    console.error('joinQueue error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /match/leave
async function leaveQueue(req, res) {
  try {
    const result = await matchingService.leaveQueue(req.user.id);
    return res.json(result);
  } catch (err) {
    console.error('leaveQueue error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /match/next
async function nextMatch(req, res) {
  try {
    const { sessionId } = req.body;
    const result = await matchingService.skipMatch(req.user.id, sessionId);
    return res.json(result);
  } catch (err) {
    console.error('nextMatch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { joinQueue, leaveQueue, nextMatch };
