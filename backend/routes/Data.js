const { getInvestors, getAmcNames, getSchemeNames, getFolios, postTransForm, getUcc, getFoliosFromInvestwell, getNfoSchemes, getNfoAmc, getAllNfoAmc, postNewFundOfferForm, getFoliosFromFolios, getIsin, addNfoSchemeToSchemes } = require('../controllers/DataController');
const { getKycStatus } = require('../controllers/DataController');
const verifyUser = require('../middlewares/verifyUser');
const router = require('express').Router();

// route to submit transaction form data 
router.post("/", verifyUser, postTransForm);

// route to get investors 
router.get("/investors", verifyUser, getInvestors);

// route to get amc names 
router.get("/amc", getAmcNames);

router.post("/kycstatuscheck", getKycStatus);
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
router.post("/nfo", verifyUser, postNewFundOfferForm);

// route to get ucc data 
router.get("/isin", getIsin);

// temporary route to get all amcs 
router.get("/get-all-amc", getAllNfoAmc);

// temporary route to get folios from folios 
router.get("/folios/from-folios", getFoliosFromFolios);
router.post("/add-scheme", addNfoSchemeToSchemes);

module.exports = router;