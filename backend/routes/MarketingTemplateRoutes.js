const express = require('express');
const {
	getUserTemplates,
	getAllTemplates,
	createTemplate,
	deleteTemplate,
	proxyImageUrl,
	updateTemplate,
	getMarketingOptions,
	createCategory,
	updateCategory,
	deleteCategory,
	createDisclaimer,
	updateDisclaimer,
	deleteDisclaimer,
} = require("../controllers/MarketingTemplateController");
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

router.get("/getList", getMarketingOptions);  // Get Category, Disclaimer Options

router.post("/category", createCategory);
router.put("/category/:id", updateCategory);
router.delete("/category/:id", deleteCategory);

router.post("/disclaimer", createDisclaimer);
router.put("/disclaimer/:id", updateDisclaimer);
router.delete("/disclaimer/:id", deleteDisclaimer);

module.exports = router;
