import db from '../config/db.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export default class RoleController {
  static async getAllRoles(req, res) {
    try {
      const roles = await db('roles').select('*');
      return successResponse(res, 200, roles);
    } catch (error) {
      logger.error('Get all roles error:', error);
      return errorResponse(res, 500, 'Failed to get roles');
    }
  }

  static async getRoleById(req, res) {
    try {
      const role = await db('roles')
        .where('id', req.params.id)
        .first();
      
      if (!role) {
        return errorResponse(res, 404, 'Role not found');
      }
      
      // Get permissions for this role
      const permissions = await db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('role_permissions.role_id', req.params.id)
        .select('permissions.*');
      
      return successResponse(res, 200, { ...role, permissions });
    } catch (error) {
      logger.error('Get role by ID error:', error);
      return errorResponse(res, 500, 'Failed to get role');
    }
  }

  static async createRole(req, res) {
    const trx = await db.transaction();
    try {
      const { name, description } = req.body;
      
      const [role] = await trx('roles')
        .insert({ name, description })
        .returning('*');
      
      await trx.commit();
      return successResponse(res, 201, role);
    } catch (error) {
      await trx.rollback();
      logger.error('Create role error:', error);
      return errorResponse(res, 500, 'Failed to create role');
    }
  }

  static async updateRole(req, res) {
    const trx = await db.transaction();
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const [role] = await trx('roles')
        .where('id', id)
        .update({ name, description })
        .returning('*');
      
      await trx.commit();
      return successResponse(res, 200, role);
    } catch (error) {
      await trx.rollback();
      logger.error('Update role error:', error);
      return errorResponse(res, 500, 'Failed to update role');
    }
  }

  static async deleteRole(req, res) {
    const trx = await db.transaction();
    try {
      await trx('roles')
        .where('id', req.params.id)
        .delete();
      
      await trx.commit();
      return successResponse(res, 204);
    } catch (error) {
      await trx.rollback();
      logger.error('Delete role error:', error);
      return errorResponse(res, 500, 'Failed to delete role');
    }
  }

  static async assignPermission(req, res) {
    const trx = await db.transaction();
    try {
      const { role_id } = req.params;
      const { permission_id } = req.body;
      
      await trx('role_permissions')
        .insert({ role_id, permission_id });
      
      await trx.commit();
      return successResponse(res, 201, { message: 'Permission assigned' });
    } catch (error) {
      await trx.rollback();
      logger.error('Assign permission error:', error);
      return errorResponse(res, 500, 'Failed to assign permission');
    }
  }
}