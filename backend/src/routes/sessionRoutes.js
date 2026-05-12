const { Router } = require('express');
const { createSession, getSession, endSession, getHistory } = require('../controllers/sessionController');
const { authMiddleware } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createSessionSchema } = require('../validators');

const router = Router();

router.post('/create', authMiddleware, validate(createSessionSchema), createSession);
router.get('/history', authMiddleware, getHistory);
router.get('/:id', authMiddleware, getSession);
router.post('/:id/end', authMiddleware, endSession);

module.exports = router;
