const { getInvestors, getAmcNames, getSchemeNames, getFolios, postTransForm, getUcc, getFoliosFromInvestwell, getNfoSchemes, getNfoAmc, getAllNfoAmc, postNewFundOfferForm, getFoliosFromFolios } = require('../controllers/DataController');

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

// route to get folios from investwell
router.get("/iwell-folios", getFoliosFromInvestwell);

// route to get nfo schemes 
router.get("/nfo-schemes", getNfoSchemes);

// route to get nfo amc 
router.get("/nfo-amc", getNfoAmc);

// route to get ucc data 
router.get("/ucc", getUcc);

// route to get ucc data 
router.post("/nfo", postNewFundOfferForm);

// temporary route to get all amcs 
router.get("/get-all-amc", getAllNfoAmc);

// temporary route to get folios from folios 
router.get("/folios/from-folios", getFoliosFromFolios);

module.exports = router;