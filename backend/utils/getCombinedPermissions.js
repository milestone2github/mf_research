const Department = require("../models/Department");
const Role = require("../models/Role");
const User = require("../models/User");

async function getCombinedPermissions(user) {
  const department = await Department.findById(user.department).populate('permissions');
  const role = await Role.findById(user.role).populate('permissions');
  const userDoc = await User.findById(user._id).populate('permissions');

  const departmentPermissions = department?.permissions || [];
  const rolePermissions = role?.permissions || [];
  const userPermissions = userDoc?.permissions || [];

  const combinedPermissionKeys = [
    ...new Set([
      ...departmentPermissions.map(p => p.key),
      ...rolePermissions.map(p => p.key),
      ...userPermissions.map(p => p.key)
    ])
  ];

  return combinedPermissionKeys;
}

module.exports = getCombinedPermissions;
