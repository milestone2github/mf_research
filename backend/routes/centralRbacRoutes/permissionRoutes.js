const express = require('express');
const {
    getAllPermissions,
    getPermission,
    createNewPermissions,
    updatePermissions,
    deletePermissions,
    getAdditionalPermissions
} = require('../../controllers/centralRbacControllers/permissionController');

const permissionRouter = express.Router()

permissionRouter.get('/addperm', getAdditionalPermissions);

permissionRouter.get('/', getAllPermissions);
permissionRouter.get('/:id', getPermission);
permissionRouter.post('/', createNewPermissions);
permissionRouter.put('/:id', updatePermissions);
permissionRouter.delete('/:id', deletePermissions);

module.exports = permissionRouter;