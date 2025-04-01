import Permission from '../models/Permission.js';

export const checkPermissions = async (userId, requiredPermissions) => {
  const user = await User.findById(userId).populate('role');
  const rolePermissions = await Permission.find({ roleId: user.role.id });
  return requiredPermissions.every(perm => 
    rolePermissions.some(p => p.name === perm)
  );
};