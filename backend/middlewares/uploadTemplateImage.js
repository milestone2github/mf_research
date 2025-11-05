const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

const uploadTemplateImage = [
  upload,
  async (req, res, next) => {
    const file = req.file;
    const { title, publishDate } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    if (!title || !publishDate) {
      return res.status(400).json({ success: false, message: 'Title and publishDate are required' });
    }

    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(
        process.env.AZURE_STORAGE_CONNECTION_STRING
      );

      const containerClient = blobServiceClient.getContainerClient('marketing-material');

      const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
      const formattedDate = new Date(publishDate).toISOString().split('T')[0];

      const blobName = `${formattedDate}_${sanitizedTitle}_${Date.now()}.${file.originalname.split('.').pop()}`;

      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      });

      // store URL in request for controller
      req.imageUrl = `https://${containerClient.accountName}.blob.core.windows.net/${containerClient.containerName}/${blobName}`;

      next();
    } catch (error) {
      console.error('Azure Upload Error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to upload image to Azure', error: error.message,
      });
    }
  },
];

module.exports = { uploadTemplateImage };
