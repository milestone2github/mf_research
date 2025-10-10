const express = require('express');
const router = express.Router();

const { getLeaderboard } = require('../controllers/leaderboardController');
const { lumpsumAudit, mfSIP, leaderboardAudit, referralLeaderboard } = require('../controllers/leaderboardPerformance');
const verifyUser = require('../middlewares/VerifyUser');

// Get leaderboard data
router.get('/', getLeaderboard);

// Leaderboard performance and individual status view routes
router.get("/performance/lumpsum-audit", verifyUser, lumpsumAudit);

// Get MF-SIP data
router.get("/performance/sip-audit", verifyUser, mfSIP);



// GET individual performance data of insurance leaderboard
router.get("/performance/leaderboard-audit", verifyUser, leaderboardAudit);

// GET individual performance data of referral leaderboard
router.get("/performance/referral", verifyUser, referralLeaderboard);

module.exports = router;
