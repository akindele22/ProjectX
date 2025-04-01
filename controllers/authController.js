import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import { DEFAULT_ROLES } from '../config/roles.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { hashPassword, comparePasswords, generateRandomPassword } from '../utils/security.js';
import db from '../config/db.js';
import logger from '../utils/logger.js';

// Token generation with enhanced security
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
      is_temp_password: user.temp_password
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN,
      algorithm: 'HS256'
    }
  );
};

export const registerSuperAdmin = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { email, password, full_name, company_name } = req.body;

    // Validate input
    if (!email || !password || !full_name) {
      await trx.rollback();
      return errorResponse(res, 400, 'Missing required fields');
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      await trx.rollback();
      return errorResponse(res, 409, 'Email already registered');
    }

    // Find or create Super Admin role
    let [role] = await trx('roles')
      .where({ name: DEFAULT_ROLES.SUPER_ADMIN.name })
      .first();

    if (!role) {
      [role] = await trx('roles')
        .insert({
          name: DEFAULT_ROLES.SUPER_ADMIN.name,
          description: DEFAULT_ROLES.SUPER_ADMIN.description
        })
        .returning('*');
    }

    // Create user with hashed password
    const hashedPassword = await hashPassword(password);
    const [user] = await trx('users')
      .insert({
        full_name,
        email,
        password: hashedPassword,
        company_name,
        role_id: role.id,
        temp_password: false
      })
      .returning('*');

    await trx.commit();
    
    // Generate token and sanitize user data
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    
    logger.info(`Super admin registered: ${user.email}`);
    return successResponse(res, 201, { 
      user: userData, 
      token 
    });

  } catch (error) {
    await trx.rollback();
    logger.error('Super admin registration failed:', error);
    return errorResponse(res, 500, 'Registration failed. Please try again.');
  }
};

// register for
export const register = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { email, full_name, role_id } = req.body;
    const requestingUser = req.user; // The authenticated user making the request

    // Validate input
    if (!email || !full_name || !role_id) {
      await trx.rollback();
      return errorResponse(res, 400, 'Missing required fields');
    }

    // Check if requesting user has permission to create users
    const role = await Role.findById(requestingUser.role_id);
    if (!role || role.name !== DEFAULT_ROLES.SUPER_ADMIN.name) {
      await trx.rollback();
      return errorResponse(res, 403, 'Unauthorized to create users');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      await trx.rollback();
      return errorResponse(res, 409, 'Email already registered');
    }

    // Generate temporary password
    const tempPassword = generateRandomPassword(12);
    const hashedPassword = await hashPassword(tempPassword);

    // Create user
    const [user] = await trx('users')
      .insert({
        full_name,
        email,
        password: hashedPassword,
        role_id,
        temp_password: true
      })
      .returning('*');

    await trx.commit();
    
    // Sending welcome email with temporary password
    logger.info(`New user registered: ${user.email} with temp password`);
    
    const { password: _, ...userData } = user;
    return successResponse(res, 201, { 
      user: userData,
      message: 'User created successfully. Temporary password sent.'
    });

  } catch (error) {
    await trx.rollback();
    logger.error('User registration failed:', error);
    return errorResponse(res, 500, 'Registration failed. Please try again.');
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required');
    }

    const user = await User.findByEmail(email);
    
    //  Generic error message to prevent user enumeration
    if (!user || !(await comparePasswords(password, user.password))) {
      return errorResponse(res, 401, 'Invalid email or password');
    }

    // Generate token
    const token = generateToken(user);
    const { password: _, ...userData } = user;

    logger.info(`User logged in: ${user.email}`);
    return successResponse(res, 200, {
      user: userData,
      token,
      requiresPasswordReset: user.temp_password
    });

  } catch (error) {
    logger.error('Login error:', error);
    return errorResponse(res, 500, 'Login failed. Please try again.');
  }
};

export const changePassword = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      await trx.rollback();
      return errorResponse(res, 400, 'Both current and new password are required');
    }

    if (currentPassword === newPassword) {
      await trx.rollback();
      return errorResponse(res, 400, 'New password must be different');
    }

    // Get user and verify current password
    const user = await trx('users').where({ id: userId }).first();
    if (!user) {
      await trx.rollback();
      return errorResponse(res, 404, 'User not found');
    }

    if (!(await comparePasswords(currentPassword, user.password))) {
      await trx.rollback();
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await trx('users')
      .where({ id: userId })
      .update({ 
        password: hashedPassword,
        temp_password: false
      });

    await trx.commit();
    
    logger.info(`Password changed for user: ${user.email}`);
    return successResponse(res, 200, 'Password changed successfully');

  } catch (error) {
    await trx.rollback();
    logger.error('Password change failed:', error);
    return errorResponse(res, 500, 'Password change failed');
  }
};

export const resetPassword = async (req, res) => {
  const trx = await db.transaction();
  
  try {
    const { email } = req.body;
    const user = await trx('users').where({ email }).first();

    if (user) {
      // Generate and set temporary password
      const tempPassword = generateRandomPassword(12);
      const hashedPassword = await hashPassword(tempPassword);

      await trx('users')
        .where({ id: user.id })
        .update({ 
          password: hashedPassword,
          temp_password: true
        });

      // Send email with tempPassword
      logger.info(`Password reset for ${email}. Temp password: ${tempPassword}`);
    }

    await trx.commit();
    
    // Generic success message regardless of email existence (security)
    return successResponse(res, 200, 'If the email exists, a reset link has been sent');

  } catch (error) {
    await trx.rollback();
    logger.error('Password reset failed:', error);
    return errorResponse(res, 500, 'Password reset failed');
  }
};