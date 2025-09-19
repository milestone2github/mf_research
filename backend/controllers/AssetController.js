const AssetCategories = require("../models/AssetCategories");
const Assets = require("../models/Assets");
const User = require("../models/User"); 
const AssetType = require("../models/AssetType");
const {
    REQUIRED_FIELDS_NOT_FOUND, 
    INTERNAL_SERVER_ERROR, 
    INTERNAL_ERROR_CONSOLE, 
    USER_ID_NOT_FOUND, 
    ASSET_ID_NOT_FOUND, 
    ASSET_FOUND_IN_DB, 
    ASSET_NOT_FOUND_IN_DB, 
    ASSET_CREATE_SUCCESS, 
    ASSET_FETCH_SUCCESS,  
    ASSET_UPDATE_SUCCESS, 
    CATEGORY_FETCH_SUCCESS, 
    CATEGORY_CREATE_SUCCESS, 
    DUPLICATE_CATEGORY_FOUND_ERROR, 
    ID_STATUS_PARAMS_REQUIRED, 
    VALID_STATUS_ACTIONS, 
    INVALID_STATUS_ACTION, 
    STATUS_MAP, 
    STATUS_SUCCESS_MESSAGE_MAP, 
    ASSET_TYPE_FETCH_SUCCESS, 
    ASSET_TYPE_FIELDS_REQUIRED, 
    ASSET_TYPE_CREATE_SUCCESS, 
    ASSET_ALLOTTED_ERROR,
    ASSET_NOT_AVAILABLE_ERROR,
    CATEGORY_NOT_FOUND,
    ASSET_TYPE_NOT_FOUND,
    ASSET_WITH_TYPE_NOT_FOUND,
    TYPE_ID_NOT_FOUND
} = require("../utils/stringConstants");


// Create new asset
const createAsset = async (req, res) => {
    try {
        const { name, type, serialNumber, remarks } = req.body;
        const addedBy = req.user._id;
        // Check if any required field is missing in req.body
        // console.log("User Id: ======> ", req.user);
        if (!addedBy) {
            return res.status(401).json({ message: USER_ID_NOT_FOUND });
        }
        if (!name || !type || !serialNumber) {
            return res.status(404).json({
                message: REQUIRED_FIELDS_NOT_FOUND
            });
        }
        // Check asset if entry already exists
        const assetExist = await Assets.findOne({ serialNumber, addedBy });
        if (assetExist) {
            return res.status(409).json({ message: ASSET_FOUND_IN_DB });
        }
        const newAsset = new Assets({ name, type, serialNumber, addedBy, remarks });
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
        const { name, type, serialNumber, remarks } = req.body;
        const { id } = req.params;
        const updatedBy = req.user._id;
        // console.log("ASSET ID: ", id);
        if (!id) {
            return res.status(401).json({ message: ASSET_ID_NOT_FOUND });
        }
        if (!updatedBy) {
            return res.status(401).json({ message: USER_ID_NOT_FOUND });
        }

        // Check and Update if found
        const updatedData = await Assets.findByIdAndUpdate(
            id,
            { name, type, serialNumber, remarks },
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

// Fetch individual asset by id
const getAssetById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(404).json({ message: ASSET_ID_NOT_FOUND });
        }
        const getAssetInfo = await Assets.findById(id)
        .populate({
            path: 'type',
            populate: {
                path: 'category',
                model: 'AssetCategory'
            }
          })
          .populate('allocatedTo addedBy updatedBy')
          .select('-__v -createdAt');
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
        const { q, type, serialNumber, status } = req.query;
        const filter = {};
        if (q) {
            filter.name = { $regex: q, $options: 'i' };
        }
        // if (cat) {
        //     filter.category = cat;
        // }
        if (type) {
            filter.type = type;
        }
        if (serialNumber) {
            filter.serialNumber = serialNumber;
        }
        if (status) {
            filter.status = status;
        }
        // console.log("filter option: ", filter);
        const fetchedAssets = await Assets.find(filter)
          .populate({
            path: 'type',
            populate: {
                path: 'category',
                model: 'AssetCategory'
            }
          })
          .populate('allocatedTo')
          .select('-__v -createdAt -updatedAt');
        // console.log("fetched asset ==> ", fetchedAssets);
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
        
        // Fetch asset info for condition based updation
        const checkAssetInfo = await Assets.findById(id).populate('type allocatedTo');

        let allocatedTo = null;
        let remarks;
        
        // Check allocation status before changing it to 'REMOVE'
        if (status === 'remove') {
            if (checkAssetInfo.allocatedTo) {
                return res.status(401).json({ message: ASSET_ALLOTTED_ERROR });
            }
        }

        // Check current status for updating to 'REPAIR'
        if (status === 'repair') {
            if (checkAssetInfo.status !== 'available') {
                return res.status(401).json({ message: ASSET_NOT_AVAILABLE_ERROR });
            }
        }

        // Take input from body if allocating asset to someone
        if (status === 'allocate') {
            allocatedTo = req.body.assignedTo;
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

// Bulk change asset statuses (allocate / deallocate multiple)
const changeMultipleAssetStatus = async (req, res) => {
  try {
    const { assets, userId } = req.body; // <-- include userId
    if (!Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ message: "No assets provided" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const updates = [];

    for (const item of assets) {
      const { assetId, op, assignedTo, remarks } = item || {};

      if (!assetId || !op) {
        return res.status(400).json({ message: "assetId and op are required" });
      }
      if (!VALID_STATUS_ACTIONS.includes(op)) {
        return res.status(400).json({ message: "Status doesn't match any valid action." });
      }

      const updateFields = {
        status: STATUS_MAP[op],       // allocate -> allocated, deallocate -> available, ...
        updatedBy: req.user._id
      };

      if (op === "allocate") updateFields.allocatedTo = assignedTo;
      if (op === "deallocate") updateFields.allocatedTo = null;
      if (remarks !== undefined) updateFields.remarks = remarks;

      updates.push(
        Assets.findByIdAndUpdate(assetId, updateFields, {
          new: true,
          runValidators: true
        }).select("-__v -createdAt -updatedAt")
      );
    }

    const updatedAssets = await Promise.all(updates);

    // 🔒 (Optional) If you want to ensure all ops are for the same target user, you can assert here.
    // const onlyOneAssignedTo = new Set(assets.filter(a => a.op === 'allocate').map(a => a.assignedTo)).size <= 1

    // ✅ Flip the onboarding flag for this user in the same request
    await User.findByIdAndUpdate(
      userId,
      { $set: { "onboarding.hasAssestAllocated": true } },
      { new: true }
    ).select("_id onboarding.hasAssestAllocated");

    return res.status(200).json({
      message: "Bulk asset status update successful",
      data: updatedAssets
    });
  } catch (err) {
    console.error("Error bulk updating assets:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Asset Category Controllers

// const getAllAssetCategories = async (_req, res) => {
//     try {
//         const fetchedCategories = await AssetCategories.find();
//         if (!fetchedCategories) {
//             return res.status(404).json({ message: CATEGORY_FETCH_FAIL })
//         }
        
//         res.status(200).json({ message: CATEGORY_FETCH_SUCCESS, data: fetchedCategories });
//     } catch (err) {
//         console.error(INTERNAL_ERROR_CONSOLE("fetching categories of"), err);
//         res.status(500).json({
//             message: INTERNAL_SERVER_ERROR
//         });
//     }
// }

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

// Asset types & associated categories
const getAllAssetTypes = async (req, res) => {
    try {
        const { cat, allCat } = req.query;
    
        // Case 1: fetch all types associated with given category
        if (cat) {
          const category = await AssetCategories.findById(cat);
          if (!category) return res.status(404).json({ message: CATEGORY_NOT_FOUND });
    
          const types = await AssetType.find({ category: cat }).select('_id name');
          return res.status(200).json({ message: ASSET_FETCH_SUCCESS, data: types });
        }
    
        // Case 2: fetch all categories
        if (allCat === "true") {
          const allCategories = await AssetCategories.find().select('-__v -createdAt -updatedAt');
          return res.status(200).json({ message: CATEGORY_FETCH_SUCCESS, data: allCategories });
        }
    
        // Default: fetch all asset types with categories
        const fetchAllTypes = await AssetType.find()
          .populate('category', '_id name')
          .select('-__v -createdAt -updatedAt');
          
        return res.status(200).json({ message: ASSET_TYPE_FETCH_SUCCESS, data: fetchAllTypes });
    } catch (err) {
        console.error(INTERNAL_ERROR_CONSOLE("fetching the types & categories of"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

const getAssetsByTypeId = async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
          const assets = await Assets.find({ type: id })
            .populate({
                path: 'type',
                populate: {
                    path: 'category',
                    model: 'AssetCategory'
                }
            })
            .populate('allocatedTo addedBy updatedBy')
            .select('-__v -createdAt -updatedAt');
          if (!assets || assets.length === 0) {
            return res.status(404).json({ message: ASSET_WITH_TYPE_NOT_FOUND });
          }
          return res.status(200).json({ message: ASSET_FETCH_SUCCESS, data: assets });
        }
    } catch (err) {
        console.error(INTERNAL_ERROR_CONSOLE("fetching based on type id of"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });        
    }
}

const createAssetType = async (req, res) => {
    try {
        const { name, category } = req.body;
        if (!name || !category) {
            return res.status(400).json({ message: ASSET_TYPE_FIELDS_REQUIRED });
        }
        const newType = new AssetType({ name, category });
        await newType.save();

        res.status(200).json({ message: ASSET_TYPE_CREATE_SUCCESS });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: DUPLICATE_CATEGORY_FOUND_ERROR });
        }
        console.error(INTERNAL_ERROR_CONSOLE("creating new types for"), err);
        res.status(500).json({
            message: INTERNAL_SERVER_ERROR
        });
    }
}

const getAssignedAssets = async (req, res) => {
	try {
		const { q, sortBy } = req.query; // q = search term ; sortBy = sort the allocated time

		// Base filter: only allocated assets
		const filter = { allocatedTo: { $ne: null } };

		// Fetch assets with population
		let assets = await Assets.find(filter)
			.populate("allocatedTo", "name email")
			.populate("updatedBy", "name email")
			.select("name remarks allocatedTo updatedBy updatedAt")
			.lean();

		// Apply regex filtering on populated fields
		let queryResponse = assets;
		if (q) {
			const regex = new RegExp(q, "i");
			queryResponse = assets.filter((asset) =>
                regex.test(asset.name) ||
                regex.test(asset.allocatedTo?.name || "") ||
                regex.test(asset.updatedBy?.name || "") ||
                regex.test(asset.remarks || "")
			);
		}

		// Sorting by allotment date (updatedAt) if available
		if (sortBy === "asc") {
			queryResponse = queryResponse.sort(
				(a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
			);
		} else {
			queryResponse = queryResponse.sort(
				(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
			);
		}

		// Format response
		const result = queryResponse.map((asset) => ({
			assetName: asset.name,
			userName: asset.allocatedTo?.name || "N.A.",
			updatedBy: asset.updatedBy?.name || "N.A.",
			remarks: asset.remarks || "",
			allotmentDate: asset.updatedAt,
		}));

		res.status(200).json({ message: "Assigned assets fetched successfully", data: result });
	} catch (err) {
		console.error(INTERNAL_ERROR_CONSOLE("fetching assigned assets"), err);
		res.status(500).json({ message: INTERNAL_SERVER_ERROR });
	}
};


module.exports = {
    createAsset,
    getAssetById,
    getAssetByQuery,
    updateAsset,
    changeAssetStatus,
    changeMultipleAssetStatus,
    // getAllAssetCategories,
    createNewAssetCategory,
    getAllAssetTypes,
    createAssetType,
    getAssetsByTypeId,
    getAssignedAssets
}