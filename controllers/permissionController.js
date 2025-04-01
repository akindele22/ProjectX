import db from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export class PermissionController {
  static async getAllPermissions(req, res) {
    try {
      const permissions = await db('permissions').select('*');
      return successResponse(res, 200, permissions);
    } catch (error) {
      logger.error('Error getting permissions:', error);
      return errorResponse(res, 500, 'Failed to get permissions');
    }
  }

  static async getPermissionById(req, res) {
    try {
      const permission = await db('permissions')
        .where('id', req.params.id)
        .first();

      if (!permission) {
        return errorResponse(res, 404, 'Permission not found');
      }

      return successResponse(res, 200, permission);
    } catch (error) {
      logger.error('Error getting permission:', error);
      return errorResponse(res, 500, 'Failed to get permission');
    }
  }

}