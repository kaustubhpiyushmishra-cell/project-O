const { Router } = require('express');
const { login, verify } = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { loginSchema, verifySchema } = require('../validators');

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/verify', authLimiter, validate(verifySchema), verify);

module.exports = router;
