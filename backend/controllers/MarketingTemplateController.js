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

// USER ROUTE — get templates with publishDate within next 7 days
const getUserTemplates = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const weekAhead = new Date(today);
    weekAhead.setDate(today.getDate() + 7);
    weekAhead.setHours(23, 59, 59, 999); // End of the 7th day

    const templates = await MarketingTemplate.find({
      publishDate: { $gte: today, $lte: weekAhead }
    }).sort({ publishDate: 1 });

    // add proxy URL directly here
    const processedTemplates = templates.map((tpl) => ({
      ...tpl,
      proxyImageUrl: `${process.env.PROD_URL}/api/marketing-template/proxy?url=${encodeURIComponent(tpl.imageUrl)}`,
    }));

    res.status(200).json({ success: true, data: processedTemplates });
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


// ADMIN ROUTE — Get all templates (optionally filter by publishDate range)
const getAllTemplates = async (req, res) => {
  try {
    const { minDate, maxDate } = req.query;
    let filter = {};

    if (minDate || maxDate) {
      const start = minDate ? new Date(minDate) : new Date();
      const end = maxDate ? new Date(maxDate) : new Date();

      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      filter.publishDate = { $gte: start, $lte: end };
    }
    const templates = await MarketingTemplate.find(filter)
      .sort({ publishDate: -1 })
      .lean();

    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    console.error(" Error fetching admin templates:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN ROUTE — add a new template
const createTemplate = async (req, res) => {
  try {
    const { title, description, publishDate } = req.body;
    const imageUrl = req.imageUrl; // ← comes from middleware

    if (!imageUrl || !title || !publishDate) {
      return res.status(400).json({
        success: false,
        message: 'Image, title, and publishDate are required',
      });
    }

    const newTemplate = new MarketingTemplate({
      imageUrl,
      title,
      description,
      publishDate,
      createdAt: new Date(),
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: newTemplate,
    });
  } catch (error) {
    console.error(' Error creating template:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ADMIN ROUTE — delete a template by ID from Database as well as azure blob
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    // Step 1 - Find and delete from MongoDB
    const deletedTemplate = await MarketingTemplate.findByIdAndDelete(id);
    if (!deletedTemplate) {
      console.warn(` No template found in MongoDB for ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Step 2 - Get image URL
    const imageUrl = deletedTemplate.imageUrl;

    if (imageUrl) {
      try {
        // Step 3 - Extract blob name from URL
        const urlParts = new URL(imageUrl);
        const blobName = decodeURIComponent(urlParts.pathname.replace(`/marketing-material/`, ''));

        // Step 4 - Connect and delete blob
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient('marketing-material');
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const deleteResponse = await blockBlobClient.deleteIfExists();
        if (deleteResponse.succeeded) {
          console.log(` Deleted blob from Azure: ${blobName}`);
        } else {
          console.warn(`Blob not found or already deleted: ${blobName}`);
        }
      } catch (azureErr) {
        console.error(' Error deleting image from Azure Blob Storage:', azureErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully from database and Azure.'
    });

  } catch (error) {
    console.error(' Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting template' });
  }
};


module.exports = {
  getUserTemplates,
  getAllTemplates,
  createTemplate,
  deleteTemplate,
  proxyImageUrl
}
