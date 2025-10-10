const express = require('express');
const router = express.Router();

const { getLeaderboard } = require('../controllers/leaderboardController');
const verifyUser = require('../middlewares/VerifyUser');

router.get('/leaderboard', verifyUser, getLeaderboard);

// const User = require('../models/User');

// router.get("/getUsers", async (_req, res) => {
//   	const usersLog = await User.find().populate('role');
// 		res.json({ users: usersLog });
// })

module.exports = router;
