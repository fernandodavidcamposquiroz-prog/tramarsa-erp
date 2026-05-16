const { Pool } = require('pg');
const config = require('./env');

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : config.db;

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  if (config.nodeEnv !== 'production') {
    console.log('[DB] Conexión PostgreSQL establecida');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado:', err.message);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
