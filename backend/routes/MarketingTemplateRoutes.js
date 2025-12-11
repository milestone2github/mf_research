const express = require('express');
const { getUserTemplates, getAllTemplates, createTemplate, deleteTemplate, proxyImageUrl, updateTemplate } = require('../controllers/MarketingTemplateController');
const { uploadTemplateImage } = require('../middlewares/uploadTemplateImage');
const router = express.Router();

// User route
router.get('/', getUserTemplates);
router.get('/proxy', proxyImageUrl);

// Admin routes
router.get('/admin', getAllTemplates);
router.post('/', uploadTemplateImage, createTemplate);
router.delete('/:id', deleteTemplate);
router.patch('/:id', updateTemplate);


module.exports = router;
