import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Configure environment variables
dotenv.config();

// Get current directory path (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commonConfig = {
  client: 'pg',
  migrations: {
    tableName: 'projectx_migrations', // Changed to lowercase for PostgreSQL consistency
    directory: path.join(__dirname, './migrations'), // Absolute path
    schemaName: 'public',
    disableMigrationsListValidation: false,
    loadExtensions: ['.js']

  },
  seeds: {
    directory: path.join(__dirname, './seeds'), // Absolute path
    loadExtensions: ['.js']
  },
  pool: {
    min: 2,
    max: 10,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100
  },
  debug: process.env.NODE_ENV === 'development',
  acquireConnectionTimeout: 60000
};

export default {
  development: {
    ...commonConfig,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'), // Explicit port 5450
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'projectx',
      application_name: 'projectx' // Useful for PG monitoring
    },
    // Enable SQL logging in development
    log: {
      warn(msg) {
        console.warn('Knex warning:', msg);
      },
      error(msg) {
        console.error('Knex error:', msg);
      },
      deprecate(msg) {
        console.warn('Knex deprecation:', msg);
      },
      debug(msg) {
        console.log('Knex debug:', msg);
      }
    }
  },

  production: {
    ...commonConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { 
        rejectUnauthorized: process.env.NODE_ENV === 'production',
        ca: process.env.DB_SSL_CA // Add if using custom CA
      }
    },
    pool: {
      ...commonConfig.pool,
      min: 4,
      max: 20
    }
  },

  test: {
    ...commonConfig,
    connection: {
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'), // Test on same port
      user: process.env.TEST_DB_USER || 'postgres',
      password: process.env.TEST_DB_PASSWORD || '',
      database: process.env.TEST_DB_NAME || 'projectx_test',
      application_name: 'projectx_test'
    },
    // Disable connection pooling in tests
    pool: { min: 1, max: 1 }
  }
};