const Department = require("../../models/Department");
const Role = require("../../models/Role");
const {
    DEPARTMENT_FETCH_SUCCESS,
    DEPARTMENT_FETCH_SUCCESSFUL,
    DEPARTMENT_FETCH_FAIL,
    INTERNAL_SERVER_ERROR,
    DEPARTMENT_FETCH_FAILED,
    DEPARTMENT_SERVER_ERROR,
    DEPARTMENT_EXISTS_IN_DB,
    DEPARTMENT_CREATE_SUCCESS,
    DEPARTMENT_UDPATE_SUCCESS,
    DEPARTMENT_DELETE_SUCCESS
} = require("../../utils/rbacStringConstants");

// Fetch department details
const getAllDepartments = async (req, res) => {
    try {
        // Fetch all departments
        const getDeptData = await Department.find()
          .select("-__v -createdAt -updatedAt")
          .populate('permissions');

        if (!getDeptData) {
            return res.status(404).json({
                message: DEPARTMENT_FETCH_FAIL
            });
        }

        res.status(200).json({
            message: DEPARTMENT_FETCH_SUCCESS,
            data: getDeptData
        });

    } catch (err) {
        console.error(DEPARTMENT_SERVER_ERROR("fetching"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
};


// Fetch department by id
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const getDeptInfo = await Department.findById(id)
          .select("-__v -createdAt")
          .populate("permissions");
        if (!getDeptInfo) {
            return res.status(404).json({
                message: DEPARTMENT_FETCH_FAILED(id)
            });
        }
        res.status(200).json({
            message: DEPARTMENT_FETCH_SUCCESSFUL,
            data: getDeptInfo
        });
    } catch (err) {
        console.error(DEPARTMENT_SERVER_ERROR("fetching"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}



// Create department
const createDepartment = async (req, res) => {
    try {
        const { name, permissions } = req.body;
        
        // Check for department existence
        const ifDeptExists = await Department.findOne({ name, permissions });
        if (ifDeptExists) {
            return res.status(409).json({
                message: DEPARTMENT_EXISTS_IN_DB
            });
        }
        
        // Create a new instance and save in DB
        const newDepartment = new Department({
            name,
            permissions
        });
        const saveDepartment = await newDepartment.save();
        res.status(200).json({ message: DEPARTMENT_CREATE_SUCCESS, data: saveDepartment });
    } catch (err) {
        console.error(DEPARTMENT_SERVER_ERROR("creating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Update department
const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissions } = req.body;

        // Check and update the department if exists
        const updatedDeptInfo = await Department.findByIdAndUpdate(
            id,
            { name, permissions, updatedAt: new Date() },
            { new: true, select: "-__v -createdAt" }
        )
        if (!updatedDeptInfo) {
            return res.status(404).json({
                message: DEPARTMENT_FETCH_FAIL
            });
        }
        res.status(200).json({
            message: DEPARTMENT_UDPATE_SUCCESS,
            updatedDeptInfo
        })
    } catch (err) {
        console.error(DEPARTMENT_SERVER_ERROR("updating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Delete department
const deleteDepartment = async (req, res) => {
    // All associated roles will also be deleted!
    try {
        const { id } = req.params;
        // Find the department and delete
        const deleteDept = await Department.findByIdAndDelete(id);
        if (!deleteDept) {
            return res.status(404).json({ message: DEPARTMENT_FETCH_FAIL });
        }

        // Delete all the associated Roles
        const deletedRoles = await Role.deleteMany({ department: id });

        // Return the deleted roles count
        res.status(200).json({
            message: DEPARTMENT_DELETE_SUCCESS,
            deleteCount: deletedRoles.deletedCount
        })
    } catch (err) {
        console.error(DEPARTMENT_SERVER_ERROR("deleting"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

module.exports = {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
}