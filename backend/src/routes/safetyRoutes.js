const { Router } = require('express');
const { reportUser, blockUser, unblockUser, listBlocked } = require('../controllers/safetyController');
const { authMiddleware } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { reportUserSchema, blockUserSchema } = require('../validators');

const router = Router();

router.post('/report', authMiddleware, validate(reportUserSchema), reportUser);
router.post('/block', authMiddleware, validate(blockUserSchema), blockUser);
router.delete('/block/:id', authMiddleware, unblockUser);
router.get('/blocked', authMiddleware, listBlocked);

module.exports = router;
