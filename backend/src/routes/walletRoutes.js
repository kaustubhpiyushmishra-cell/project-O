const { Router } = require('express');
const { authMiddleware } = require('../middlewares/auth');
const { getBalance, getTransactions, addFunds } = require('../controllers/walletController');

const router = Router();

router.use(authMiddleware);

router.get('/balance', getBalance);
router.get('/transactions', getTransactions);
router.post('/add', addFunds);

module.exports = router;
