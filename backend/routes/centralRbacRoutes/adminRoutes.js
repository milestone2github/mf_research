const express = require("express");
const { getAdmin, addAdmin, removeAdmin } = require("../../controllers/centralRbacControllers/adminController");
const adminRouter = express.Router();


// admin Routes
adminRouter.get('/', getAdmin);
adminRouter.patch('/:id', addAdmin);
adminRouter.patch('/:id/delete', removeAdmin);



module.exports = adminRouter;
