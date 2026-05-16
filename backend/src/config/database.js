const { Pool } = require('pg');
const config = require('./env');

const pool = new Pool(config.db);

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
