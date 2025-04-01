import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userController.js';
import { authenticate, authorize, requirePasswordChange } from '../middleware/authMiddleware.js';
import {
  validateCreateUser,
  validateUpdateUser
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(authenticate);
router.use(requirePasswordChange);

// Only Super Admins can access these routes
router.use(authorize(['user:create', 'user:read', 'user:update', 'user:delete']));

router.route('/')
  .post(validateCreateUser, createUser)
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .patch(validateUpdateUser, updateUser)
  .delete(deleteUser);

export default router;