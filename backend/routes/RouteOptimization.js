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
	searchAddresses,
	fetchUnassignedClientsToday,
	fetchUnassignedClientsAllTime,
	fetchOnHoldClients,
	createClient,
	addVisitForExistingClient,
	createFE,
	assignClientsToFE,
	trackFEAndClient,
	getCoordinatesFromAddress,
} = require("../controllers/routeOptimizationController");
const { verifyJWT } = require("../middlewares/verifyToken");
const router = express.Router();

// Update Field Executive's current location
router.post("/update-current-location", verifyJWT, updateUserLocation);

// Fetch pending tasks sorted in optimized order and priority
router.get("/get-tasks", verifyJWT, getTasks);

// Mark the client as completed
router.post("/mark-completed", verifyJWT, markCompleted);

// Add remarks to the client
router.post("/add-remarks", verifyJWT, addComments);

// Get all the coordinates for current day
router.get("/get-all-coordinates", verifyJWT, getAllCoordinates);

// Web-based Routes

// GET FE-Client list
router.get("/get-combined-list", getCombinedList);

// GET FE list
router.get("/fe/:id/availability", fetchFEDetails);

// GET all active FE list
router.get("/fe/list", fetchFEList);

// Track FE and Client's Location
router.get("/fe/:id/track", trackFEAndClient);

// GET Clients list
router.get("/clients/list", fetchClientList);

// Get address suggestions by posting search string
router.post("/client/searchAddress", searchAddresses);
router.get("/client/getCoordinatesFromAddress", getCoordinatesFromAddress);

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

// POST - Assign a client to FE
router.post("/assign-client", assignClientsToFE);

module.exports = router;