const express = require('express');
const { getAllCategories, createCategory } = require('../../controllers/centralRbacControllers/categoryController');

const categoryRouter = express.Router();

categoryRouter.get("/", getAllCategories);
categoryRouter.post("/", createCategory);

module.exports = categoryRouter;