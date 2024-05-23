const { getInvestors, getAmcNames, getSchemeNames, getFolios, postTransForm } = require('../controllers/DataController');

const router = require('express').Router();

// route to submit transaction form data 
router.post("/", postTransForm);

// route to get investors 
router.get("/investors", getInvestors);

// route to get amc names 
router.get("/amc", getAmcNames);

// route to get scheme names 
router.get("/schemename", getSchemeNames);

// route to get folios 
router.get("/folios", getFolios);

module.exports = router;