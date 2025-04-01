import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import knex from 'knex';
import config from './knexfile.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';
import { initializeDefaultRolesAndPermissions } from './config/roles.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ======================
// Middleware Setup
// ======================
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Logging
app.use(morgan('combined', { 
  stream: { write: message => logger.info(message.trim()) } 
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Database Initialization
// ======================
const db = knex(config[process.env.NODE_ENV || 'development']);

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await db.raw('SELECT 1');
    logger.info('✅ Database connection established');
    return true;
  } catch (err) {
    logger.error('❌ Database connection failed:', err);
    return false;
  }
};

// ======================
// Application Initialization
// ======================
async function initializeApplication() {
  // 1. Test database connection
  if (!await testDatabaseConnection()) {
    process.exit(1);
  }

  // 2. Initialize default roles and permissions
  try {
    await initializeDefaultRolesAndPermissions(db); // Pass db instance
    logger.info('✅ Default roles and permissions initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize roles and permissions:', error);
    process.exit(1);
  }

  // 3. Setup routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/roles', roleRoutes);
  app.use('/api/v1/permissions', permissionRoutes);
  app.use('/api/v1/inventory', inventoryRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Project X API is healthy'
    });
  });

  // Error handling middleware
  app.use(notFound);
  app.use(errorHandler);

  // ======================
  // Server Startup
  // ======================
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // ======================
  // Graceful Shutdown
  // ======================
  const shutdown = async (signal) => {
    logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
    
    try {
      // Close server first to stop accepting new connections
      server.close(async () => {
        logger.info('🔌 Server closed');
        
        // Close database connections
        await db.destroy();
        logger.info('🔌 Database connections closed');
        
        process.exit(0);
      });
      
      // Force close after timeout
      setTimeout(() => {
        logger.error('🕒 Shutdown timeout, forcing exit');
        process.exit(1);
      }, 10000); // 10 second timeout
      
    } catch (err) {
      logger.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Start the application
initializeApplication().catch(err => {
  logger.error('❌ Fatal error during initialization:', err);
  process.exit(1);
});