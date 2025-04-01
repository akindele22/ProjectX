import User from '../models/User.js';
import Role from '../models/Role.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { hashPassword } from '../utils/security.js';
import logger from '../utils/logger.js';

export const createUser = async (req, res) => {
  try {
    const { full_name, email, role_id } = req.body;

    // Validate input
    if (!full_name || !email || !role_id) {
      return errorResponse(res, 400, 'Missing required fields');
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return errorResponse(res, 409, 'Email already registered');
    }

    // Verify role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return errorResponse(res, 404, 'Specified role not found');
    }

    // Create user with secure temporary password
    const tempPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(tempPassword);
    
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role_id,
      temp_password: true
    });

    // Send welcome email with tempPassword in production
    logger.info(`User created with temporary password: ${email}`);

    // Sanitize response
    const { password, temp_password, ...userData } = user;

    return successResponse(res, 201, {
      ...userData,
      temp_password_set: true
    });

  } catch (error) {
    logger.error('User creation failed:', error);
    return errorResponse(res, 500, 'Failed to create user');
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    const sanitizedUsers = users.map(user => {
      const { password, temp_password, ...userData } = user;
      return userData;
    });

    return successResponse(res, 200, sanitizedUsers);

  } catch (error) {
    logger.error('Failed to fetch users:', error);
    return errorResponse(res, 500, 'Failed to retrieve users');
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Sanitize response
    const { password, temp_password, ...userData } = user;

    return successResponse(res, 200, userData);

  } catch (error) {
    logger.error(`Failed to fetch user ${req.params.id}:`, error);
    return errorResponse(res, 500, 'Failed to retrieve user');
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role_id } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check if email is being changed to one that's already taken
    if (email && email !== existingUser.email) {
      const emailExists = await User.findByEmail(email);
      if (emailExists) {
        return errorResponse(res, 409, 'Email already registered');
      }
    }

    // Verify role exists if role_id is being updated
    if (role_id) {
      const role = await Role.findById(role_id);
      if (!role) {
        return errorResponse(res, 404, 'Specified role not found');
      }
    }

    // Prepare update data (only include fields that are provided)
    const updateData = {
      full_name: full_name || existingUser.full_name,
      email: email || existingUser.email,
      role_id: role_id || existingUser.role_id
    };

    // Update user
    const updatedUser = await User.update(id, updateData);

    // Sanitize response
    const { password, temp_password, ...userData } = updatedUser;

    return successResponse(res, 200, userData);

  } catch (error) {
    logger.error('User update failed:', error);
    return errorResponse(res, 500, 'Failed to update user');
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user.id === parseInt(id)) {
      return errorResponse(res, 403, 'Cannot delete your own account');
    }

    const deletedUser = await User.deleteById(id);
    
    if (!deletedUser) {
      return errorResponse(res, 404, 'User not found');
    }

    logger.info(`User deleted: ${deletedUser.email}`);
    return successResponse(res, 200, {
      message: 'User deleted successfully',
      user: {
        id: deletedUser.id,
        email: deletedUser.email
      }
    });

  } catch (error) {
    logger.error('User deletion failed:', error);
    return errorResponse(res, 500, 'Failed to delete user');
  }
};

// Helper function
function generateRandomPassword(length = 12) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}