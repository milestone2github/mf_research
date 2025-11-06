// Worker function to calculate optimize order for assigned Clients

const axios = require("axios");
const { ClientMeeting, FERoute } = require("../models/RouteOptimization");

async function optimizeFERoute(feId, currentLocation = null) {
	try {
		// 1. Get FE route info
		const feRoute = await FERoute.findOne({ feId }).lean();
		if (!feRoute) throw new Error("FE route not found");

		// Use current location if provided, else fallback to baseLocation
		const originCoords =
			currentLocation?.coordinates?.length === 2
				? `${currentLocation.coordinates[1]},${currentLocation.coordinates[0]}`
				: `${feRoute.baseLocation.coordinates[1]},${feRoute.baseLocation.coordinates[0]}`;

		// 2. Define today’s UTC range
		const startOfDay = new Date();
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date();
		endOfDay.setUTCHours(23, 59, 59, 999);
		
		// 2. Get all active client meetings
		const meetings = await ClientMeeting.find({
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
			status: "pending",
			"availability.start": { $gte: startOfDay, $lte: endOfDay },
		})
		.select("location availability priority")
		.lean();

		if (!meetings.length) return;

    // console.log("Meetings found ---> ", meetings); // debug

		// 3. Sort by priority (optional before optimization)
		meetings.sort((a, b) => a.priority - b.priority);

		// 4. Prepare destinations
		const destinations = meetings
			.map((m) => `${m.location.coordinates[1]},${m.location.coordinates[0]}`)
			.join("|");

		// 5. Call Google Directions API
		const apiKey = process.env.GOOGLE_MAPS_API_KEY;
		const response = await axios.get(
			"https://maps.googleapis.com/maps/api/directions/json",
			{
				params: {
					origin: originCoords,
					destination: originCoords, // round trip
					waypoints: `optimize:true|${destinations}`,
					key: apiKey,
				},
			}
		);

		const optimizedOrder = response.data.routes?.[0]?.waypoint_order;
		if (!optimizedOrder) return;

    console.log(`Optimized Order for FE = ${feId} generated ==> ${optimizedOrder}`); // debug

		// 6. Update order field
		for (let i = 0; i < optimizedOrder.length; i++) {
			const meeting = meetings[optimizedOrder[i]];
			await ClientMeeting.findByIdAndUpdate(meeting._id, { order: i + 1 });
		}

		console.log(`Optimized route for FE: ${feId}`);
	} catch (err) {
		console.error("Route optimization failed:", err.message);
	}
}

module.exports = { optimizeFERoute };
