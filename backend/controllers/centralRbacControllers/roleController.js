const Role = require("../../models/Role");
const {
    INTERNAL_SERVER_ERROR,
    ROLE_FETCH_ERROR,
    ROLE_FETCH_FAIL,
    ROLE_FETCH_FAILED,
    ROLE_FETCH_SUCCESSFUL,
    ROLE_EXISTS_IN_DB,
    ROLE_CREATE_SUCCESS,
    ROLE_SERVER_ERROR,
    ROLE_UPDATE_SUCCESS,
    ROLE_DELETE_SUCCESS,
    ROLES_FETCH_SERVER_ERROR,
    ROLE_FETCH_SUCCESS,
} = require("../../utils/rbacStringConstants");

// Fetch all the roles list OR fetch roles by department id
const getRoles = async (req, res) => {
    try {
        // Case 1: Fetch data as per department id
        if (req.query.dept) {
            const deptId = req.query.dept;
            const getRoleByDeptData = await Role.find({ department: deptId })
              .select("-__v -createdAt -updatedAt")
              .populate("permissions");
            if (!getRoleByDeptData) {
                console.error(ROLE_FETCH_ERROR, err);
                return res.status(404).json({
                    message: ROLE_FETCH_FAILED(deptId)
                });
            }
            return res.status(200).json({
                message: ROLE_FETCH_SUCCESS,
                data: getRoleByDeptData
            })
        }

        // Case 2: Fetch All Roles Data
        const getRoleData = await Role.find().populate("department permissions");
        if (!getRoleData) {
            return res.status(404).json({
                message: ROLE_FETCH_FAIL
            });
        }

        res.status(200).json({
            message: ROLE_FETCH_SUCCESS,
            data: getRoleData
        });

    } catch (err) {
        console.error(ROLE_FETCH_ERROR, err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
};

// Private API: Get Roles Info
const getRoleInfo = async (req, res) => {
    try {
        const { id } = req.params;
        const getRoleInfo = await Role.findById(id)
          .select('-__v -createdAt -updatedAt')
          .populate("department permissions");
        if (!getRoleInfo) {
            return res.status(404).json({
                message: ROLE_FETCH_FAILED(id)
            });
        }
        return res.status(200).json({
            message: ROLE_FETCH_SUCCESSFUL,
            data: getRoleInfo
        });
    } catch (err) {
        console.error(ROLE_FETCH_ERROR, err);
        return res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        })
    }
}

// Fetch role by department id
const getRoleByDeptId = async (req, res) => {
    try {
        const deptId = req.query.dept;
        // Fetch all the roles, their permissions, and associated departments
        const getRoleInfo = await Role.find({ department: deptId })
          .select('-__v -createdAt -updatedAt')
          .populate("department permissions");
        if (!getRoleInfo) {
            console.error(ROLE_FETCH_FAILED(deptId));
            return res.status(404).json({
                message: ROLE_FETCH_FAIL
            });
        }

        res.status(200).json({
            message: ROLE_FETCH_SUCCESSFUL,
            data: getRoleInfo
        });
    } catch (err) {
        console.error(ROLE_FETCH_ERROR, err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Create role
const createRole = async (req, res) => {
    try {
        const { name, department, permissions } = req.body;
        
        // Check for existing Role with same permission, department if any
        const ifRoleExists = await Role.findOne({ name, permissions });
        if (ifRoleExists) {
            return res.status(409).json({
                message: ROLE_EXISTS_IN_DB
            });
        }
        
        const newRole = new Role({
            name,
            department,
            permissions
        });

        const saveRole = await newRole.save();
        res.status(200).json({
            message: ROLE_CREATE_SUCCESS,
            data: saveRole
        });
    } catch (err) {
        console.error(ROLE_SERVER_ERROR("creating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Update role
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;
        // Find the role by its Id, update the permissions, return the updated role object
        const updatedRoleInfo = await Role.findByIdAndUpdate(
            id,
            { name, permissions },
            { new: true, select: "-__v -createdAt" }
        );
        if (!updatedRoleInfo) {
            return res.status(404).json({ message: ROLE_FETCH_ERROR });
        }

        res.status(200).json({
            message: ROLE_UPDATE_SUCCESS,
            updatedRoleInfo
        });
    } catch (err) {
        console.error(ROLE_SERVER_ERROR("updating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Delete role
const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const deleteRoles = await Role.findByIdAndDelete(id);
        if (!deleteRoles) {
            return res.status(404).json({
                message: ROLE_FETCH_FAIL
            });
        }

        res.status(200).json({
            message: ROLE_DELETE_SUCCESS            
        });        
    } catch (err) {
        console.error(ROLE_SERVER_ERROR("deleting"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

module.exports = {
    getRoles,
    getRoleInfo,
    getRoleByDeptId,
    createRole,
    updateRole,
    deleteRole
}