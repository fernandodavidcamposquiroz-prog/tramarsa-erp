const dotenv = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : '.env.local';

dotenv.config({ path: path.resolve(__dirname, '../../', envFile) });

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: env,
  db: {
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || 'tramarsa_db',
    user:     process.env.DB_USER     || 'tramarsa_user',
    password: process.env.DB_PASSWORD || 'tramarsa_pass',
  },
  jwt: {
    secret:    process.env.JWT_SECRET     || 'dev_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  },
  mocks: {
    sunat: process.env.SUNAT_MOCK !== 'false',
    banco: process.env.BANCO_MOCK !== 'false',
  },
};
