// routes/authRoutes.js
import express from 'express';
import {
  registerSuperAdmin,
  register,
  login,
  changePassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  validateRegister,
  validateChangePassword,
  validateLogin,
  validateResetPassword,
  validateInventoryItem
} from '../middleware/validationMiddleware.js';
import { InventoryController } from '../controllers/inventoryController.js'

const router = express.Router();

// Super Admin Registration (no authentication required)
router.post('/register-superadmin', validateRegister, registerSuperAdmin);

// Regular User Registration (authenticated - only for super admin)
router.post('/register', authenticate, validateRegister, register);

// Authentication
router.post('/login', validateLogin, login);

// Password Management
router.post('/change-password', authenticate, validateChangePassword, changePassword);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/inventory', validateInventoryItem, InventoryController);


export default router;