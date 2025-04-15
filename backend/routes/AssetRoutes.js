const assetRouter = require('express').Router();
const {
    getAssetById,
    getAssetByQuery,
    createAsset,
    updateAsset,
    changeAssetStatus,
    getAllAssetCategories,
    createNewAssetCategory
} = require('../controllers/AssetController');
const verifyUser = require('../middlewares/VerifyUser');
// const multer = require('multer');
// const upload = multer();

// Asset Routes
assetRouter.post("/", verifyUser, createAsset);
assetRouter.put("/:id", verifyUser, updateAsset);
assetRouter.get("/:id", getAssetById);
assetRouter.get("/", getAssetByQuery);
assetRouter.patch("/:id/:status", verifyUser, changeAssetStatus);

// Category Routes
assetRouter.get("/categories", getAllAssetCategories);
assetRouter.post("/categories", createNewAssetCategory);

module.exports = assetRouter;