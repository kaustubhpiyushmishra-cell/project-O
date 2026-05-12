const { Router } = require('express');
const { submitRating, getUserRatings } = require('../controllers/ratingController');
const { authMiddleware } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { submitRatingSchema } = require('../validators');

const router = Router();

router.post('/submit', authMiddleware, validate(submitRatingSchema), submitRating);
router.get('/user/:id', authMiddleware, getUserRatings);

module.exports = router;
