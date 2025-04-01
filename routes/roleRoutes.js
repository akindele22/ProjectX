import express from 'express';
import RoleController from '../controllers/roleController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRole } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['role:manage']));

router.get('/', RoleController.getAllRoles);
router.post('/', validateRole, RoleController.createRole);
router.get('/:id', RoleController.getRoleById);
router.put('/:id', validateRole, RoleController.updateRole);
router.delete('/:id', RoleController.deleteRole);
router.post('/:id/permissions', RoleController.assignPermission);

// Use default export
export default router;