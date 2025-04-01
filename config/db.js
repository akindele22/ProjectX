import knex from 'knex';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
    reapIntervalMillis: 10000
  }
});

// Test connection
db.raw('SELECT 1')
  .then(() => logger.info('✅ Database connection established'))
  .catch(err => {
    logger.error('❌ Database connection failed:', err);
    process.exit(1);
  });

// Export both the db instance and a query helper
export const query = (sql, params) => {
  return db.raw(sql, params)
    .then(result => result.rows)
    .catch(err => {
      logger.error('Query failed:', { sql, params, error: err.message });
      throw err;
    });
};

export default db;