const AssetCategories = require("../models/AssetCategories");
const Assets = require("../models/Assets");
const User = require("../models/User"); 
const Merchant = require("../models/Merchant");
const mongoose = require('mongoose');
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
    const {
      assetCode,
      dateOfPurchase,
      assetName,
      brandName,
      modelNumber,
      serialNumber,
      assetDescriptionSpecification,
      warrantyExpiryDate,
      type,
      merchantId,
      remarks
    } = req.body;

    const addedBy = req.user._id;
    if (!addedBy) {
      return res.status(401).json({ message: USER_ID_NOT_FOUND });
    }

    if (!assetName || !type || !serialNumber) {
      return res.status(400).json({ message: REQUIRED_FIELDS_NOT_FOUND });
    }

    // check for duplicate serial
    const assetExist = await Assets.findOne({ serialNumber });
    if (assetExist) {
      return res.status(409).json({ message: ASSET_FOUND_IN_DB });
    }

    // validate merchantId if provided
    if (merchantId && !mongoose.Types.ObjectId.isValid(merchantId)) {
      return res.status(400).json({ message: "Invalid merchantId" });
    }

    const newAsset = new Assets({
      assetCode,
      dateOfPurchase,
      assetName,
      brandName,
      modelNumber,
      serialNumber,
      assetDescriptionSpecification,
      warrantyExpiryDate,
      type,
      merchantId: merchantId || undefined,
      remarks,
      addedBy
    });

    await newAsset.save();
    res.status(200).json({ message: ASSET_CREATE_SUCCESS, data: newAsset });
  } catch (err) {
    console.error(INTERNAL_ERROR_CONSOLE("creating asset"), err);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

// Update asset data
const updateAsset = async (req, res) => {
  try {
    const {
      assetCode,
      dateOfPurchase,
      assetName,
      brandName,
      modelNumber,
      serialNumber,
      assetDescriptionSpecification,
      warrantyExpiryDate,
      type,
      merchantId,
      remarks
    } = req.body;

    const { id } = req.params;
    const updatedBy = req.user._id;

    if (!id) {
      return res.status(400).json({ message: ASSET_ID_NOT_FOUND });
    }
    if (!updatedBy) {
      return res.status(401).json({ message: USER_ID_NOT_FOUND });
    }

    // validate merchantId if provided
    if (merchantId && !mongoose.Types.ObjectId.isValid(merchantId)) {
      return res.status(400).json({ message: "Invalid merchantId" });
    }

    const updatedData = await Assets.findByIdAndUpdate(
      id,
      {
        assetCode,
        dateOfPurchase,
        assetName,
        brandName,
        modelNumber,
        serialNumber,
        assetDescriptionSpecification,
        warrantyExpiryDate,
        type,
        merchantId: merchantId || undefined,
        remarks,
        updatedBy
      },
      { new: true, runValidators: true }
    ).select("-__v -createdAt");

    if (!updatedData) {
      return res.status(404).json({ message: ASSET_NOT_FOUND_IN_DB });
    }

    res.status(200).json({ message: ASSET_UPDATE_SUCCESS, data: updatedData });
  } catch (err) {
    console.error(INTERNAL_ERROR_CONSOLE("updating asset"), err);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

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
        populate: { path: 'category', model: 'AssetCategory' }
      })
      .populate('merchantId', 'name')
      .populate({
        path: 'allocations.userId',
        select: 'name'
      })
      .populate('addedBy updatedBy', 'name')
      .select('-__v -createdAt')
      .lean({ virtuals: true }); // ✅ ensure allocatedTo shows

    if (!getAssetInfo) {
      return res.status(404).json({ message: ASSET_NOT_FOUND_IN_DB });
    }

    res.status(200).json({ message: ASSET_FETCH_SUCCESS, data: getAssetInfo });
  } catch (err) {
    console.error(INTERNAL_ERROR_CONSOLE("fetching"), err);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};


// Search asset by query
const getAssetByQuery = async (req, res) => {
  try {
    const { q, type, serialNumber, status, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (q) filter.name = { $regex: q, $options: 'i' };
    if (type) filter.type = type;
    if (serialNumber) filter.serialNumber = serialNumber;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const [fetchedAssets, totalCount] = await Promise.all([
      Assets.find(filter)
        .populate({
          path: 'type',
          populate: { path: 'category', model: 'AssetCategory' }
        })
        .populate('merchantId', 'name')
        .populate({
          path: 'allocations.userId',
          select: 'name'
        })
        .select('-__v -createdAt -updatedAt')
        .lean({ virtuals: true })
        .skip(skip)
        .limit(Number(limit)),
      Assets.countDocuments(filter)
    ]);

    res.status(200).json({
      message: ASSET_FETCH_SUCCESS,
      data: fetchedAssets,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        limit: Number(limit)
      }
    });
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

    const asset = await Assets.findById(id).populate("type allocations.userId");
    if (!asset) {
      return res.status(404).json({ message: ASSET_NOT_FOUND_IN_DB });
    }

    let remarks;
    const dbStatusMessage = STATUS_SUCCESS_MESSAGE_MAP[status];

    // 🛑 Prevent removing while allocated
    if (status === "remove" && asset.allocations.some(a => a.status === "allocated")) {
      return res.status(401).json({ message: ASSET_ALLOTTED_ERROR });
    }

    // 🛑 Prevent repair if not available
    if (status === "repair" && asset.status !== "available") {
      return res.status(401).json({ message: ASSET_NOT_AVAILABLE_ERROR });
    }

    if (status === "allocate") {
      const assignedTo = req.body.assignedTo;
      remarks = req.body.remarks;

      if (!assignedTo) {
        return res.status(400).json({ message: "assignedTo is required when allocating" });
      }

      // 🔹 Add new allocation record
      asset.allocations.push({
        userId: assignedTo,
        allocatedAt: new Date(),
        status: "allocated"
      });

      // 🔹 Update user doc
      await User.findByIdAndUpdate(assignedTo, {
        $push: {
          assets: {
            asset: asset._id,
            allocatedAt: new Date(),
            status: "allocated"
          }
        },
        $set: { "onboarding.hasAssestAllocated": true }
      });
    }

    if (status === "deallocate") {
      // 🔹 Mark last allocation as returned
      const lastAlloc = asset.allocations[asset.allocations.length - 1];
      if (lastAlloc && lastAlloc.status === "allocated") {
        lastAlloc.returnedAt = new Date();
        lastAlloc.status = "returned";

        await User.updateOne(
          { "assets.asset": asset._id, "assets.status": "allocated" },
          {
            $set: {
              "assets.$.status": "returned",
              "assets.$.returnedAt": new Date()
            }
          }
        );
      }
    }

    asset.status = STATUS_MAP[status];
    asset.updatedBy = updatedBy;
    if (remarks !== undefined) asset.remarks = remarks;

    await asset.save();

    res.status(200).json({ message: dbStatusMessage, data: asset });
  } catch (err) {
    console.error(INTERNAL_ERROR_CONSOLE("changing asset status"), err);
    res.status(500).json({ message: INTERNAL_SERVER_ERROR });
  }
};

// Bulk change asset statuses (allocate / deallocate multiple)
const changeMultipleAssetStatus = async (req, res) => {
  try {
    const { assets, userId } = req.body;
    if (!Array.isArray(assets) || assets.length === 0) {
      return res.status(400).json({ message: "No assets provided" });
    }
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const updates = [];

    for (const item of assets) {
      const { assetId, op, remarks } = item || {};
      if (!assetId || !op) {
        return res.status(400).json({ message: "assetId and op are required" });
      }
      if (!VALID_STATUS_ACTIONS.includes(op)) {
        return res.status(400).json({ message: "Invalid status action" });
      }

      const asset = await Assets.findById(assetId);
      if (!asset) continue;

      if (op === "allocate") {
        asset.allocations.push({
          userId,
          allocatedAt: new Date(),
          status: "allocated"
        });

        await User.findByIdAndUpdate(userId, {
          $push: {
            assets: {
              asset: asset._id,
              allocatedAt: new Date(),
              status: "allocated"
            }
          },
          $set: { "onboarding.hasAssestAllocated": true }
        });
      }

      if (op === "deallocate") {
        const lastAlloc = asset.allocations[asset.allocations.length - 1];
        if (lastAlloc && lastAlloc.status === "allocated") {
          lastAlloc.returnedAt = new Date();
          lastAlloc.status = "returned";

          await User.updateOne(
            { _id: userId, "assets.asset": asset._id, "assets.status": "allocated" },
            {
              $set: {
                "assets.$.status": "returned",
                "assets.$.returnedAt": new Date()
              }
            }
          );
        }
      }

      asset.status = STATUS_MAP[op];
      asset.updatedBy = req.user._id;
      if (remarks !== undefined) asset.remarks = remarks;

      updates.push(asset.save());
    }

    const updatedAssets = await Promise.all(updates);

    return res.status(200).json({
      message: "Bulk asset status update successful",
      data: updatedAssets
    });
  } catch (err) {
    console.error("Error bulk updating assets:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// Create a new merchant
const createMerchant = async (req, res) => {
  try {
    const { name, phone, email, contactPerson, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Merchant name is required" });
    }

    // optional: prevent duplicate merchants
    const existing = await Merchant.findOne({ name, email });
    if (existing) {
      return res.status(409).json({ message: "Merchant already exists" });
    }

    const newMerchant = new Merchant({
      name,
      phone,
      email,
      contactPerson,
      address,
    });

    await newMerchant.save();
    res.status(201).json({ message: "Merchant created successfully", data: newMerchant });
  } catch (err) {
    console.error("Error creating merchant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update merchant details
const updateMerchant = async (req, res) => {
  try {
    const { id } = req.params; // merchant id
    const { name, phone, email, contactPerson, address } = req.body;

    if (!id) return res.status(400).json({ message: "Merchant ID required" });

    const updatedMerchant = await Merchant.findByIdAndUpdate(
      id,
      { name, phone, email, contactPerson, address },
      { new: true, runValidators: true }
    );

    if (!updatedMerchant) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    res.status(200).json({ message: "Merchant updated successfully", data: updatedMerchant });
  } catch (err) {
    console.error("Error updating merchant:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all merchants (for dropdown)
const getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find().select("_id name");
    res.status(200).json({ success: true, data: merchants });
  } catch (err) {
    console.error(INTERNAL_ERROR_CONSOLE("fetching merchants"), err);
    res.status(500).json({ success: false, message: INTERNAL_SERVER_ERROR });
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
    getAssignedAssets,
    createMerchant,
    updateMerchant,
    getAllMerchants
}