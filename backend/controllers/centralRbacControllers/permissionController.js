const Department = require("../../models/Department");
const Permission = require("../../models/Permission");
const Role = require("../../models/Role");
const User = require("../../models/User");
const {
    PERMISSION_SERVER_ERROR,
    PERMISSION_FETCH_FAIL,
    PERMISSION_FETCH_SUCCESS,
    REQUIRED_PERMISSION_FIELDS_NOT_FOUND,
    PERMISSION_CREATE_SUCCESS,
    PERMISSION_UPDATE_SUCCESS,
    PERMISSION_DELETE_SUCCESS, 
    INTERNAL_SERVER_ERROR
} = require("../../utils/rbacStringConstants");

// Fetch all the permissions and find associated Users, Roles, and Departments
const getAllPermissions = async (req, res) => {
    try {
        const { sortByCat } = req.query;
        let query = Permission.find()
          .select("-__v -createdAt -updatedAt")
          .populate("category");
        // Create the query as per Category sorting order
        if (sortByCat === "true") {
            query = query.sort({ category: 1 });
        }
        
        const getPermissionsData = await query;

        // Count and map the permissions with respective Users, Roles, and Departments
        const permissionData = await Promise.all(
            getPermissionsData.map(async (perm) => {
                const [userCount, roleCount, deptCount] = await Promise.all([
                    User.countDocuments({ permissions: perm._id }),
                    Role.countDocuments({ permissions: perm._id }),
                    Department.countDocuments({ permissions: perm._id })
                ]);
                return {
                    ...perm.toObject(),
                    combinedData: {
                        users: userCount,
                        roles: roleCount,
                        departments: deptCount
                    }
                };
            })
        );

        res.status(200).json({
            message: PERMISSION_FETCH_SUCCESS,
            permissionData
        });
    } catch (err) {
        console.error(PERMISSION_SERVER_ERROR("fetching all"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        })
    }
}

// Get individual permission details
const getPermission = async (req, res) => {
    try {
        const { id } = req.params;
        const getPermissionInfo = await Permission.findById(id).select("-__v -createdAt");
        if (!getPermissionInfo) {
            return res.status(404).json({
                message: PERMISSION_FETCH_FAIL
            });
        }
        res.status(200).json({
            message: PERMISSION_FETCH_SUCCESS,
            data: getPermissionInfo
        })
    } catch (err) {
        console.error(PERMISSION_SERVER_ERROR("fetching"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Create new permission
const createNewPermissions = async (req, res) => {
    try {
        const { name, key, category } = req.body;
        if (!name || !key) {
            return res.status(400).json({
                message: REQUIRED_PERMISSION_FIELDS_NOT_FOUND
            });
        }
        let updateFields = { name, key }
        if (category) {
            updateFields = {
                ...updateFields,
                category
            }
        }

        const newPermission = new Permission(updateFields);
        const savedPermission = await newPermission.save();

        res.status(200).json({ message: PERMISSION_CREATE_SUCCESS, savedPermission });
    } catch (err) {
        console.error(PERMISSION_SERVER_ERROR("creating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Edit existing permissions
const updatePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, key, category } = req.body;
        
        const updatedPerm = await Permission.findByIdAndUpdate(
            id,
            { name, key, category, updatedAt: new Date() },
            { new: true, select: "-__v -createdAt" }
        );
        
        if (!updatedPerm) {
            return res.status(404).json({
                message: PERMISSION_FETCH_FAIL
            });
        }

        res.status(200).json({
            message: PERMISSION_UPDATE_SUCCESS,
            updatedPerm
        });
    } catch (err) {
        console.error(PERMISSION_SERVER_ERROR("updating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Remove the permission data
const deletePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPerm = await Permission.findByIdAndDelete(id);
        if (!deletedPerm) {
            return res.status(404).json({
                message: PERMISSION_FETCH_FAIL
            });
        }

        // Remove the associated permissions on User, Role and Department collections
        await Promise.all([
            User.updateMany({ permissions: id }, { $pull: { permissions: id } }),
            Role.updateMany({ permissions: id }, { $pull: { permissions: id } }),
            Department.updateMany({ permissions: id }, { $pull: { permissions: id } })
        ]);

        res.status(200).json({
            message: PERMISSION_DELETE_SUCCESS
        });
    } catch (err) {
        console.error(PERMISSION_SERVER_ERROR("deleting"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// const getAdditionalPermissions = async (req, res) => {
//     try {
//       const { roleId, departmentId } = req.query;
  
//       if (!roleId || !departmentId) {
//         return res.status(400).json({ message: 'Missing roleId or departmentId' });
//       }
  
//       const allPermissions = await Permission.find();
  
//       const role = await Role.findOne({ _id: roleId }).populate('permissions');
//       const department = await Department.findOne({ _id: departmentId }).populate('permissions');
  
//       const excludedIds = new Set([
//         ...role?.permissions?.map(p => p._id.toString()) || [],
//         ...department?.permissions?.map(p => p._id.toString()) || []
//       ]);
  
//       const additionalPermissions = allPermissions.filter(
//         p => !excludedIds.has(p._id.toString())
//       );
  
//       return res.status(200).json({ additionalPermissions });
//     } catch (error) {
//       console.error('Error in getAdditionalPermissions:', error);
//       return res.status(500).json({ message: 'Server error' });
//     }
//   };
// In your permissionController.js

const getAdditionalPermissions = async (req, res) => {
    try {
        const { roleId, departmentId, userId } = req.query;

        if (!roleId || !departmentId) {
            return res.status(400).json({ message: 'Missing roleId or departmentId' });
        }

        const allPermissions = await Permission.find();
        const role = await Role.findOne({ _id: roleId }).populate('permissions');
        const department = await Department.findOne({ _id: departmentId }).populate('permissions');

        const excludedIds = new Set([
            ...role?.permissions?.map(p => p._id.toString()) || [],
            ...department?.permissions?.map(p => p._id.toString()) || []
        ]);

        let userExistingPermissions = new Set();
        if (userId) {
            const user = await User.findById(userId);
            userExistingPermissions = new Set(user?.permissions?.map(p => p.toString()) || []);
        }

        const additionalPermissionsWithStatus = allPermissions
            .filter(p => !excludedIds.has(p._id.toString()))
            .map(p => ({
                ...p.toObject(),
                hasForUser: userExistingPermissions.has(p._id.toString())
            }));

        return res.status(200).json({ additionalPermissions: additionalPermissionsWithStatus });
    } catch (error) {
        console.error('Error in getAdditionalPermissions:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllPermissions,
    getPermission,
    createNewPermissions,
    updatePermissions,
    deletePermissions,
    getAdditionalPermissions
}