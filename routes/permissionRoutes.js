// routes/permissionRoutes.js
import express from 'express';
import { PermissionController } from '../controllers/permissionController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only Super Admin can access these routes
router.use(authenticate);
router.use(authorize(['permission:manage']));

// GET /api/v1/permissions - List all permissions
router.get('/', PermissionController.getAllPermissions);

// GET /api/v1/permissions/:id - Get permission details
router.get('/:id', PermissionController.getPermissionById);

export default router;