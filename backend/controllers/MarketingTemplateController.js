const { BlobServiceClient } = require('@azure/storage-blob');
const MarketingTemplate = require('../models/MarketingTemplate');
const axios = require('axios')

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
const getUserTemplates = async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const templates = await MarketingTemplate.find({
      $or: [
        // Marketing collateral: never ends -> always show
        { category: "MARKETING_COLLATERAL" },

        // Marketing: show from publishDate to closeDate
        {
          category: { $ne: "MARKETING_COLLATERAL" }, // treat missing category as MARKETING
          publishDate: { $lte: today }, // already started
          $or: [
            { closeDate: null }, // no end date
            { closeDate: { $exists: false } }, // old records
            { closeDate: { $gte: today } }, // still active
          ],
        },
      ],
    }).sort({ publishDate: 1 });

    const requestBase = `${req.protocol}://${req.get("host")}`;

    // IMPORTANT: your proxy endpoint is /api/marketing-template/proxy
    const processedTemplates = templates.map((tpl) => {
          const obj = tpl.toObject();

          return {
            ...obj,
            // disclaimer is already stored as type (MUTUAL_FUND / INSURANCE / STOCK_MARKET)
            disclaimerType: obj.disclaimer, // optional alias for frontend
            proxyImageUrl: `${requestBase}/api/marketing-template/proxy?url=${encodeURIComponent(obj.imageUrl)}`,
          };
        });
    res.status(200).json({ success: true, data: processedTemplates });
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// ADMIN ROUTE — Get all templates (optionally filter by publishDate range)
const getAllTemplates = async (req, res) => {
  try {
    const { minDate, maxDate, page = 1, limit = 12 } = req.query;
    let filter = {};

    if (minDate || maxDate) {
      const start = minDate ? new Date(minDate) : new Date();
      const end = maxDate ? new Date(maxDate) : new Date();

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.publishDate = { $gte: start, $lte: end };
    }
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(limit, 10) || 10, 1);

    const totalCount = await MarketingTemplate.countDocuments(filter);
    const totalPages = Math.max(Math.ceil(totalCount / perPage), 1);
    const safePage = Math.min(currentPage, totalPages);
    const skip = (safePage - 1) * perPage;

    const templates = await MarketingTemplate.find(filter)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(perPage)
      .lean();

    res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        currentPage: safePage,
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
      disclaimer, // now this will be disclaimerType like "MUTUAL_FUND"
    } = req.body;

    const imageUrl = req.imageUrl;

    if (!imageUrl || !title || !publishDate) {
      return res.status(400).json({
        success: false,
        message: "Image, title, and publishDate are required",
      });
    }

    const finalCategory = category || "MARKETING";

    // MARKETING => closeDate compulsory
    if (finalCategory === "MARKETING" && !closeDate) {
      return res.status(400).json({
        success: false,
        message: "closeDate is required for MARKETING category",
      });
    }

    // If collateral, force closeDate = null
    const finalCloseDate =
      finalCategory === "MARKETING_COLLATERAL" ? null : closeDate;

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

    // optional: validate disclaimer type
    const ALLOWED_DISCLAIMER_TYPES = ["MUTUAL_FUND", "INSURANCE", "STOCK_MARKET"];
    if (disclaimer && !ALLOWED_DISCLAIMER_TYPES.includes(disclaimer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid disclaimer type",
      });
    }

    const newTemplate = new MarketingTemplate({
      imageUrl,
      title,
      description,
      category: finalCategory,
      publishDate,

      // store ONLY disclaimer TYPE in DB (field name `disclaimer` kept)
      disclaimer: disclaimer || null,

      closeDate: finalCloseDate,
      createdAt: new Date(),
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

    const ALLOWED_DISCLAIMER_TYPES = ["MUTUAL_FUND", "INSURANCE", "STOCK_MARKET"];

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
    const existing = await MarketingTemplate.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    // final category after update
    const finalCategory = category || existing.category || "MARKETING";

    // disclaimer validation (if sent)
    if (disclaimer !== undefined) {
      if (!disclaimer) {
        return res.status(400).json({
          success: false,
          message: "disclaimer is required",
        });
      }
      if (!ALLOWED_DISCLAIMER_TYPES.includes(disclaimer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid disclaimer type",
        });
      }
    }

    // build update object
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (publishDate) updateData.publishDate = publishDate;
    if (category) updateData.category = category;
    if (disclaimer !== undefined) updateData.disclaimer = disclaimer;

    /**
     * closeDate rules:
     * - If category becomes COLLATERAL => force closeDate = null
     * - Else allow closeDate update / clear
     */
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

    const finalCloseDate =
      finalCategory === "MARKETING_COLLATERAL"
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

module.exports = {
  getUserTemplates,
  getAllTemplates,
  createTemplate,
  deleteTemplate,
  updateTemplate,
  proxyImageUrl,
};
