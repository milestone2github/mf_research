const express = require("express");
const userRouter = express.Router();
const userController = require("../../controllers/centralRbacControllers/userController");

//User Actions
// userRouter.get("/search", userController.searchByNameOrEmail);// Static, comes first 

// User Routes
userRouter.get('/', userController.getAllUsers); // Admin 
userRouter.get('/:id', userController.getUserById); // Self/ Admin
userRouter.post('/', userController.createUser); // Admin 
userRouter.put('/:id', userController.updateUser); // Admin 
userRouter.delete('/:id', userController.deleteUser); // Admin 



module.exports = userRouter;