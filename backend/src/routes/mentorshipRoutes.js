const { Router } = require('express');
const { createRequest, respondToRequest, listRequests } = require('../controllers/mentorshipController');
const { authMiddleware } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { createMentorshipSchema, respondMentorshipSchema } = require('../validators');

const router = Router();

router.post('/request', authMiddleware, validate(createMentorshipSchema), createRequest);
router.post('/respond', authMiddleware, validate(respondMentorshipSchema), respondToRequest);
router.get('/list', authMiddleware, listRequests);

module.exports = router;
