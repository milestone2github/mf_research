const { loginWithZoho, zohoCallback, verifySession, verifyGoogleUser, logout, fetchSMList, fetchRMList, generateJWT } = require('../controllers/Auth');
const { sendOtpViaWhatsApp, verifyOtpWati } = require('../controllers/otpController');
const { verifyJWT } = require('../middlewares/verifyToken');

const router = require('express').Router();

// route to login with zoho 
router.get("/zoho", loginWithZoho);

// route to zoho callback 
router.get("/zoho/callback", zohoCallback);

// route to verify session 
router.get("/checkLoggedIn", verifySession);

// route to verify google user and store session 
router.post("/google/verify", verifyGoogleUser)

// route to logout user 
router.post("/logout", logout)

// route to fetch service manager from zoho people
router.get("/zoho/fetchServiceManager", fetchSMList);

// route to fetch service manager from zoho people
router.get("/zoho/fetchRelationshipManager", fetchRMList);

// Generate JWT token based on contactNumber
router.post("/generate-jwt", generateJWT);

// Wati-based OTP Authentication
router.post("/sendOtp", verifyJWT, sendOtpViaWhatsApp);
router.post("/validateOtp", verifyJWT, verifyOtpWati);

module.exports = router;