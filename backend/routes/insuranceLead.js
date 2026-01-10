// backend/routes/insuranceLeads.js
const express = require("express");
const verifyUser = require('../middlewares/VerifyUser')
const multer = require("multer");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const {ingestInsuranceLeads, getInsuranceCompanies} = require("../controllers/insuranceLeadsController");
// POST /api/insurance-leads/ingest
router.post("/ingest", verifyUser, upload.single("file"), ingestInsuranceLeads);

// ---------------- New companies route ----------------
router.get("/companies", verifyUser, getInsuranceCompanies);

module.exports = router;
