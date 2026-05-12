const { Router } = require('express');
const { joinQueue, leaveQueue, nextMatch } = require('../controllers/matchController');
const { authMiddleware } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { nextMatchSchema } = require('../validators');

const router = Router();

router.post('/join', authMiddleware, joinQueue);
router.post('/leave', authMiddleware, leaveQueue);
router.post('/next', authMiddleware, validate(nextMatchSchema), nextMatch);

module.exports = router;
