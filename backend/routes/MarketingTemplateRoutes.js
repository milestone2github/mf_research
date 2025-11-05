const express = require('express');
const { getUserTemplates, getAllTemplates, createTemplate, deleteTemplate, proxyImageUrl } = require('../controllers/marketingTemplateController');
const { uploadTemplateImage } = require('../middlewares/uploadTemplateImage');
const router = express.Router();

// User route
router.get('/', getUserTemplates);
router.get('/proxy', proxyImageUrl);

// Admin routes
router.get('/admin', getAllTemplates);
router.post('/', uploadTemplateImage, createTemplate);
router.delete('/:id', deleteTemplate);


module.exports = router;
