// Update Field Executive's current location
const { FE, FERoute, RouteOptimization, Client } = require("../models/RouteOptimization");
const { baseLocation } = require("../utils/constants");

// Update Current Location of Field Executive
const updateUserLocation = async (req, res) => {
	try {
		const { long, lat } = req.body;
		const feId = req.feId;

		// Check for Longitude and Latitude
		if (!lat || !long) {
			return res
				.status(400)
				.json({ error: "Longitude and Latitude are required" });
		}

		// Update currentLocation in FE Route schema
    await FERoute.findOneAndUpdate(
			{ feId }, // filter by FE id
			{
				$set: {
					currentLocation: {
						type: "Point",
						coordinates: [long, lat], // [LONGITUDE, LATITUDE]
					},
				},
				$setOnInsert: {
					baseLocation: {
						type: "Point",
						coordinates: baseLocation,
					},
				},
			},
			{ new: true, upsert: true }
		);

		return res.status(200).json({ message: "Current Location updated successfully" });
	} catch (err) {
		return res
			.status(500)
			.json({ error: "Failed to update location", details: err.message });
	}
};

// GET tasks (pending + optimized order)
const getTasks = async (req, res) => {
	try {
		const feId = req.feId; // from JWT
		const { startDate, endDate } = req.query; // optional filter for range of dates

		const today = new Date();
		const todayUTC = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);

		const startOfDay = startDate ? new Date(startDate) : todayUTC;
		const endOfDay = endDate
			? new Date(endDate)
			: new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000 - 1); // end of today UTC

		console.log("start Day & end Day: ", startOfDay, endOfDay); // debug
		// console.log("Field Exec. Object Id: --> ", feId); // debug

		/** AGGREGATED TEST QUERY
		const testTasks = await RouteOptimization.aggregate([
				{
					$match: {
						feList: { $in: [feId] },
						date: { $gte: startOfDay, $lte: endOfDay },
					}
				},
			{ $unwind: "$routes" }, // optional, if you want routes separate
			{ $match: { "routes.fe": feId } },
			{
				$lookup: {
					from: "clients",
					localField: "routes.client",
					foreignField: "_id",
					as: "clientDetails",
				},
			},
			{ $unwind: "$clientDetails" }, // optional
			{
				$lookup: {
					from: "fes",
					localField: "routes.fe",
					foreignField: "_id",
					as: "feInfo",
				},
			},
			{ $unwind: "$feInfo" }, // optional
			{
				$project: {
					_id: 1,
					date: 1,
					generatedAt: 1,
					feList: 1,
					clients: 1,
					routes: 1,
					clientDetails: 1,
					feInfo: 1,
				},
			},
		]);

		console.log("Test data: ==> ", testTasks);	// debug
		**/

		// /*
		const tasks = await RouteOptimization.aggregate([
			{
				$match: {
					feList: { $in: [feId] },
					date: { $gte: startOfDay, $lte: endOfDay },
				},
			},
			{ $unwind: "$routes" },
			{ $match: { "routes.fe": feId } }, // only routes assigned to this FE
			{
				$lookup: {
					from: "clients",
					localField: "routes.client",
					foreignField: "_id",
					as: "clientDetails",
				},
			},
			{ $unwind: "$clientDetails" },
			{
				$lookup: {
					from: "fes",
					localField: "routes.fe",
					foreignField: "_id",
					as: "feInfo",
				},
			},
			{ $unwind: "$feInfo" },
			{
				$project: {
					// _id: 1,
					taskId: "$routes._id",
					feName: "$feInfo.name",
					feEmpId: "$feInfo.employeeId",
					clientId: "$clientDetails._id",
					clientName: "$clientDetails.name",
					clientAddress: "$clientDetails.address",
					clientContactNumber: "$clientDetails.contactNumber",
					clientAvailability: "$clientDetails.availability",
					isCompleted: "$clientDetails.isCompleted",
					onHold: "$clientDetails.onHold",
					locationUrl: "$clientDetails.location.urlString",
					purposeOfVisit: "$clientDetails.purposeOfVisit",
					priority: "$clientDetails.priority",
					// feComments: "$clientDetails.feComments",	// Not shown in FE's dashboard cards
					actualVisitStart: "$routes.actualVisitStart",
					actualVisitEnd: "$routes.actualVisitEnd",
					order: "$routes.order",
					taskStatus: "$routes.status",
				},
			},
			{ $sort: { order: 1, priority: -1 } }, // sort by route order then client priority
		]);
		// */

		// console.log("Task data: --> ", tasks); // debug
		// if (!testTasks.length) { // debug
		if (!tasks.length) {
			return res
				.status(404)
				.json({ message: "No tasks found for the selected date(s)" });
		}

		return res.json(tasks);
	} catch (err) {
		return res
			.status(500)
			.json({ error: "Failed to fetch tasks", details: err.message });
		}
	};
	
// Mark the isCompleted flag as true and move to next client in the list
const markCompleted = async (req, res) => {
	try {
		const feId = req.feId;
		const { clientId, remarksByFE, markCommentLocation } = req.body;

		// 1. Verify client exists
		const client = await Client.findById(clientId);
		if (!client) {
			return res.status(404).json({ error: "Client not found" });
		}

		// 2. Verify client is assigned to this FE
		const today = new Date();
		const todayUTC = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);

		const routeOpt = await RouteOptimization.findOne({
			date: todayUTC,
			"routes.fe": feId,
			"routes.client": clientId,
		});
		if (!routeOpt) {
			return res
				.status(403)
				.json({ error: "Client not assigned to this field executive" });
		}

		// 3. Already completed?
		if (client.isCompleted) {
			return res.json({ message: "Client already marked as completed" });
		}

		// 4. Update client
		client.isCompleted = true;
		client.priority = 0; // remove priority

		// add FE comment (if provided)
		if (remarksByFE) {
			const fe = await FE.findById(feId).select("name");
			const feName = fe ? fe.name : "Unknown FE";

			const newComment = {
				text: remarksByFE,
				by: feId,
				byName: feName,
				createdAt: new Date(),
			};

			if (markCommentLocation?.coordinates?.length === 2) {
				newComment.location = {
					type: "Point",
					coordinates: markCommentLocation.coordinates,
				};
			}

			client.feComments.push(newComment);
		}

		await client.save();

		// 5. Update route
		const route = routeOpt.routes.find(
			(r) =>
				r.fe.toString() === feId.toString() &&
				r.client.toString() === clientId.toString()
		);
		if (route) {
			route.status = "completed";
			route.actualVisitEnd = new Date();
			if (!route.actualVisitStart) route.actualVisitStart = new Date(); // fallback ; To-Do: how to add actual start visit for each clients?
		}
		await routeOpt.save();

		// 6. Find next pending client for FE
		const feRoutes = routeOpt.routes
			.filter((r) => r.fe.toString() === feId.toString())
			.sort((a, b) => a.order - b.order);

		const currentIndex = feRoutes.findIndex(
			(r) => r.client.toString() === clientId.toString()
		);

		let nextClientId = null;
		if (currentIndex >= 0 && currentIndex < feRoutes.length - 1) {
			const nextRoute = feRoutes
				.slice(currentIndex + 1)
				.find((r) => r.status === "pending");
			if (nextRoute) nextClientId = nextRoute.client;
		}

		// 7. Update FE’s route tracking
		const updatePayload = { currentClient: nextClientId };
		if (markCommentLocation?.coordinates?.length === 2) {
			updatePayload.currentLocation = {
				type: "Point",
				coordinates: markCommentLocation.coordinates,
			};
		}

		await FERoute.findOneAndUpdate({ feId }, updatePayload);

		return res.json({
			message: "Client visit marked as completed",
			completedClient: clientId,
			nextClient: nextClientId,
		});
	} catch (err) {
		return res.status(500).json({
			error: "Failed to mark client as visited",
			details: err.message,
		});
	}
};

// POST the comment by FE to client
const addComments = async (req, res) => {
	try {
		const feId = req.feId;
		const { clientId, remarksByFE, markCommentLocation } = req.body;

		// 1. Verify client exists
		const client = await Client.findById(clientId);
		if (!client) {
			return res.status(404).json({ error: "Client not found" });
		}

		if (!remarksByFE) {
			return res.status(404).json({ error: "No comments/remarks found" });
		}

		// 2. Get FE name (for denormalization)
		const fe = await FE.findById(feId).select("name");
		const feName = fe ? fe.name : "Unknown FE";

		// 3. Build comment object
		const newComment = {
			text: remarksByFE,
			by: feId,
			byName: feName,
			createdAt: new Date(),
		};

		if (markCommentLocation?.coordinates?.length === 2) {
			newComment.location = {
				type: "Point",
				coordinates: markCommentLocation.coordinates,
			};
		}

		// 4. Push new comment and mark client on hold
		client.feComments.push(newComment);
		client.onHold = true;

		await client.save();

		return res.json({
			message: "Comment posted successfully, client put on hold",
			clientId,
			comment: newComment,
		});
	} catch (err) {
		return res.status(500).json({
			error: "Failed to add the comments by FE",
			details: err.message,
		});
	}
};

// Fetch all the client's coordinates based on their sequence of visit
const getAllCoordinates = async (req, res) => {
	try {
		const feId = req.feId;

		const today = new Date();
		const todayUTC = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);
		// Get today's routes for this FE
		const routesToday = await RouteOptimization.aggregate([
			{ $match: { date: todayUTC, feList: { $in: [feId] } } },
			{ $unwind: "$routes" },
			{ $match: { "routes.fe": feId } },
			{
				$lookup: {
					from: "clients",
					localField: "routes.client",
					foreignField: "_id",
					as: "clientDetails",
				},
			},
			{ $unwind: "$clientDetails" },
			{
				$project: {
					_id: 0,
					clientId: "$clientDetails._id",
					order: "$routes.order",
					coordinates: "$clientDetails.location.coordinates",
				},
			},
			{ $sort: { order: 1 } },
		]);

		return res.json({
			message: "Coordinates fetched successfully",
			data: routesToday,
		});
	} catch (err) {
		return res.status(500).json({
			error: "Failed to fetch the coordinates",
			details: err.message,
		});
	}
}


/*----------------------------------------------------------------*/



/*
// GET completed tasks
const getCompletedTasks = async (req, res) => {
	try {
		const feId = req.user.id;

		const optimizations = await RouteOptimization.find({ feList: feId })
			.populate("routes.client")
			.sort({ date: -1 });

		const completedTasks = optimizations.flatMap((o) =>
			o.routes
				.filter((r) => r.status === "completed")
				.map((r, i) => ({
					task_id: i + 1,
					client_name: r.client.name,
					task_status: r.status,
					task_priority: r.client.priority,
					visitStart: r.visitStart,
					visitEnd: r.visitEnd,
					order: r.order,
					date: o.date,
				}))
		);

		return res.json(completedTasks);
	} catch (err) {
		return res
			.status(500)
			.json({ error: "Failed to fetch completed tasks", details: err.message });
	}
};
*/


module.exports = {
	updateUserLocation,
  getTasks,
	markCompleted,
	addComments,
	getAllCoordinates,
  // getCompletedTasks
};