const express = require('express');
const {
    getAllDepartments,
    getDepartmentById,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../../controllers/centralRbacControllers/departmentController');

const departmentRouter = express.Router();

/* ADD authentication middleware, Zod validations */

departmentRouter.get("/", getAllDepartments);          // Get all departments
departmentRouter.get("/:id", getDepartmentById);    // Fetch department info by id
departmentRouter.post("/", createDepartment);       // Create department
departmentRouter.put("/:id", updateDepartment);     // Update department
departmentRouter.delete("/:id", deleteDepartment);  // Delete department

module.exports = departmentRouter;
