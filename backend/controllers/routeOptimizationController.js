const { FE, FERoute, RouteOptimization, Client } = require("../models/RouteOptimization");
const { baseLocation } = require("../utils/constants");
const { getLocationCoordinates } = require("../utils/getLocationCoordinates");

// Update Current Location of Field Executive
const updateUserLocation = async (req, res) => {
	try {
		const feId = req.feId;
		const { long, lat } = req.body;

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
				$unwind: "$clientDetails.visitDetails", // Unwind visitDetails to get the relevant visit
			},
			{
				$project: {
					taskId: "$routes._id",
					feName: "$feInfo.name",
					feEmpId: "$feInfo.employeeId",
					clientId: "$clientDetails._id",
					clientName: "$clientDetails.name",
					clientContactNumber: "$clientDetails.contactNumber",
					clientVisitId: "$clientDetails.visitDetails._id",
					visitingAddress: "$clientDetails.visitDetails.visitingAddress", // Visiting address & not necessarily base-address
					clientAvailability: "$clientDetails.visitDetails.availability",
					isCompleted: "$clientDetails.visitDetails.isCompleted",
					onHold: "$clientDetails.visitDetails.onHold",
					locationUrl: "$clientDetails.visitDetails.location.urlString",
					purposeOfVisit: "$clientDetails.visitDetails.purposeOfVisit",
					priority: "$clientDetails.visitDetails.priority",
					actualVisitStart: "$routes.actualVisitStart",
					actualVisitEnd: "$routes.actualVisitEnd",
					order: "$routes.order",
					taskStatus: "$routes.status",
				},
			},
			{ $sort: { order: 1, priority: -1 } },
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
		const { clientId, visitId, remarksByFE, markCommentLocation } = req.body;

		// 1. Verify client exists
		const client = await Client.findById(clientId);
		if (!client) return res.status(404).json({ error: "Client not found" });

		// 2. Find the specific visit assigned to this FE
		const today = new Date();
		const startOfDay = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);
		const endOfDay = new Date(
			Date.UTC(
				today.getUTCFullYear(),
				today.getUTCMonth(),
				today.getUTCDate(),
				23,
				59,
				59
			)
		);

		const visit = client.visitDetails.find(
			(v) =>
				v._id.toString() === visitId &&
				v.assignedFE?.toString() === feId.toString() &&
				new Date(v.availability.start) <= endOfDay &&
				new Date(v.availability.end) >= startOfDay
		);

		if (!visit)
			return res
				.status(403)
				.json({ error: "Visit not assigned to this FE for today" });

		// 3. Already completed?
		if (visit.isCompleted)
			return res.json({ message: "Visit already marked as completed" });

		// 4. Mark as completed
		visit.isCompleted = true;
		visit.priority = 0; // reset priority

		// 5. Add FE comment if provided
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

			visit.feComments.push(newComment);
		}

		await client.save();

		// 6. Update RouteOptimization for today
		const routeOpt = await RouteOptimization.findOne({
			date: startOfDay,
			"routes.fe": feId,
			"routes.client": clientId,
		});

		if (routeOpt) {
			const route = routeOpt.routes.find(
				(r) =>
					r.fe.toString() === feId.toString() &&
					r.client.toString() === clientId.toString()
			);

			if (route) {
				route.status = "completed";
				route.actualVisitEnd = new Date();
				if (!route.actualVisitStart) route.actualVisitStart = new Date(); // fallback
				await routeOpt.save();
			}
		}

		// 7. Update FE's current client in FERoute
		const feRoutes = routeOpt?.routes
			.filter((r) => r.fe.toString() === feId.toString())
			.sort((a, b) => a.order - b.order);

		let nextClientId = null;
		if (feRoutes?.length) {
			const currentIndex = feRoutes.findIndex(
				(r) => r.client.toString() === clientId.toString()
			);
			if (currentIndex >= 0 && currentIndex < feRoutes.length - 1) {
				const nextRoute = feRoutes
					.slice(currentIndex + 1)
					.find((r) => r.status === "pending");
				if (nextRoute) nextClientId = nextRoute.client;
			}
		}

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
			completedVisitId: visitId,
			nextClient: nextClientId,
		});
	} catch (err) {
		console.error("Error marking client visit complete:", err);
		res
			.status(500)
			.json({
				error: "Failed to mark client visit as completed",
				details: err.message,
			});
	}
};


// POST the comment by FE to client
const addComments = async (req, res) => {
	try {
		const feId = req.feId;
		const { clientId, visitId, remarksByFE, markCommentLocation } = req.body;

		if (!remarksByFE) {
			return res.status(400).json({ error: "No comments/remarks found" });
		}

		// 1. Verify client exists
		const client = await Client.findById(clientId);
		if (!client) {
			return res.status(404).json({ error: "Client not found" });
		}

		// 2. Determine which visit to add comment to
		let visit;
		if (visitId) {
			visit = client.visitDetails.id(visitId);
			if (!visit) {
				return res.status(404).json({ error: "Visit not found" });
			}
		} else {
			// fallback: latest pending visit assigned to this FE
			visit = client.visitDetails
				.filter(
					(v) => v.assignedFE?.toString() === feId.toString() && !v.isCompleted
				)
				.sort((a, b) => a.availability.start - b.availability.start)[0];
			if (!visit) {
				return res
					.status(404)
					.json({ error: "No pending visit found for this FE" });
			}
		}

		// 3. Get FE name (for denormalization)
		const fe = await FE.findById(feId).select("name");
		const feName = fe ? fe.name : "Unknown FE";

		// 4. Build comment object
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

		// 5. Push comment to the correct visit and mark on hold
		visit.feComments.push(newComment);
		visit.onHold = true;

		await client.save();

		return res.json({
			message: "Comment posted successfully, visit put on hold",
			clientId,
			visitId: visit._id,
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
		const startOfDay = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);
		const endOfDay = new Date(
			Date.UTC(
				today.getUTCFullYear(),
				today.getUTCMonth(),
				today.getUTCDate(),
				23,
				59,
				59
			)
		);

		// Get today's routes for this FE
		const routesToday = await RouteOptimization.aggregate([
			{
				$match: {
					date: { $gte: startOfDay, $lte: endOfDay },
					feList: { $in: [feId] },
				},
			},
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
					clientName: "$clientDetails.name",
					order: "$routes.order",
					// Fetch coordinates of today's visit assigned to this FE
					coordinates: {
						$map: {
							input: {
								$filter: {
									input: "$clientDetails.visitDetails",
									as: "visit",
									cond: {
										$and: [
											{ $eq: ["$$visit.assignedFE", feId] },
											{ $lte: ["$$visit.availability.start", endOfDay] },
											{ $gte: ["$$visit.availability.end", startOfDay] },
										],
									},
								},
							},
							as: "v",
							in: "$$v.location.coordinates",
						},
					},
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
};


/*----------------------------------------------------------------*/

const getAllFields = async (_req, res) => {
	try {
		const today = new Date();
		const startOfDay = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);
		const endOfDay = new Date(
			Date.UTC(
				today.getUTCFullYear(),
				today.getUTCMonth(),
				today.getUTCDate(),
				23,
				59,
				59
			)
		);

		const fes = await FE.find().lean();

		const results = await Promise.all(
			fes.map(async (fe) => {
				const feRoute = await FERoute.findOne({ feId: fe._id })
					.populate({
						path: "bookedSlots.client",
						select: "name address contactNumber priority visitDetails",
					})
					.populate({
						path: "currentClient",
						select: "name address contactNumber priority visitDetails",
					})
					.lean();

				// For each booked slot, pick the relevant visit assigned to this FE for today
				if (feRoute?.bookedSlots?.length) {
					feRoute.bookedSlots = feRoute.bookedSlots.map((slot) => {
						if (!slot.client) return slot;

						const todayVisit = slot.client.visitDetails.find(
							(v) =>
								v.assignedFE?.toString() === fe._id.toString() &&
								v.availability.start <= endOfDay &&
								v.availability.end >= startOfDay
						);

						return {
							...slot,
							visitDetails: todayVisit || null,
						};
					});
				}

				// Similarly for currentClient
				if (feRoute?.currentClient) {
					const todayVisit = feRoute.currentClient.visitDetails.find(
						(v) =>
							v.assignedFE?.toString() === fe._id.toString() &&
							v.availability.start <= endOfDay &&
							v.availability.end >= startOfDay
					);
					feRoute.currentClient = {
						...feRoute.currentClient,
						visitDetails: todayVisit || null,
					};
				}

				return {
					...fe,
					routeDetails: feRoute || {},
				};
			})
		);

		res.status(200).json({ fieldExecutives: results });
	} catch (err) {
		return res.status(500).json({
			error: "Failed to fetch the details",
			details: err.message,
		});
	}
};

// Fetch ACTIVE Field Executive's list
const fetchFEList = async (_req, res) => {
	try {
		const fes = await FE.find({ status: "ACTIVE" }).select(
			"_id name employeeId contactNumber"
		);
		res.json(fes);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Fetch unassigned clients
const fetchUnassignedClients = async (_req, res) => {
	try {
		const today = new Date();
		const startOfDay = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);
		const endOfDay = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59)
		);

		// Get already assigned client visits for today
		const assignedClients = await RouteOptimization.aggregate([
			{ $match: { date: { $gte: startOfDay, $lte: endOfDay } } },
			{ $unwind: "$routes" },
			{ $group: { _id: null, clientIds: { $addToSet: "$routes.client" } } },
		]);

		const assignedIds = assignedClients[0]?.clientIds || [];

		// Fetch clients with at least one unassigned + active visit
		const clients = await Client.find({
			_id: { $nin: assignedIds },
			"visitDetails.isCompleted": false,
			"visitDetails.onHold": false,
		}).select(
			"_id name address contactNumber visitDetails.priority visitDetails.visitingAddress"
		);

		res.json(clients);
	} catch (err) {
		console.error("Error fetching unassigned clients:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// Fetch onHold clients (clients that weren't catered by any FE due to one or multiple constraints)
const fetchOnHoldClients = async (req, res) => {
	try {
		// To-do: can add limit to fetch last 7 days entries only
		const clients = await Client.find({
			"visitDetails.onHold": true,
		}).select("_id name address contactNumber visitDetails");

		res.json(clients);
	} catch (err) {
		console.error("Error fetching on-hold clients:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// Create New Client
const createClient = async (req, res) => {
	try {
		const {
			name,
			address,
			visitingAddress,
			contactNumber,
			availabilityStart,
			availabilityEnd,
			locationCoordinates, // If provided from frontend map selection [longitude, latitude]
			purposeOfVisit,
			priority = 0,
		} = req.body;

		if (
			!name ||
			// !address ||
			!contactNumber ||
			!availabilityStart ||
			!availabilityEnd ||
			!purposeOfVisit
		) {
			return res.status(400).json({ message: "Missing required fields" });
		}
		
		// Check if client exists
		let client = await Client.findOne({ contactNumber });

		// Only new clients require their base-address and/or visitingAddress
		if (!client && !address) {
			return res.status(400).json({ message: "Missing base address field" });
		}

		// client exist but neither visitingAddress nor address is present
		if (client && !address && !visitingAddress) {
			return res.status(400).json({ message: "Missing address field" });
		}

		// Fetch coordinates if not provided
		let locCoordinates = locationCoordinates;

		if (!locCoordinates) {
			if (visitingAddress) {
				// Always try the new visiting address first
				locCoordinates = await getLocationCoordinates(visitingAddress);
			}

			// Fallback to first visit coordinates if client exists
			if (!locCoordinates && client?.visitDetails?.length) {
				locCoordinates = client.visitDetails[0].location.coordinates;
			}

			// Fallback to main client address
			if (!locCoordinates) {
				locCoordinates = await getLocationCoordinates(address);
			}

			if (!locCoordinates) {
				return res
					.status(400)
					.json({ error: "Invalid address or unable to fetch coordinates" });
			}
		}

		const locationUrlString = `https://www.google.com/maps?q=${locCoordinates[1]},${locCoordinates[0]}`;

		const visitEntry = {
			visitingAddress: visitingAddress ? visitingAddress : address,
			availability: {
				start: new Date(availabilityStart),
				end: new Date(availabilityEnd),
			},
			location: {
				type: "Point",
				coordinates: locCoordinates,
				urlString: locationUrlString,
			},
			purposeOfVisit,
			priority,
			isCompleted: false,
			onHold: false,
			feComments: [],
		};

		if (client) {
			// Client exists → add new visit
			client.visitDetails.push(visitEntry);
			await client.save();
			return res
				.status(200)
				.json({ message: "Added new visit to existing client", client });
		} else {
			// New client
			client = new Client({
				name,
				address,
				contactNumber,
				visitDetails: [visitEntry],
			});
			await client.save();
			return res.status(201).json({ message: "New client created", client });
		}
	} catch (err) {
		console.error("Error creating client:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// Create Field Executive's Entry
const createFE = async (req, res) => {
	try {
		const { name, contactNumber, status } = req.body;

		if (!name || !contactNumber) {
			return res
				.status(400)
				.json({ message: "Name and contactNumber are required" });
		}
		
		// Check if contact number already exists
		const existingFE = await FE.findOne({ contactNumber });
		if (existingFE) {
			return res
				.status(400)
				.json({
					message: "Field Executive with this contactNumber already exists",
				});
			}
	
		if (status.toLowerCase() !== 'active') {
			console.log(`Employee ${name} status is not Active. Status is ${status}`);
		}

		let employeeId;
		do {
			employeeId = Math.floor(10000 + Math.random() * 90000); // 10000–99999
		} while (await FE.findOne({ employeeId }));

		const newFE = new FE({
			name,
			contactNumber,
			employeeId,
			status,
		});

		await newFE.save();

		res.status(201).json({ message: "Field Executive created", fe: newFE });
	} catch (err) {
		console.error("Error creating FE:", err);
		res.status(500).json({ message: "Server error" });
	}
};

// Assign Clients to Field Executive
const assignClientToFE = async (req, res) => {
	/** To-do: use "computeOptimizedOrder" function defined in 'utils' **/
	try {
		const { feId, clientId, slotStart, slotEnd } = req.body;

		if (!feId || !clientId || !slotStart || !slotEnd) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		const feObjectId = new mongoose.Types.ObjectId(feId);
		const clientObjectId = new mongoose.Types.ObjectId(clientId);

		// 1. Update FERoute
		let feRoute = await FERoute.findOne({ feId: feObjectId });
		if (!feRoute) {
			// Create if not exists
			feRoute = new FERoute({
				feId: feObjectId,
				baseLocation: { type: "Point", coordinates: [77.1092925, 28.7195327] },
				currentLocation: {
					type: "Point",
					coordinates: [77.1092925, 28.7195327],
				},
				availability: [
					{ start: new Date(slotStart), end: new Date(slotEnd) }, // can add default 9-7 slots if needed
				],
				bookedSlots: [],
			});
		}

		// Add booked slot
		feRoute.bookedSlots.push({
			client: clientObjectId,
			start: new Date(slotStart),
			end: new Date(slotEnd),
		});

		// Update currentClient based on earliest upcoming slot
		const pendingSlots = feRoute.bookedSlots.filter(
			(s) => s.start > new Date()
		);
		pendingSlots.sort((a, b) => a.start - b.start);
		feRoute.currentClient = pendingSlots[0]?.client || null;

		await feRoute.save();

		// 2. Update RouteOptimization
		const todayUTC = new Date(
			Date.UTC(
				new Date().getUTCFullYear(),
				new Date().getUTCMonth(),
				new Date().getUTCDate()
			)
		);

		let routeOpt = await RouteOptimization.findOne({
			date: todayUTC,
			feList: feObjectId,
		});

		if (!routeOpt) {
			routeOpt = new RouteOptimization({
				date: todayUTC,
				feList: [feObjectId],
				clients: [clientObjectId],
				routes: [],
			});
		} else {
			// add client if not exists
			if (!routeOpt.clients.includes(clientObjectId))
				routeOpt.clients.push(clientObjectId);
		}

		// Determine order
		const existingOrders = routeOpt.routes
			.filter((r) => r.fe.equals(feObjectId))
			.map((r) => r.order);
		const nextOrder = existingOrders.length
			? Math.max(...existingOrders) + 1
			: 1;

		routeOpt.routes.push({
			fe: feObjectId,
			client: clientObjectId,
			actualVisitStart: null, // FE will fill later
			actualVisitEnd: null,
			order: nextOrder,
			status: "pending",
		});

		await routeOpt.save();

		res.status(200).json({ message: "Client assigned to FE successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
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
	getAllFields,
	fetchFEList,
	fetchUnassignedClients,
	fetchOnHoldClients,
	createClient,
	createFE,
	assignClientToFE,
	// getCompletedTasks
};