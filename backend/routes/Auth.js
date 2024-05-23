const { loginWithZoho, zohoCallback, verifySession, verifyGoogleUser, logout } = require('../controllers/Auth');

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

module.exports = router;