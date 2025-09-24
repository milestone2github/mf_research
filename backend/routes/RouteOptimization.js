// Efficient routing of RMs based on Client-data
const express = require("express");
const { getTasks, updateUserLocation, getCompletedTasks, markVisited } = require("../controllers/routeOptimizationController");
const { verifyJWT } = require("../middlewares/verifyToken");
const { feStatusCheck } = require("../middlewares/checkActiveFE");
const router = express.Router();

// POST /api/user/location
router.post("/update-current-location", verifyJWT, feStatusCheck, updateUserLocation);

// GET /api/tasks  -> Pending tasks in priority + optimized order
router.get("/get-tasks", verifyJWT, feStatusCheck, getTasks);

// GET /api/tasks  -> Pending tasks in priority + optimized order
router.put("/mark-visited", verifyJWT, feStatusCheck, markVisited);

// GET /api/tasks/completed -> Completed tasks of all time
router.get("/completed", getCompletedTasks);

module.exports = router;