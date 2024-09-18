const { workdrivezohoaccess, getInvestors, getAmcNames, getSchemeNames, getFolios, postTransForm, getUcc, getFoliosFromInvestwell, getNfoSchemes, getNfoAmc, getAllNfoAmc, postNewFundOfferForm, getFoliosFromFolios, getIsin, addNfoSchemeToSchemes, createMarketingUser, updateMarketingUser, getMarketingUser, apinote, apinoteproject, apinoteallproject, workdrivezohocallback } = require('../controllers/DataController');
const { getKycStatus } = require('../controllers/DataController');
const verifyUser = require('../middlewares/VerifyUser');
const router = require('express').Router();
const STATE = 'random_state_string';
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

// route to create new marketing user 
router.post('/marketing/user', verifyUser, createMarketingUser)

// route to FETCH marketing user 
router.get('/marketing/user', verifyUser, getMarketingUser)

// route to update marketing user 
router.patch('/marketing/user/:id', verifyUser, updateMarketingUser)

// temporary route to get all amcs 
router.get("/get-all-amc", getAllNfoAmc);
// temporary route to get folios from folios 
router.get("/folios/from-folios", getFoliosFromFolios);
router.post("/add-scheme", addNfoSchemeToSchemes);
// workdrive
router.post('/api/notes', apinote);
router.get('/api/notes/:nameforproject', apinoteproject);
router.get('/api/notes', apinoteallproject);
router.get('/auth/zoho/callback', workdrivezohocallback);
router.get('/zoho/access', workdrivezohoaccess);
router.get('/auth/zoho', (req, res) => {
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=${process.env.ZOHO_CLIENT_ID}&redirect_uri=${process.env.ZOHO_REDIRECT_URI_WORKDRIVE}&scope=WorkDrive.files.READ,WorkDrive.team.READ,WorkDrive.users.READ,WorkDrive.teamfolders.READ&state=${STATE}`;
    res.redirect(authUrl);
});
module.exports = router;