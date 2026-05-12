const { Router } = require('express');
const { getProfile, updateProfile, getPublicProfile, completeProfile, listMentors, applyForMentor } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateProfileSchema, completeProfileSchema, mentorApplySchema, listMentorsSchema } = require('../validators');

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), updateProfile);
router.post('/profile/complete', authMiddleware, validate(completeProfileSchema), completeProfile);

router.get('/mentors', authMiddleware, validate(listMentorsSchema, 'query'), listMentors);
router.post('/mentor-apply', authMiddleware, validate(mentorApplySchema), applyForMentor);

router.get('/:id', authMiddleware, getPublicProfile);

module.exports = router;
