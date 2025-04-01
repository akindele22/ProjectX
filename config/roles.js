import { query } from '../config/db.js';
import logger from '../utils/logger.js';

export const DEFAULT_ROLES = {
  SUPER_ADMIN: {
    name: 'Super Admin',
    description: 'Has full access to all system features',
    permissions: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'role:create',
      'role:read',
      'role:update',
      'role:delete',
      'permission:create',
      'permission:read',
      'permission:update',
      'permission:delete',
      'inventory:create',
      'inventory:read',
      'inventory:update',
      'inventory:delete',
      'checkout:process'
    ]
  },
  INVENTORY_MANAGER: {
    name: 'Inventory Manager',
    description: 'Manages inventory items',
    permissions: [
      'inventory:create',
      'inventory:read',
      'inventory:update',
      'inventory:delete'
    ]
  },
  CASHIER: {
    name: 'Cashier',
    description: 'Processes customer checkouts',
    permissions: [
      'inventory:read',
      'checkout:process'
    ]
  }
};

export const DEFAULT_PERMISSIONS = [
  'user:create',
  'user:read',
  'user:update',
  'user:delete',
  'role:create',
  'role:read',
  'role:update',
  'role:delete',
  'permission:create',
  'permission:read',
  'permission:update',
  'permission:delete',
  'inventory:create',
  'inventory:read',
  'inventory:update',
  'inventory:delete',
  'checkout:process'
];

export async function initializeDefaultRolesAndPermissions() {
  try {
    // Start a transaction
    const trx = await db.transaction();

    try {
      // Get existing roles
      const existingRoles = await trx('roles').select('name');
      const existingRoleNames = existingRoles.map(r => r.name);

      // Create missing roles and permissions
      for (const roleKey in DEFAULT_ROLES) {
        const role = DEFAULT_ROLES[roleKey];
        
        if (!existingRoleNames.includes(role.name)) {
          logger.info(`Creating role: ${role.name}`);
          
          // Insert role
          const [roleRecord] = await trx('roles')
            .insert({
              name: role.name,
              description: role.description
            })
            .returning('*');

          // Create permissions for this role
          for (const permissionName of role.permissions) {
            // Find or create permission
            let [permission] = await trx('permissions')
              .where('name', permissionName);
            
            if (!permission) {
              [permission] = await trx('permissions')
                .insert({ name: permissionName })
                .returning('*');
            }
            
            // Link role to permission
            await trx('role_permissions').insert({
              role_id: roleRecord.id,
              permission_id: permission.id
            });
          }
        }
      }

      // Commit the transaction
      await trx.commit();
      logger.info('✅ Default roles and permissions initialized');
    } catch (error) {
      // Rollback if any error occurs
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error('❌ Error initializing default roles and permissions:', error);
    throw error;
  }
}