const { BlobServiceClient } = require('@azure/storage-blob');
const {
  MarketingTemplate,
  MarketingCategory,
  DisclaimerOptions,
} = require("../models/MarketingTemplate");
const axios = require('axios');
const mongoose = require("mongoose");

const proxyImageUrl = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ success: false, message: "Missing URL parameter" });
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const contentType = response.headers["content-type"];

    res.setHeader("Content-Type", contentType);
    res.send(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch image" });
  }
};

// USER ROUTE — get templates with publishDate within next 15 days
// const getUserTemplates = async (req, res) => {
//   try {
//     const today = new Date();
//     today.setUTCHours(0, 0, 0, 0);
//     const templates = await MarketingTemplate.find({
//       $or: [
//         // Marketing collateral: never ends -> always show
//         { category: "MARKETING_COLLATERAL" },

//         // Marketing: show from publishDate to closeDate
//         {
//           category: { $ne: "MARKETING_COLLATERAL" }, // treat missing category as MARKETING
//           publishDate: { $lte: today }, // already started
//           $or: [
//             { closeDate: null }, // no end date
//             { closeDate: { $exists: false } }, // old records
//             { closeDate: { $gte: today } }, // still active
//           ],
//         },
//       ],
//     }).sort({ publishDate: 1 });

//     const requestBase = `${req.protocol}://${req.get("host")}`;

//     // IMPORTANT: your proxy endpoint is /api/marketing-template/proxy
//     const processedTemplates = templates.map((tpl) => {
//           const obj = tpl.toObject();

//           return {
//             ...obj,
//             // disclaimer is already stored as type (MUTUAL_FUND / INSURANCE / STOCK_MARKET)
//             disclaimerType: obj.disclaimer, // optional alias for frontend
//             proxyImageUrl: `${requestBase}/api/marketing-template/proxy?url=${encodeURIComponent(obj.imageUrl)}`,
//           };
//         });
//     res.status(200).json({ success: true, data: processedTemplates });
//   } catch (error) {
//     console.error('Error fetching user templates:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// Updated USER ROUTE - category and disclaimer defined as separate model
const getUserTemplates = async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // single selected category (key)
    const selectedCategory = req.query.category || null;

    const templates = await MarketingTemplate.find({
      publishDate: { $lte: today },
      $or: [
        { closeDate: null },
        { closeDate: { $exists: false } },
        { closeDate: { $gte: today } },
      ],
    })
      .populate({
        path: "category",
        match: { isActive: true },
        select: "key label",
      })
      .populate({
        path: "disclaimer",
        match: { isActive: true, isDeleted: false },
        select: "key label",
      })
      .sort({ publishDate: 1 });

    const requestBase = `${req.protocol}://${req.get("host")}`;

    const processed = templates
      .filter((tpl) => tpl.category && tpl.disclaimer) // drop inactive/deleted refs
      .map((t) => {
        const obj = t.toObject();

        return {
          ...obj,
          category: {
            key: obj.category.key,
            label: obj.category.label,
          },
          disclaimerType: obj.disclaimer.key, // string key
          proxyImageUrl: `${requestBase}/api/marketing-template/proxy?url=${encodeURIComponent(
            obj.imageUrl
          )}`,
        };
      });

    /* ---------- CLUB SELECTED CATEGORY ON TOP ---------- */
    let data;

    if (selectedCategory) {
      const matching = [];
      const rest = [];

      for (const tpl of processed) {
        if (tpl.category.key === selectedCategory) {
          matching.push(tpl);
        } else {
          rest.push(tpl);
        }
      }

      data = [...matching, ...rest];
    } else {
      data = processed;
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error fetching user templates:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN ROUTE — Get all templates (optionally filter by publishDate range)
const getAllTemplates = async (req, res) => {
  try {
    const { minDate, maxDate, page = 1, limit = 12, priorityCategory } = req.query;
    let match = {};

    if (minDate || maxDate) {
      const start = minDate ? new Date(minDate) : new Date();
      const end = maxDate ? new Date(maxDate) : new Date();

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      match.publishDate = { $gte: start, $lte: end };
    }
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (currentPage - 1) * perPage;

    const pipeline = [];

    // 1. Match filters
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    // 2. Lookup Category (with isActive check simulation)
    pipeline.push({
      $lookup: {
        from: "marketingcategories",
        let: { catId: "$category" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$catId"] } } },
          { $match: { isActive: true } },
          { $project: { key: 1, label: 1, _id: 1 } }
        ],
        as: "category"
      }
    });
    pipeline.push({ $unwind: { path: "$category", preserveNullAndEmptyArrays: true } });

    // 3. Lookup Disclaimer
    pipeline.push({
      $lookup: {
        from: "disclaimeroptions",
        let: { discId: "$disclaimer" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$discId"] } } },
          { $match: { isActive: true, isDeleted: false } }, // Ensure deleted/inactive are filtered
          { $project: { key: 1, label: 1, _id: 1, text: 1 } }
        ],
        as: "disclaimer"
      }
    });
    pipeline.push({ $unwind: { path: "$disclaimer", preserveNullAndEmptyArrays: true } });

    // 4. Calculate Priority
    if (priorityCategory) {
      pipeline.push({
        $addFields: {
          isPriority: {
            $cond: {
              if: {
                $and: [
                  { $ifNull: ["$category._id", false] }, // category must exist
                  { $eq: ["$category._id", new mongoose.Types.ObjectId(priorityCategory)] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      });
      // Sort
      pipeline.push({ $sort: { isPriority: -1, publishDate: -1 } });
    } else {
      pipeline.push({ $sort: { publishDate: -1 } });
    }

    // 5. Facet for Pagination
    pipeline.push({
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: perPage }]
      }
    });

    const result = await MarketingTemplate.aggregate(pipeline);

    const data = result[0].data;
    const totalCount = result[0].metadata[0]?.total || 0;
    const totalPages = Math.max(Math.ceil(totalCount / perPage), 1);

    res.status(200).json({
      success: true,
      data: data,
      pagination: {
        currentPage,
        totalPages,
        totalItems: totalCount,
        limit: perPage,
      },
    });
  } catch (error) {
    console.error("Error fetching admin templates:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error while fetching templates" });
  }
};

const createTemplate = async (req, res) => {
  try {
    const {
      title,
      description,
      publishDate,
      closeDate,
      category,
      disclaimer,
    } = req.body;

    const imageUrl = req.imageUrl;

    if (!imageUrl || !title || !publishDate) {
      return res.status(400).json({
        success: false,
        message: "Image, title, and publishDate are required",
      });
    }

    console.log("Category ==> ", category); // debug

    // CATEGORY CHECK
    const categoryDoc = await MarketingCategory.findOne({
      _id: category,
      isActive: true,
    });

    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: "Category not found. Create it first.",
      });
    }

    const categoryKey = categoryDoc.key;

    // DISCLAIMER CHECK
    let disclaimerId = null;
    if (disclaimer) {
      const disclaimerDoc = await DisclaimerOptions.findOne({
        _id: disclaimer,
        isActive: true,
        isDeleted: false,
      });

      if (!disclaimerDoc) {
        return res.status(400).json({
          success: false,
          message: "Invalid disclaimer",
        });
      }

      disclaimerId = disclaimerDoc._id;
    }

    // const ALLOWED_CATEGORIES = ["MARKETING", "MARKETING_COLLATERAL"];

    // Check Category
    // if (category && !ALLOWED_CATEGORIES.includes(category)) {
    //   console.log("Category not included in default list. Incoming Category = ", category);
    // }
    // const finalCategory = category || "MARKETING";

    // MARKETING => closeDate compulsory
    if (categoryKey === "MARKETING" && !closeDate) {
      return res.status(400).json({
        success: false,
        message: "closeDate is required for MARKETING category",
      });
    }

    // If collateral, force closeDate = null
    const finalCloseDate = categoryKey === "MARKETING_COLLATERAL" ? null : closeDate;

    // validate closeDate >= publishDate (only if NOT collateral and closeDate provided)
    if (finalCloseDate) {
      const pub = new Date(publishDate);
      const close = new Date(finalCloseDate);

      if (isNaN(pub) || isNaN(close)) {
        return res.status(400).json({
          success: false,
          message: "Invalid publishDate or closeDate",
        });
      }
      if (close < pub) {
        return res.status(400).json({
          success: false,
          message: "closeDate cannot be before publishDate",
        });
      }
    }

    const newTemplate = new MarketingTemplate({
      imageUrl,
      title,
      description,
      category: categoryDoc._id,
      disclaimer: disclaimerId,
      publishDate,
      closeDate: finalCloseDate,
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// ADMIN ROUTE — update a template by ID
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      publishDate,
      closeDate,
      category,
      disclaimer, // disclaimer type: MUTUAL_FUND / INSURANCE / STOCK_MARKET
    } = req.body;

    // const ALLOWED_DISCLAIMER_TYPES = ["MUTUAL_FUND", "INSURANCE", "STOCK_MARKET"];

    // nothing provided
    if (
      !title &&
      !description &&
      !publishDate &&
      closeDate === undefined &&
      !category &&
      disclaimer === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Nothing to update. Provide at least one field: title, description, category, disclaimer, publishDate, or closeDate.",
      });
    }

    // get existing template (needed for validations)
    const existing = await MarketingTemplate.findById(id)
      .populate("category")
      .populate("disclaimer")
      .lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    let finalCategoryId = existing.category?._id;
    let finalDisclaimerId = existing.disclaimer?._id;

    // Check if Category exist in DB
    if (category) {
      const categoryDoc = await MarketingCategory.findOne({
        _id: category,
        isActive: true,
      });
      if (!categoryDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category" });
      }
      finalCategoryId = categoryDoc._id;
    }

    // Check if Disclaimer exist in DB
    if (disclaimer !== undefined) {
      const disclaimerDoc = await DisclaimerOptions.findOne({
        _id: disclaimer,
        isActive: true,
        isDeleted: false,
      });
      if (!disclaimerDoc) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid disclaimer" });
      }
      finalDisclaimerId = disclaimerDoc._id;
    }

    // const finalCategory = category || existing.category.key || "MARKETING";
    // const checkDisclaimer = await DisclaimerOptions.findOne({ key: disclaimer });
    // // disclaimer validation (if sent)
    // if (disclaimer !== undefined) {
    //   if (!disclaimer) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "disclaimer is required",
    //     });
    //   }

    // if (!ALLOWED_DISCLAIMER_TYPES.includes(disclaimer) {
    // if (!checkDisclaimer) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid disclaimer type",
    //   });
    //   }
    // }

    // build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (publishDate) updateData.publishDate = publishDate;
    if (finalCategoryId) updateData.category = finalCategoryId;
    if (finalDisclaimerId) updateData.disclaimer = finalDisclaimerId;

    /**
     * closeDate rules:
     * - If category becomes COLLATERAL => force closeDate = null
     * - Else allow closeDate update / clear
     */

    // final category after update
    const finalCategory = category || existing.category?.key || "MARKETING";
    if (finalCategory === "MARKETING_COLLATERAL") {
      updateData.closeDate = null;
    } else if (closeDate !== undefined) {
      // allow clearing by "" or null
      updateData.closeDate = closeDate ? closeDate : null;
    }

    // final dates for validation
    const finalPublishDate = publishDate
      ? new Date(publishDate)
      : new Date(existing.publishDate);

    const finalCloseDate = finalCategory === "MARKETING_COLLATERAL"
      ? null
      : closeDate !== undefined
        ? closeDate
          ? new Date(closeDate)
          : null
        : existing.closeDate
          ? new Date(existing.closeDate)
          : null;

    // MARKETING => closeDate compulsory
    if (finalCategory === "MARKETING" && !finalCloseDate) {
      return res.status(400).json({
        success: false,
        message: "closeDate is required for MARKETING category",
      });
    }

    // validate closeDate >= publishDate
    if (finalCloseDate) {
      if (isNaN(finalPublishDate) || isNaN(finalCloseDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid publishDate or closeDate",
        });
      }
      if (finalCloseDate < finalPublishDate) {
        return res.status(400).json({
          success: false,
          message: "closeDate cannot be before publishDate",
        });
      }
    }

    // update
    const updatedTemplate = await MarketingTemplate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Template updated successfully.",
      data: updatedTemplate,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating template",
    });
  }
};

// ADMIN ROUTE — delete a template by ID from Database as well as azure blob
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1 - Find and delete from MongoDB
    const deletedTemplate = await MarketingTemplate.findByIdAndDelete(id);
    if (!deletedTemplate) {
      console.warn(`No template found in MongoDB for ID: ${id}`);
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    // Step 2 - Get image URL
    const imageUrl = deletedTemplate.imageUrl;

    if (imageUrl) {
      try {
        // Step 3 - Extract blob name from URL
        const urlParts = new URL(imageUrl);
        const blobName = decodeURIComponent(
          urlParts.pathname.replace(`/marketing-material/`, "")
        );

        // Step 4 - Connect and delete blob
        const blobServiceClient = BlobServiceClient.fromConnectionString(
          process.env.AZURE_STORAGE_CONNECTION_STRING
        );
        const containerClient = blobServiceClient.getContainerClient("marketing-material");
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const deleteResponse = await blockBlobClient.deleteIfExists();
        if (deleteResponse.succeeded) {
          console.log(`Deleted blob from Azure: ${blobName}`);
        } else {
          console.warn(`Blob not found or already deleted: ${blobName}`);
        }
      } catch (azureErr) {
        console.error("Error deleting image from Azure Blob Storage:", azureErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
      data: { _id: deletedTemplate._id, title: deletedTemplate.title },
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error while deleting template" });
  }
};

// GET Marketing Category and Disclaimer options
const getMarketingOptions = async (_req, res) => {
  try {
    const category = await MarketingCategory.find({
      isActive: true,
      isDeleted: false,
    }).lean();
    const disclaimerOptions = await DisclaimerOptions.find({
      isActive: true,
      isDeleted: false,
    }).lean();

    res.status(200).json({ success: true, category, disclaimerOptions });
  } catch (err) {
    console.error("Error Fetching Marketing Options: ", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// CATEGORY CRUD
const createCategory = async (req, res) => {
  const { key, label } = req.body;

  if (!key || !label) {
    return res
      .status(400)
      .json({ success: false, message: "key and label required" });
  }

  const exists = await MarketingCategory.findOne({ key });
  if (exists) {
    return res
      .status(409)
      .json({ success: false, message: "Category already exists" });
  }

  const category = await MarketingCategory.create({ key, label });
  res.status(201).json({ success: true, data: category });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { label, isActive } = req.body;

  if (label === undefined && isActive === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  const updated = await MarketingCategory.findByIdAndUpdate(
    id,
    {
      $set: {
        ...(label && { label }),
        ...(isActive !== undefined && { isActive }),
      },
    },
    { new: true }
  );

  if (!updated) {
    return res
      .status(404)
      .json({ success: false, message: "Category not found" });
  }

  res.json({ success: true, data: updated });
};


const deleteCategory = async (req, res) => {
  const { id } = req.params;

  const inUse = await MarketingTemplate.exists({ category: id });
  if (inUse) {
    return res.status(409).json({
      success: false,
      message: "Category in use. Disable instead of delete.",
    });
  }

  await MarketingCategory.findByIdAndDelete(id);
  res.json({ success: true, message: "Category deleted" });
};

// DISCLAIMER CRUD
const createDisclaimer = async (req, res) => {
  const { key, label, text } = req.body;

  if (!key || !label || !text) {
    return res
      .status(400)
      .json({ success: false, message: "key, label and text required" });
  }

  const exists = await DisclaimerOptions.findOne({ key });
  if (exists) {
    return res
      .status(409)
      .json({ success: false, message: "Disclaimer already exists" });
  }

  const disclaimer = await DisclaimerOptions.create({ key, label, text });
  res.status(201).json({ success: true, data: disclaimer });
};


const updateDisclaimer = async (req, res) => {
  const { id } = req.params;
  const { label, text, isActive } = req.body;

  if (label === undefined && isActive === undefined && text === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update" });
  }

  const updated = await DisclaimerOptions.findByIdAndUpdate(
    id,
    {
      $set: {
        ...(label && { label }),
        ...(isActive !== undefined && { isActive }),
        ...(text !== undefined && { text }),
      },
    },
    { new: true }
  );

  if (!updated) {
    return res
      .status(404)
      .json({ success: false, message: "Disclaimer not found" });
  }

  res.json({ success: true, data: updated });
};


const deleteDisclaimer = async (req, res) => {
  const { id } = req.params;

  const inUse = await MarketingTemplate.exists({ disclaimer: id });
  if (inUse) {
    return res.status(409).json({
      success: false,
      message: "Disclaimer in use. Disable instead of delete.",
    });
  }

  await DisclaimerOptions.findByIdAndUpdate(id, {
    isDeleted: true,
    isActive: false,
  });

  res.json({ success: true, message: "Disclaimer deleted" });
};


module.exports = {
  getUserTemplates,
  getAllTemplates,
  createTemplate,
  deleteTemplate,
  updateTemplate,
  proxyImageUrl,
  getMarketingOptions,
  createCategory,
  updateCategory,
  deleteCategory,
  createDisclaimer,
  updateDisclaimer,
  deleteDisclaimer
};
