const { Router } = require('express');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');
const { getStats, getPendingMentors, mentorAction, getReports, reportAction } = require('../controllers/adminController');

const router = Router();

// All admin routes require authentication + admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', getStats);
router.get('/pending-mentors', getPendingMentors);
router.post('/mentor-action', mentorAction);
router.get('/reports', getReports);
router.post('/report-action', reportAction);

module.exports = router;
