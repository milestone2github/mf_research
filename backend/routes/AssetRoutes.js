const assetRouter = require('express').Router();
const {
    getAssetById,
    getAssetByQuery,
    createAsset,
    updateAsset,
    deleteAsset,
    changeAssetStatus,
    changeMultipleAssetStatus,
    // getAllAssetCategories,
    createNewAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    getAllAssetTypes,
    createAssetType,
    updateAssetType,
    deleteAssetType,
    getAssetsByTypeId,
    getAssignedAssets,
    createMerchant,
    updateMerchant,
    deleteMerchant,
    getAllMerchants
} = require('../controllers/AssetController');
const verifyUser = require('../middlewares/VerifyUser');


// Asset Types Routes
assetRouter.get("/types", getAllAssetTypes);
assetRouter.get("/types/:id", getAssetsByTypeId);
assetRouter.post("/types", createAssetType);
assetRouter.put("/types/:id", updateAssetType);
assetRouter.delete("/types/:id", deleteAssetType);


// Merchant routes
assetRouter.get("/merchants", getAllMerchants);      
assetRouter.post("/merchants", createMerchant);     
assetRouter.put("/merchants/:id", updateMerchant);   
assetRouter.delete("/merchants/:id", deleteMerchant);

// Asset Routes
assetRouter.post("/", verifyUser, createAsset);
assetRouter.get("/assigned", getAssignedAssets);    // Fetch User's Assets
assetRouter.get("/:id", getAssetById);
assetRouter.get("/", getAssetByQuery);
assetRouter.put("/:id", verifyUser, updateAsset);
assetRouter.delete("/:id", verifyUser, deleteAsset); 
assetRouter.patch("/bulk/status", verifyUser, changeMultipleAssetStatus); 
assetRouter.patch("/:id/:status", verifyUser, changeAssetStatus);

// Asset Category Routes
/* // REDUNDANT: Categories list fetched in "assets/types?allCat=true"
// assetRouter.get("/categories", getAllAssetCategories);  */
assetRouter.post("/categories", createNewAssetCategory);
assetRouter.put("/categories/:id", updateAssetCategory);
assetRouter.delete("/categories/:id", deleteAssetCategory);

module.exports = assetRouter;