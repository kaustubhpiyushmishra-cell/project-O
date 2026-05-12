const { Router } = require('express');

const router = Router();

router.use('/auth', require('./authRoutes'));
router.use('/user', require('./userRoutes'));
router.use('/match', require('./matchRoutes'));
router.use('/mentorship', require('./mentorshipRoutes'));
router.use('/session', require('./sessionRoutes'));
router.use('/rating', require('./ratingRoutes'));
router.use('/safety', require('./safetyRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/wallet', require('./walletRoutes'));

module.exports = router;
