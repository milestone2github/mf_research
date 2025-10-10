const express = require('express');
const router = express.Router();

const { getLeaderboard } = require('../controllers/leaderboardController');
const { lumpsumAudit, mfSIPAudit, leaderboardAudit, mfLeadersAudit } = require('../controllers/leaderboardPerformance');
const verifyUser = require('../middlewares/VerifyUser');

// GET leaderboard data
router.get('/', getLeaderboard);

// GET Leaderboard performance and individual status view routes
router.get("/performance/lumpsum-audit", verifyUser, lumpsumAudit);

// GET MF-SIP data
router.get("/performance/sip-audit", verifyUser, mfSIPAudit);

// GET individual performance data of insurance leaderboard
router.get("/performance/leaderboard-audit", verifyUser, leaderboardAudit);

// GET MF_Leaders data
router.get("/performance/mf-leader-audit", verifyUser, mfLeadersAudit);

module.exports = router;
