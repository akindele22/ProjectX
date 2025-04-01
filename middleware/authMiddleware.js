import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/permission.js';
import { errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized, no token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return errorResponse(res, 401, 'The user belonging to this token no longer exists');
    }

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    logger.error('Error in authentication middleware:', error);
    return errorResponse(res, 401, 'Not authorized, token failed');
  }
};

export const authorize = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      // Get user's role
      const role = await Role.findById(req.user.role_id);
      if (!role) {
        return errorResponse(res, 403, 'Your role is not properly configured');
      }

      // Get all permissions for this role
      const permissions = await Permission.getPermissionsForRole(role.id);
      const permissionNames = permissions.map(p => p.name);

      // Check if user has all required permissions
      const hasPermission = requiredPermissions.every(perm => 
        permissionNames.includes(perm)
      );

      if (!hasPermission) {
        return errorResponse(
          res,
          403,
          'You do not have permission to perform this action'
        );
      }

      next();
    } catch (error) {
      logger.error('Error in authorization middleware:', error);
      return errorResponse(res, 500, 'Internal server error');
    }
  };
};

export const requirePasswordChange = async (req, res, next) => {
  try {
    if (req.user.temp_password) {
      return errorResponse(
        res,
        403,
        'You must change your temporary password before accessing this resource'
      );
    }
    next();
  } catch (error) {
    logger.error('Error in requirePasswordChange middleware:', error);
    return errorResponse(res, 500, 'Internal server error');
  }
};