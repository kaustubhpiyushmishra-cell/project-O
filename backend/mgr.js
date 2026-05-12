require('dotenv').config();
const pool = require('./src/db/pool');

async function migrate() {
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE');
        console.log('Migration completed successfully.');
    } catch(e) {
        console.error('Migration failed:', e);
    } finally {
        process.exit(0);
    }
}
migrate();
