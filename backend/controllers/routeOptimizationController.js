const { default: mongoose } = require("mongoose");
const { FE, FERoute, Client, ClientMeeting } = require("../models/RouteOptimization");
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
		const feId = req.feId;
		if (!feId) return res.status(400).json({ message: "Missing feId" });
		if (!mongoose.isValidObjectId(feId))
			return res.status(400).json({ message: "Invalid FE ID" });

		const { startDate, endDate } = req.query;
		const today = new Date();
		const startOfDay = startDate
			? new Date(startDate)
			: new Date(
					Date.UTC(
						today.getUTCFullYear(),
						today.getUTCMonth(),
						today.getUTCDate()
					)
			  );
		const endOfDay = endDate
			? new Date(endDate)
			: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

		const tasks = await ClientMeeting.find({
			assignedFE: feId,
			"availability.start": { $lte: endOfDay },
			"availability.end": { $gte: startOfDay },
			isCompleted: false,
			onHold: false,
		})
			.populate("clientId", "name address contactNumber")
			.populate("assignedFE", "name contactNumber employeeId")
			.select(
				"_id clientId visitingAddress availability priority isCompleted onHold order status createdAt actualVisitStart actualVisitEnd purposeOfVisit location"
			)
			.sort({ order: 1, priority: -1 });

		if (!tasks.length)
			return res.status(404).json({ message: "No tasks found for this FE" });

		const formatted = tasks.map((t) => ({
			taskId: t._id,
			clientId: t.clientId?._id,
			clientName: t.clientId?.name,
			clientContact: t.clientId?.contactNumber,
			visitingAddress: t.visitingAddress,
			availability: t.availability,
			priority: t.priority,
			isCompleted: t.isCompleted,
			onHold: t.onHold,
			order: t.order,
			status: t.status,
			actualVisitStart: t.actualVisitStart,
			actualVisitEnd: t.actualVisitEnd,
			feId: t.assignedFE?._id,
			feName: t.assignedFE?.name,
			purposeOfVisit: t.purposeOfVisit,
			locationString: t.location.urlString,
		}));
		console.log("Tasks details:--> ", formatted); // debug
		res.json(formatted);
	} catch (err) {
		console.error("getTasks error:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};
	
// Mark the isCompleted flag as true and move to next client in the list
const markCompleted = async (req, res) => {
	try {
		const feId = req.feId;
		const { clientId, visitId, remarksByFE, markCommentLocation } = req.body;

		// 1. Verify ClientMeeting exists and is assigned to this FE
		const visit = await ClientMeeting.findOne({
			_id: visitId,
			clientId,
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
		});

		if (!visit)
			return res
				.status(403)
				.json({ error: "Visit not assigned to this FE or already completed" });

		// 2. Mark as completed
		visit.isCompleted = true;
		visit.status = "completed";
		visit.priority = 0;
		if (!visit.actualVisitStart) visit.actualVisitStart = new Date();
		visit.actualVisitEnd = new Date();

		// 3. Add FE comment if provided
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

		await visit.save();

		// 4. Determine next client for FE
		const nextMeeting = await ClientMeeting.findOne({
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
		})
			.sort({ order: 1, priority: -1 })
			.select("clientId");

		const updatePayload = {
			currentClient: nextMeeting ? nextMeeting.clientId : null,
		};

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
			nextClient: nextMeeting ? nextMeeting.clientId : null,
		});
	} catch (err) {
		console.error("Error marking client visit complete:", err);
		res.status(500).json({
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

		// 1. Fetch the specific ClientMeeting
		let visit;
		if (visitId) {
			visit = await ClientMeeting.findOne({ _id: visitId, clientId });
			if (!visit) return res.status(404).json({ error: "Visit not found" });
		} else {
			// fallback: latest pending visit assigned to this FE
			visit = await ClientMeeting.findOne({
				clientId,
				assignedFE: feId,
				isCompleted: false,
			}).sort({ "availability.start": 1 });
			if (!visit)
				return res
					.status(404)
					.json({ error: "No pending visit found for this FE" });
		}

		// 2. Get FE name (denormalization)
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

		// 4. Push comment to ClientMeeting and mark on hold
		visit.feComments.push(newComment);
		visit.onHold = true;
		visit.status = "cancelled";

		await visit.save();

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

		const meetings = await ClientMeeting.find({
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
			"availability.start": { $lte: endOfDay },
			"availability.end": { $gte: startOfDay },
		})
			.populate("clientId", "name address contactNumber")
			.select("clientId location visitingAddress priority order")
			.sort({ order: 1 });

		const data = meetings.map((m) => ({
			clientId: m.clientId?._id,
			clientName: m.clientId?.name,
			coordinates: m.location?.coordinates || [],
			visitingAddress: m.visitingAddress,
			order: m.order,
			priority: m.priority,
		}));

		return res.json({
			message: "Coordinates fetched successfully",
			data,
		});
	} catch (err) {
		return res.status(500).json({
			error: "Failed to fetch the coordinates",
			details: err.message,
		});
	}
};

/*---------------------- WEB APIs ----------------------------*/

// Fetch all the assigned Clients of FE
const getCombinedList = async (req, res) => {
	try {
		const { feId, employeeId, feName, clientName, startDate, endDate, status } =
			req.query;

		// 1. Helper Functions to parse UTC dates
		const parseStartDate = (dateStr) => {
			const d = new Date(dateStr);
			return new Date(
				Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
			);
		};
		const parseEndDate = (dateStr) => {
			const d = new Date(dateStr);
			return new Date(
				Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
			);
		};

		// 2. Determine Date Range
		let startFilter = null,
			endFilter = null;
		const today = new Date();

		if (startDate && endDate) {
			startFilter = parseStartDate(startDate);
			endFilter = parseEndDate(endDate);
		} else if (startDate) {
			startFilter = parseStartDate(startDate);
			endFilter = new Date(
				Date.UTC(
					today.getUTCFullYear(),
					today.getUTCMonth(),
					today.getUTCDate(),
					23,
					59,
					59,
					999
				)
			);
		} else if (endDate) {
			endFilter = parseEndDate(endDate);
			const tenDaysBefore = new Date(endFilter);
			tenDaysBefore.setUTCDate(tenDaysBefore.getUTCDate() - 10);
			startFilter = tenDaysBefore;
		} else {
			// default last 3 days
			endFilter = new Date(
				Date.UTC(
					today.getUTCFullYear(),
					today.getUTCMonth(),
					today.getUTCDate(),
					23,
					59,
					59,
					999
				)
			);
			startFilter = new Date(endFilter);
			startFilter.setUTCDate(startFilter.getUTCDate() - 2);
			startFilter.setUTCHours(0, 0, 0, 0);
		}

		// 3. Build FE query
		const feQuery = {};
		if (feId) feQuery._id = feId;
		if (employeeId) feQuery.employeeId = employeeId;
		if (feName) feQuery.name = { $regex: feName, $options: "i" };

		const fes = await FE.find(feQuery).lean();

		// 4. Fetch FERoute and Filter Booked Slots
		const results = await Promise.all(
			fes.map(async (fe) => {
				const feRoute = await FERoute.findOne({ feId: fe._id })
					.populate({
						path: "bookedSlots.client",
						select: "name address contactNumber",
					})
					.populate({
						path: "currentClient",
						select: "name address contactNumber",
					})
					.lean();

				if (!feRoute?.bookedSlots?.length) return null;

				const filteredSlots = await Promise.all(
					feRoute.bookedSlots.map(async (slot) => {
						if (!slot.client) return null;
						if (slot.start > slot.end) return null;

						// 4.1 Filter by client name
						if (
							clientName &&
							!slot.client.name.match(new RegExp(clientName, "i"))
						)
							return null;

						// 4.2 Filter by date range if defined
						if (
							startFilter &&
							endFilter &&
							(slot.start > endFilter || slot.end < startFilter)
						)
							return null;

						// 4.3 Attach ClientMeeting details
						const visitQuery = {
							clientId: slot.client._id,
							assignedFE: fe._id,
						};
						if (startFilter && endFilter) {
							visitQuery["availability.start"] = { $lte: endFilter };
							visitQuery["availability.end"] = { $gte: startFilter };
						}
						if (status === "completed") {
							visitQuery.isCompleted = true;
							visitQuery.status = "completed";
						} else if (status === "pending") {
							visitQuery.isCompleted = false;
							visitQuery.status = "pending";
						}

						const visit = await ClientMeeting.findOne(visitQuery).lean();
						slot.visitDetails = visit
							? { ...visit, feComments: visit.feComments || [] }
							: null;

						// 4.4 Exclude slot if status filter applied but no visit
						if (status && !visit) return null;

						return slot;
					})
				);

				feRoute.bookedSlots = filteredSlots.filter(Boolean);

				// 5. Current client visit details
				if (feRoute.currentClient) {
					const visitQuery = {
						clientId: feRoute.currentClient._id,
						assignedFE: fe._id,
					};
					if (startFilter && endFilter) {
						visitQuery["availability.start"] = { $lte: endFilter };
						visitQuery["availability.end"] = { $gte: startFilter };
					}
					if (status === "completed") {
						visitQuery.isCompleted = true;
						visitQuery.status = "completed";
					} else if (status === "pending") {
						visitQuery.isCompleted = false;
						visitQuery.status = "pending";
					}
					const visit = await ClientMeeting.findOne(visitQuery).lean();
					feRoute.currentClient.visitDetails = visit
						? { ...visit, feComments: visit.feComments || [] }
						: null;
				}

				return { ...fe, routeDetails: feRoute || {} };
			})
		);

		// 6. Filter out FEs with no slots after filtering
		const filteredResults = results.filter(
			(r) => r && r.routeDetails?.bookedSlots?.length
		);

		// 7. If no entries found, return message
		if (!filteredResults.length) {
			return res.json({ success: true, message: "No entries found", data: [] });
		}

		// 8. Return results
		res.json({ success: true, data: filteredResults });
	} catch (err) {
		console.error("Error fetching combined list:", err);
		res
			.status(500)
			.json({ success: false, message: "Server error", details: err.message });
	}
};

// Fetch Certain FE's availability details
const fetchFEDetails = async (req, res) => {
	try {
		const feId = req.params.id;
		if (!feId || !mongoose.Types.ObjectId.isValid(feId)) {
			return res.status(400).json({ message: "Invalid FE ID" });
		}

		// Fetch FERoute for this FE
		const feRoute = await FERoute.findOne({ feId: feId })
			.select("feId availability bookedSlots currentClient")
			.lean();

		if (!feRoute) {
			return res.status(404).json({ message: "FE route not found" });
		}

		// Return availability and booked slots
		res.status(200).json({
			message: "FE details fetched successfully",
			availability: feRoute.availability,
			bookedSlots: feRoute.bookedSlots,
			currentClient: feRoute.currentClient || null,
		});
	} catch (err) {
		console.error("Error fetching FE details:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Fetch ACTIVE Field Executive's list
const fetchFEList = async (_req, res) => {
	try {
		const fes = await FE.find({ status: "active" }).select(
			"_id name employeeId contactNumber"
		);
		res.json(fes);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};

// Fetch Client's List
const fetchClientList = async (_req, res) => {
	try {
		const clients = await Client.find()
			.select("_id name address contactNumber")
			.lean();

		const clientList = clients.map((c) => ({
			clientId: c._id,
			name: c.name,
			address: c.address,
			contactNumber: c.contactNumber,
		}));

		res
			.status(200)
			.json({ message: "Clients fetched successfully", clientList });
	} catch (err) {
		console.error("Error fetching clients:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Fetch unassigned clients for today
const fetchUnassignedClientsToday = async (_req, res) => {
	try {
		const today = new Date();
		const startOfDay = new Date(
			Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
		);
		const endOfDay = new Date(
			Date.UTC(
				today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59)
		);

		// Fetch ClientMeeting entries for today that are unassigned
		const unassignedMeetings = await ClientMeeting.find({
			isCompleted: false,
			onHold: false,
			assignedFE: { $in: [null, undefined] },
			"availability.start": { $lte: endOfDay },
			"availability.end": { $gte: startOfDay },
			status: "pending",
		})
			.populate("clientId", "name address contactNumber")
			.select("_id clientId priority visitingAddress availability purposeOfVisit");

		res.status(200).json({
			message: "Unassigned clients for today fetched successfully",
			unassignedMeetings,
		});
	} catch (err) {
		console.error("Error fetching unassigned clients today:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Unassigned Clients All-Time
const fetchUnassignedClientsAllTime = async (_req, res) => {
	try {
		const unassignedMeetings = await ClientMeeting.find({
			isCompleted: false,
			onHold: false,
			assignedFE: { $exists: false },
			status: "pending",
		})
			.populate("clientId", "name address contactNumber")
			.select(
				"_id clientId priority visitingAddress availability purposeOfVisit"
			);

		res.status(200).json({
			message: "Unassigned clients for all time fetched successfully",
			unassignedMeetings,
		});
	} catch (err) {
		console.error("Error fetching all-time unassigned clients:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Fetch onHold clients (clients that weren't catered by any FE due to one or multiple constraints)
// const fetchOnHoldClients = async (req, res) => {
// 	try {
// 		// Fetch ClientMeeting entries currently on hold
// 		const onHoldMeetings = await ClientMeeting.find({ onHold: true })
// 			.populate("clientId", "name address contactNumber")
// 			.select("_id clientId priority visitingAddress availability assignedFE");

// 		res.json(onHoldMeetings);
// 	} catch (err) {
// 		console.error("Error fetching on-hold client meetings:", err);
// 		res.status(500).json({ message: "Server error", details: err.message });
// 	}
// };

const fetchOnHoldClients = async (req, res) => {
	try {
		const { scope } = req.query;
		let filter = { onHold: true, status: "cancelled" };

		if (scope === "today") {
			const startOfDayUTC = new Date(
				Date.UTC(
					new Date().getUTCFullYear(),
					new Date().getUTCMonth(),
					new Date().getUTCDate()
				)
			);
			const endOfDayUTC = new Date(
				Date.UTC(
					new Date().getUTCFullYear(),
					new Date().getUTCMonth(),
					new Date().getUTCDate(),
					23,
					59,
					59,
					999
				)
			);
			filter["availability.start"] = { $lte: endOfDayUTC };
			filter["availability.end"] = { $gte: startOfDayUTC };
		}

		const onHoldMeetings = await ClientMeeting.find(filter)
			.populate("clientId", "name address contactNumber")
			.select(
				"_id clientId priority visitingAddress availability assignedFE isCompleted onHold purposeOfVisit status"
			);

		res.json(onHoldMeetings);
	} catch (err) {
		console.error("Error fetching on-hold client meetings:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Create New Client
const createClient = async (req, res) => {
	try {
		const {
			name,
			address,
			contactNumber,
			visitingAddress,
			availabilityStart,
			availabilityEnd,
			locationCoordinates,
			purposeOfVisit,
			priority = 0,
		} = req.body;

		// Required for new client
		if (
			!name ||
			!contactNumber ||
			!address ||
			// !visitingAddress ||
			!availabilityStart ||
			!availabilityEnd ||
			!purposeOfVisit
		) {
			return res
				.status(400)
				.json({ message: "Missing required fields for new client" });
		}

		// Check if client already exists
		let client = await Client.findOne({ contactNumber });
		let meetingAddress = visitingAddress ? visitingAddress : address;

		if (client)
			return res
				.status(400)
				.json({ message: "Client with this contactNumber already exists" });

		// Determine coordinates
		let locCoordinates =
			locationCoordinates || (await getLocationCoordinates(meetingAddress));
		if (!locCoordinates)
			return res.status(400).json({ message: "Unable to fetch coordinates" });

		const locationUrlString = `https://www.google.com/maps?q=${locCoordinates[1]},${locCoordinates[0]}`;

		// Create client
		client = new Client({ name, address, contactNumber });
		await client.save();

		// Create first visit
		const visitEntry = new ClientMeeting({
			clientId: client._id,
			address: address,
			visitingAddress: meetingAddress,
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
			status: "pending",
		});
		await visitEntry.save();

		res
			.status(201)
			.json({
				message: "New client created",
				client,
				visitEntry,
			});
	} catch (err) {
		console.error("Error creating client:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Set new meeting for existing clients
const addVisitForExistingClient = async (req, res) => {
	try {
		const {
			clientId,
			visitingAddress,
			availabilityStart,
			availabilityEnd,
			locationCoordinates,  // Longitude, Latitude
			purposeOfVisit,
			priority = 0,
		} = req.body;

		if (
			!clientId ||
			!visitingAddress ||
			!availabilityStart ||
			!availabilityEnd ||
			!purposeOfVisit
		) {
			return res
				.status(400)
				.json({ message: "Missing required fields for new visit" });
		}

		// Verify client exists
		const client = await Client.findById(clientId);
		if (!client) return res.status(404).json({ message: "Client not found" });

		const startDay = new Date(availabilityStart);
		const endDay = new Date(availabilityEnd);

		// Check for overlapping visit in ClientMeeting collection
		const overlappingVisit = await ClientMeeting.findOne({
			clientId,
			$or: [
				{
					"availability.start": { $lt: endDay, $gte: startDay },
				},
				{
					"availability.end": { $lte: endDay, $gt: startDay },
				},
				{
					"availability.start": { $lte: startDay },
					"availability.end": { $gte: endDay },
				},
			],
		});
		if (overlappingVisit) {
			return res.status(400).json({
				message:
					"A visit already exists for this client in the given date/time range",
			});
		}

		// Determine coordinates
		let locCoordinates = locationCoordinates;
		if (!locCoordinates)
			locCoordinates = await getLocationCoordinates(visitingAddress);
		if (!locCoordinates)
			return res
				.status(400)
				.json({ message: "Unable to fetch coordinates for the visit" });

		const locationUrlString = `https://www.google.com/maps?q=${locCoordinates[1]},${locCoordinates[0]}`;

		// Create new ClientMeeting entry
		const newVisit = new ClientMeeting({
			clientId,
			visitingAddress,
			availability: { start: startDay, end: endDay },
			location: {
				type: "Point",
				coordinates: locCoordinates,
				urlString: locationUrlString,
			},
			purposeOfVisit,
			priority,
			isCompleted: false,
			onHold: false,
			status: "pending",
			feComments: [],
		});

		await newVisit.save();

		res
			.status(201)
			.json({ message: "New visit added for existing client", newVisit });
	} catch (err) {
		console.error("Error adding visit for existing client:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Create New Field Executive
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

const assignClientsToFE = async (req, res) => {
	try {
		const { feId, visitId, slotStart, slotEnd } = req.body;

		if (!feId || !visitId || !slotStart || !slotEnd) {
			return res
				.status(400)
				.json({ message: "FE, visitId, and slot are required" });
		}

		const startUTC = new Date(slotStart);
		const endUTC = new Date(slotEnd);

		const fe = await FE.findById(feId);
		if (!fe) return res.status(404).json({ message: "Field Executive not found" });

		let feRoute = await FERoute.findOne({ feId });
		if (!feRoute) {
			feRoute = new FERoute({
				feId,
				baseLocation: { type: "Point", coordinates: [77.1092925, 28.7195327] },
				currentLocation: {
					type: "Point",
					coordinates: [77.1092925, 28.7195327],
				},
				availability: [],
				bookedSlots: [],
			});
		}

		const conflict = feRoute.bookedSlots.some(
			(slot) => startUTC < slot.end && endUTC > slot.start
		);
		if (conflict)
			return res
				.status(400)
				.json({ message: "FE is not available in this slot" });

		const visit = await ClientMeeting.findOne({
			_id: visitId,
			assignedFE: { $exists: false },
			isCompleted: false,
			onHold: false,
			status: "pending",
		});
		if (!visit)
			return res
				.status(400)
				.json({ message: "No unassigned client meeting found" });

		visit.assignedFE = feId;
		visit.availability = { start: startUTC, end: endUTC };
		visit.order = visit.priority;	// Temporary line -> change with actual process function that fetches actual order based on location & availability
		await visit.save();

		feRoute.bookedSlots.push({
			client: visit.clientId,
			visit: visitId,
			start: startUTC,
			end: endUTC,
		});

		const upcomingSlots = feRoute.bookedSlots
			.filter((s) => s.start > new Date())
			.sort((a, b) => a.start - b.start);
		feRoute.currentClient = upcomingSlots[0]?.client || null;	// To-do: Should be based on Order

		await feRoute.save();

		res.status(200).json({ message: "Client assigned to FE successfully" });
	} catch (err) {
		console.error("Error assigning client:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};



module.exports = {
	updateUserLocation,
	getTasks,
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
	// getCompletedTasks
};