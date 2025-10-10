const express = require('express');
const router = express.Router();

const { getLeaderboard } = require('../controllers/leaderboardController');
const { lumpsumAudit, leaderboardAudit } = require('../controllers/leaderboardPerformance');
const verifyUser = require('../middlewares/VerifyUser');

// Get leaderboard data
router.get('/', getLeaderboard);

// Leaderboard performance and individual status view routes
router.get("/performance/lumpsum-audit", verifyUser, lumpsumAudit);

// GET individual performance data of insurance leaderboard
router.get("/performance/leaderboard-audit", verifyUser, leaderboardAudit);

module.exports = router;
