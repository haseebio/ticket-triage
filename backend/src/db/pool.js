const { Pool } = require('pg');
const env = require('../config/env');

const pool = new Pool({
  connectionString: env.databaseUrl,
  // Neon and most hosted Postgres providers require TLS; disabled automatically for local dev.
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  // A background/idle client error should never crash the whole process.
  console.error('Unexpected Postgres pool error:', err.message);
});

module.exports = pool;
