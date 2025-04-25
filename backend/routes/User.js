const { Router } = require("express");
const getUserList = require("../controllers/UserController");

const userRoutes = Router();

// Fetch all users
userRoutes.get('/', getUserList);

module.exports = userRoutes