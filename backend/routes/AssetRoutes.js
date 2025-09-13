const assetRouter = require('express').Router();
const {
    getAssetById,
    getAssetByQuery,
    createAsset,
    updateAsset,
    changeAssetStatus,
    // getAllAssetCategories,
    createNewAssetCategory,
    getAllAssetTypes,
    createAssetType,
    getAssetsByTypeId,
    getAssignedAssets
} = require('../controllers/AssetController');
const verifyUser = require('../middlewares/VerifyUser');


// Asset Types Routes
assetRouter.get("/types", getAllAssetTypes);
assetRouter.get("/types/:id", getAssetsByTypeId);
assetRouter.post("/types", createAssetType);

// Asset Routes
assetRouter.post("/", verifyUser, createAsset);
assetRouter.get("/assigned", getAssignedAssets);    // Fetch User's Assets
assetRouter.get("/:id", getAssetById);
assetRouter.get("/", getAssetByQuery);
assetRouter.put("/:id", verifyUser, updateAsset);
assetRouter.patch("/:id/:status", verifyUser, changeAssetStatus);

// Asset Category Routes
/* // REDUNDANT: Categories list fetched in "assets/types?allCat=true"
// assetRouter.get("/categories", getAllAssetCategories);  */
assetRouter.post("/categories", createNewAssetCategory);

module.exports = assetRouter;