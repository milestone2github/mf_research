const Category = require("../../models/Category");
const { CATEGORY_FETCH_FAIL, CATEGORY_CREATE_FAIL, CATEGORY_EXISTS, CATEGORY_FETCH_SUCCESS, CATEGORY_CREATE_SUCCESS } = require("../../utils/rbacStringConstants");

// Fetch all the categories
const getAllCategories = async (_req, res) => {
    try {
        const getCategoryInfo = await Category.find().select("-__v -createdAt -updatedAt");
        if (!getCategoryInfo) {
            return res.status(404).json({
                message: CATEGORY_FETCH_FAIL
            });
        }
        res.status(200).json({
            message: CATEGORY_FETCH_SUCCESS,
            data: getCategoryInfo
        });
    } catch (err) {
        console.error(CATEGORY_FETCH_FAIL, err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Create a new category
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const ifCatExists = await Category.findOne({ name });
        if (ifCatExists) {
            return res.status(409).json({
                message: CATEGORY_EXISTS
            });
        }
        const newCategory = new Category({ name });

        const saveCat = await newCategory.save();
        res.status(200).json({
            message: CATEGORY_CREATE_SUCCESS,
            data: saveCat
        });
    } catch (err) {
        console.error(CATEGORY_CREATE_FAIL, err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

module.exports = {
    getAllCategories,
    createCategory
}