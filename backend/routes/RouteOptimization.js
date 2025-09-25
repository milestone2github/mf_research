// Efficient routing of RMs based on Client-data
const express = require("express");
const { getTasks, updateUserLocation, markCompleted, addComments } = require("../controllers/routeOptimizationController");
const { verifyJWT } = require("../middlewares/verifyToken");
const { feStatusCheck } = require("../middlewares/checkActiveFE");
const router = express.Router();

// Update Field Executive's current location
router.post("/update-current-location", verifyJWT, feStatusCheck, updateUserLocation);

// Fetch pending tasks sorted in optimized order and priority
router.get("/get-tasks", verifyJWT, feStatusCheck, getTasks);

// Mark the client as completed
router.put("/mark-completed", verifyJWT, feStatusCheck, markCompleted);

// Add remarks to the client
router.post("/add-remarks", verifyJWT, feStatusCheck, addComments);

// GET /api/tasks/completed -> Completed tasks of all time
// router.get("/completed", getCompletedTasks);

module.exports = router;