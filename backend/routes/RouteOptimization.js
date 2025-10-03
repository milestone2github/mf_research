// Efficient routing of RMs based on Client-data
const express = require("express");
const {
	getTasks,
	updateUserLocation,
	markCompleted,
	addComments,
	getAllCoordinates,
	getCombinedList,
	fetchFEDetails,
	fetchFEList,
	fetchClientList,
	fetchUnassignedClientsToday,
	fetchUnassignedClientsAllTime,
	fetchOnHoldClients,
	createClient,
	addVisitForExistingClient,
	createFE,
	assignClientsToFE,
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
router.get("/get-combined-list", getCombinedList);

// GET FE list
router.get("/fe/:id/availability", fetchFEDetails);
router.get("/fe/list", fetchFEList);

// GET Clients list
router.get("/clients/list", fetchClientList);

// POST the New Client's details
router.post("/clients/create", createClient);

// POST the New Client's details
router.post("/clients/add-visit", addVisitForExistingClient);

// POST the New Field Executive's details
router.post("/fe/create", createFE);

// GET Unassigned Client's list
router.get("/clients/unassigned/today", fetchUnassignedClientsToday);

router.get("/clients/unassigned/all-time", fetchUnassignedClientsAllTime);

// GET onHold Clients' list
router.get("/clients/on-hold", fetchOnHoldClients);

// Fetch Coordinates from Address (google API)
// router.get()

// POST - Assign a client to FE (/*** IMPROVE THE CONTROLLER ***/)
router.post("/assign-client", assignClientsToFE);

// GET /api/tasks/completed -> Completed tasks of all time
// router.get("/completed", getCompletedTasks);

module.exports = router;