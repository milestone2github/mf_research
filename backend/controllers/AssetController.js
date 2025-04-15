const AssetCategories = require("../models/AssetCategories");
const Assets = require("../models/Assets");
const { REQUIRED_FIELDS_NOT_FOUND, INTERNAL_SERVER_ERROR, INTERNAL_ERROR_CONSOLE, ASSET_FOUND_IN_DB, ASSET_CREATE_SUCCESS, ASSET_NOT_FOUND_IN_DB, USER_ID_NOT_FOUND, ASSET_ID_NOT_FOUND, ASSET_FETCH_SUCCESS, ASSET_REMOVE_SUCCESSFUL, ASSET_ALLOCATE_SUCCESS, ASSET_UPDATE_SUCCESS, ASSET_DEALLOCATE_SUCCESS, ASSET_SET_TO_REPAIR_SUCCESS, ASSET_RESTORE_SUCCESS, CATEGORY_FETCH_FAIL, CATEGORY_FETCH_SUCCESS, CATEGORY_CREATE_SUCCESS, DUPLICATE_CATEGORY_FOUND_ERROR, ID_STATUS_PARAMS_REQUIRED, VALID_STATUS_ACTIONS, INVALID_STATUS_ACTION, STATUS_MAP, STATUS_SUCCESS_MESSAGE_MAP } = require("../utils/stringConstants");


// Create new asset
const createAsset = async (req, res) => {
    try {
        const { name, category, serialNumber, remarks } = req.body;
        const addedBy = req.user._id;
        // Check if any required field is missing in req.body
        if (!addedBy) {
            return res.status(401).json({ message: USER_ID_NOT_FOUND });
        }
        if (!name || !category || !serialNumber) {
            return res.status(404).json({
                message: REQUIRED_FIELDS_NOT_FOUND
            });
        }
        // Check asset if entry already exists
        const assetExist = await Assets.findOne({ serialNumber, addedBy });
        if (assetExist) {
            return res.status(409).json({ message: ASSET_FOUND_IN_DB });
        }
        const newAsset = new Assets({ name, category, serialNumber, addedBy, remarks });
        await newAsset.save();

        res.status(200).json({
            message: ASSET_CREATE_SUCCESS
        });
    } catch (err) {
        console.error(INTERNAL_ERROR_CONSOLE("creating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Update asset data
const updateAsset = async (req, res) => {
    try {
        const { name, category, serialNumber, remarks } = req.body;
        const { id } = req.params;
        const updatedBy = req.user._id;
        console.log("ASSET ID: ", id);
        if (!id) {
            return res.status(401).json({ message: ASSET_ID_NOT_FOUND });
        }
        if (!updatedBy) {
            return res.status(401).json({ message: USER_ID_NOT_FOUND });
        }

        // Check and Update if found
        const updatedData = await Assets.findByIdAndUpdate(
            id,
            { name, category, serialNumber, remarks },
            { new: true }
        ).select('-__v -createdAt');
        if (!updatedData) {
            return res.status(409).json({ message: ASSET_NOT_FOUND_IN_DB });
        }

        res.status(200).json({ message: ASSET_UPDATE_SUCCESS, updatedData });
    } catch(err) {
        console.error(INTERNAL_ERROR_CONSOLE("updating"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Search individual asset by id
const getAssetById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ message: ASSET_ID_NOT_FOUND });
        }
        const getAssetInfo = await Assets.findById(id).select('-__v -createdAt');
        if (!getAssetInfo) {
            return res.status(404).json({ message: ASSET_NOT_FOUND_IN_DB });
        }
        res.status(200).json({ message: ASSET_FETCH_SUCCESS, data: getAssetInfo });
    } catch (err) {
        console.error(INTERNAL_ERROR_CONSOLE("fetching"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Search asset by query
const getAssetByQuery = async (req, res) => {
    try {
        // Fetch asset based on given query
        const { q, cat, status } = req.query;
        const filter = {};
        if (q) {
            filter.name = { $regex: q, $options: 'i' };
        }
        if (cat) {
            filter.category = cat;
        }
        if (status) {
            filter.status = status;
        }
        console.log("filter option: ", filter);
        const fetchedAssets = await Assets.find(filter).select('-__v -createdAt -updatedAt');
        console.log("fetched asset ==> ", fetchedAssets);
        res.status(200).json({ message: ASSET_FETCH_SUCCESS, data: fetchedAssets });
    } catch (err) {
        console.error(INTERNAL_ERROR_CONSOLE("fetching data by query of"), err);
        res.status(500).json({ message: INTERNAL_SERVER_ERROR });
    }
};

// Change asset status as per params
const changeAssetStatus = async (req, res) => {
    try {
        const { id, status } = req.params;
        const updatedBy = req.user._id;
        
        if (!id || !status) {
            return res.status(400).json({ message: ID_STATUS_PARAMS_REQUIRED });
        }

        if (!VALID_STATUS_ACTIONS.includes(status)) {
            return res.status(400).json({ message: INVALID_STATUS_ACTION });
        }

        let allocatedTo = null;
        let remarks;
        
        if (status === 'allocate') {
            allocatedTo = req.body.allocatedTo;
            remarks = req.body.remarks;
        } else {
            allocatedTo = null;
        }

        const updateFields = {
            status: STATUS_MAP[status],
            updatedBy,
            allocatedTo
        }

        if (remarks !== undefined) {
            updateFields.remarks = remarks;
        }

        const dbStatusMessage = STATUS_SUCCESS_MESSAGE_MAP[status];
        
        const updatedAsset = await Assets.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        ).select("-__v -createdAt -updatedAt");

        if (!updatedAsset) {
            return res.status(404).json({ message: ASSET_NOT_FOUND_IN_DB });
        }

        res.status(200).json({ message: dbStatusMessage, data: updatedAsset });
    } catch(err) {
        console.error(INTERNAL_ERROR_CONSOLE("removing the status"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

// Asset Category Controllers

const getAllAssetCategories = async (_req, res) => {
    try {
        const fetchedCategories = await AssetCategories.find();
        if (!fetchedCategories) {
            return res.status(404).json({ message: CATEGORY_FETCH_FAIL })
        }
        
        res.status(200).json({ message: CATEGORY_FETCH_SUCCESS, data: fetchedCategories });
    } catch (err) {
        console.error(INTERNAL_ERROR_CONSOLE("fetching categories of"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

const createNewAssetCategory = async (req, res) => {
    try {
        const name = req.body.name.toLowerCase();
        const newCat = new AssetCategories({ name });
        const createdCat = await newCat.save();

        res.status(200).json({ message: CATEGORY_CREATE_SUCCESS, data: createdCat });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: DUPLICATE_CATEGORY_FOUND_ERROR });
        }
        console.error(INTERNAL_ERROR_CONSOLE("creating new category for"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
    
}

module.exports = {
    createAsset,
    getAssetById,
    getAssetByQuery,
    updateAsset,
    changeAssetStatus,
    getAllAssetCategories,
    createNewAssetCategory
}