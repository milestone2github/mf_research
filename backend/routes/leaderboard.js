const express = require('express');
const router = express.Router();

const { getLeaderboard } = require('../controllers/leaderboardController');
const { lumpsumAudit } = require('../controllers/leaderboardPerformance');

// Get leaderboard data
router.get('/', getLeaderboard);

// Leaderboard performance and individual status view routes
router.get("/performance/lumpsum-audit", lumpsumAudit);

module.exports = router;
