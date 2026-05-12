const pool = require('../db/pool');

// GET /wallet/balance
async function getBalance(req, res) {
  try {
    const result = await pool.query(
      'SELECT wallet_balance FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ balance: result.rows[0].wallet_balance || 0 });
  } catch (err) {
    console.error('getBalance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /wallet/transactions
async function getTransactions(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `SELECT id, type, amount, description, ref_id, created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*)::INTEGER as total FROM transactions WHERE user_id = $1',
      [req.user.id]
    );

    return res.json({
      transactions: result.rows.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        refId: t.ref_id,
        createdAt: t.created_at,
      })),
      total: countResult.rows[0].total,
    });
  } catch (err) {
    console.error('getTransactions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /wallet/add — simulated fund addition
async function addFunds(req, res) {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0 || amount > 50000) {
      return res.status(400).json({ error: 'Amount must be between 1 and 50000' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update balance
      const balResult = await client.query(
        'UPDATE users SET wallet_balance = COALESCE(wallet_balance, 0) + $1 WHERE id = $2 RETURNING wallet_balance',
        [amount, req.user.id]
      );

      // Record transaction
      await client.query(
        `INSERT INTO transactions (user_id, type, amount, description)
         VALUES ($1, 'credit', $2, 'Wallet top-up')`,
        [req.user.id, amount]
      );

      await client.query('COMMIT');

      return res.json({
        message: 'Funds added successfully',
        balance: balResult.rows[0].wallet_balance,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('addFunds error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { getBalance, getTransactions, addFunds };
