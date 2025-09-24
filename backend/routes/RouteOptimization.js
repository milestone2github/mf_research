// Efficient routing of RMs based on Client-data
const express = require("express");
const { getTasks, updateUserLocation, getCompletedTasks } = require("../controllers/routeOptimizationController");
const { verifyJWT } = require("../middlewares/verifyToken");
const router = express.Router();

// POST /api/user/location
router.post("/updateCurrentLocation", verifyJWT, updateUserLocation);

// GET /api/tasks  -> Pending tasks in priority + optimized order
router.get("/", getTasks);

// GET /api/tasks/completed -> Completed tasks of all time
router.get("/completed", getCompletedTasks);

module.exports = router;