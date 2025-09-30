// Efficient routing of RMs based on Client-data
const express = require("express");
const {
	getTasks,
	updateUserLocation,
	markCompleted,
	addComments,
	getAllCoordinates,
	getAllFields,
	fetchFEList,
	fetchUnassignedClients,
  fetchOnHoldClients,
	createClient,
	createFE,
	assignClientToFE,
} = require("../controllers/routeOptimizationController");
const { verifyJWT } = require("../middlewares/verifyToken");
// const { feStatusCheck } = require("../middlewares/checkActiveFE");
const router = express.Router();

// Update Field Executive's current location
router.post("/update-current-location", verifyJWT, updateUserLocation);

// Fetch pending tasks sorted in optimized order and priority
router.get("/get-tasks", verifyJWT, getTasks);

// Mark the client as completed
router.put("/mark-completed", verifyJWT, markCompleted);

// Add remarks to the client
router.post("/add-remarks", verifyJWT, addComments);

// Get all the coordinates for current day
router.get("/get-all-coordinates", verifyJWT, getAllCoordinates);

// Web-based Routes

// Implement Zoho-based Auth in middlewares

// GET FE-Client list
router.get("/get-combined-list", getAllFields);

// GET FE list
router.get("/fe/list", fetchFEList);

// GET Unassigned Client's list
router.get("/clients/unassigned", fetchUnassignedClients);

// GET onHold Clients' list
router.get("/clients/onhold", fetchOnHoldClients);

// Fetch Coordinates from Address (google API)
// router.get()

// POST the New Client's details
router.post("/client/create", createClient);

// POST the New Field Executive's details
router.post("/fe/create", createFE);

// POST - Assign a client to FE (/*** IMPROVE THE CONTROLLER ***/)
router.post("/assign-client", assignClientToFE);



// GET /api/tasks/completed -> Completed tasks of all time
// router.get("/completed", getCompletedTasks);

module.exports = router;