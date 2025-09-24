const { loginWithZoho, zohoCallback, verifySession, verifyGoogleUser, logout, fetchSMList, fetchRMList, generateJWT } = require('../controllers/Auth');
const { sendOtpViaWhatsApp, verifyOtpWati } = require('../controllers/otpController');
const { verifyJWT } = require('../middlewares/verifyToken');

const router = require('express').Router();

// route to login with zoho 
router.get("/zoho", loginWithZoho);

// route to zoho callback 
router.get("/zoho/callback", zohoCallback);

// route to verify session 
router.get("/checkLoggedIn", verifySession);

// route to verify google user and store session 
router.post("/google/verify", verifyGoogleUser)

// route to logout user 
router.post("/logout", logout)

// route to fetch service manager from zoho people
router.get("/zoho/fetchServiceManager", fetchSMList);

// route to fetch service manager from zoho people
router.get("/zoho/fetchRelationshipManager", fetchRMList);

// Generate JWT token based on contactNumber
router.post("/generate-jwt", generateJWT);

// Wati-based OTP Authentication
router.post("/send-otp", verifyJWT, sendOtpViaWhatsApp);
router.post("/validate-otp", verifyJWT, verifyOtpWati);

/* // Add sample data to Internal -> RouteOptimization and related db
const {
  Client,
  FE,
  FERoute,
  RouteOptimization,
} = require("../models/RouteOptimization");

router.post("/sampleDataSeed", async (_req, res) => {
	try {
		// Create a client
		const client = await Client.create({
			name: "Lapings Corporation Pvt. Ltd.",
			address: "145 Kezual St",
			contactNumber: "9876543210",
			availability: {
				start: new Date("2025-09-25T09:30:00Z"),
				end: new Date("2025-09-25T12:30:00Z"),
			},
			location: {
				type: "Point",
				coordinates: [87.5946, 13.9716],
			},
			purposeOfVisit: "Collection of Sample",
			priority: 2,
			feComments: "",
		});

		const fe = await FE.create({
			contactNumber: "8130383380",
			employeeId: "FE002",
			name: "Sunny",
			status: "ACTIVE",
		});

		const feRoute = await FERoute.create({
			feId: fe._id,
			baseLocation: { type: "Point", coordinates: [77.58, 12.972] },
			currentLocation: { type: "Point", coordinates: [77.581, 12.973] },
			availability: [
				{
					start: new Date("2025-09-25T08:00:00Z"),
					end: new Date("2025-09-25T18:00:00Z"),
				},
			],
			bookedSlots: [
				{
					client: client._id,
					start: new Date("2025-09-25T09:30:00Z"),
					end: new Date("2025-09-25T10:00:00Z"),
				},
			],
			currentClient: client._id,
		});

		await RouteOptimization.create({
			date: new Date("2025-09-25"),
			feList: [feRoute._id],
			clients: [client._id],
			routes: [
				{
					fe: fe._id,
					client: client._id,
					visitStart: new Date("2025-09-25T09:30:00Z"),
					visitEnd: new Date("2025-09-25T12:30:00Z"),
					order: 1,
					status: "pending",
				},
			],
		});

		res.status(200).json({ message: "Sample Data Seeded!!" });
	} catch (err) {
		console.error("Error seeding data:", err);
		res.status(500).json({ error: "Unable to seed data in DB" });
	}
});
*/

module.exports = router;