const express = require('express');
const {
    getRoles,
    getRoleInfo,
    // getRoleByDeptId,
    createRole,
    updateRole,
    deleteRole,
} = require('../../controllers/centralRbacControllers/roleController');

const roleRouter = express.Router();

roleRouter.get("/", getRoles);              // Get all roles
roleRouter.get("/:id", getRoleInfo);       // Fetch role info by department (To Do: ADD MIDDLEWARE LOGIC FOR PRIVATE API "verifyToken")
// roleRouter.get("/", getRoleByDeptId);       // Fetch role info by department (Redundant: integrated with getRoles API)
roleRouter.post("/", createRole);           // Create role
roleRouter.put("/:id", updateRole);         // Update role
roleRouter.delete("/:id", deleteRole);      // Delete role

module.exports = roleRouter;
