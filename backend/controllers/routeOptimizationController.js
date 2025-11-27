const mongoose = require("mongoose");
const axios = require("axios");
const { FE, FERoute, Client, ClientMeeting, TempClient } = require("../models/RouteOptimization");
const { baseLocation } = require("../utils/constants");
const { getLocationCoordinates } = require("../utils/getLocationCoordinates");
const { optimizeFERoute } = require("../utils/routeOptimizer");
const { FETCH_CLIENT_LIST_LIMIT } = require("../utils/stringConstants");
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Update Current Location of Field Executive
const updateUserLocation = async (req, res) => {
	try {
		const feId = req.feId;
		const { long, lat, batteryPercentage  } = req.body;

		// Check for Longitude and Latitude
		if (!lat || !long) {
			return res
				.status(400)
				.json({ error: "Longitude and Latitude are required" });
		}
		if (batteryPercentage === undefined || batteryPercentage === null) {
			return res.status(400).json({ error: "Battery percentage is required" });
		}

		const batteryLog = { timestamps: new Date(), batteryPercentage, };

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
				$push: {
					battery: batteryLog,
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
			.populate({
				path: "clientId",
				model: Client,
				select: "NAME MOBILE ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN",
			})
			.populate("assignedFE", "name contactNumber employeeId")
			.select(
				"_id clientId visitingAddress availability priority isCompleted onHold order status createdAt actualVisitStart actualVisitEnd purposeOfVisit location"
			)
			.sort({ order: 1, priority: -1 });

		if (!tasks.length)
			return res.status(404).json({ message: "No tasks found for this FE" });

		const formatted = tasks.map((t) => {
			const c = t.clientId;

			const clientAddress = c
				? [c.ADDRESS1, c.ADDRESS2, c.ADDRESS3, c.CITY, c.PIN,
				].filter(Boolean).join(", ")
				: "";
				
				return {
					visitId: t._id,
					clientId: c?._id,
					clientName: c?.NAME || "",
				clientContact: c?.MOBILE || "",
				clientAddress: clientAddress || "",
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
			};
		});
		// console.log("Tasks details:--> ", formatted); // debug
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

		if (!visitId) {
			return res.status(403).json({ error: "visitId not found" });
		}

		// 1. Verify ClientMeeting exists and is assigned to this FE
		const visit = await ClientMeeting.findOne({
			_id: visitId,
			clientId,
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
			status: "pending",
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

		// 4. Optimize FE route after completion
		const currentLocation = markCommentLocation?.coordinates || null;
		await optimizeFERoute(feId, currentLocation);

		// 5. Determine next client for today only
		const startOfDay = new Date();
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date();
		endOfDay.setUTCHours(23, 59, 59, 999);

		const nextMeeting = await ClientMeeting.findOne({
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
			status: "pending",
			"availability.start": { $lte: endOfDay },
			"availability.end": { $gte: startOfDay },
		})
			.sort({ order: 1, priority: -1 })
			.select("clientId");

		const updatePayload = {
			currentClient: nextMeeting ? nextMeeting.clientId : null,
		};

		if (currentLocation) {
			updatePayload.currentLocation = {
				type: "Point",
				coordinates: currentLocation,
			};
		}

		await FERoute.findOneAndUpdate({ feId }, updatePayload);

		return res.json({
			message: "Client visit marked as completed",
			completedVisitId: visitId,
			nextClient: nextMeeting ? nextMeeting.clientId : null,
			nextClientVisit: nextMeeting ? nextMeeting._id : null,
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
		if (!visitId) {
			return res.status(400).json({ error: "No visitId found" });
		}

		// 1. Fetch the specific ClientMeeting
		const visit = await ClientMeeting.findOne({
			_id: visitId,
			clientId,
			assignedFE: feId,
			isCompleted: false,
			onHold: false,
			status: "pending"
		});
		if (!visit) return res.status(404).json({ error: "Visit not found" });
		
		// console.log("Visit details ==> ", visit) // debug
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
		visit.priority = 0;
		visit.status = "cancelled";
		// console.log("New Visit Details before saving :--> ", visit); // debug
		await visit.save();

		// 5. Recalculate route for remaining assigned clients
		const currentLocation = markCommentLocation?.coordinates || null;
		await optimizeFERoute(feId, currentLocation);
		// console.log("Current Location Updated: ", currentLocation); // debug
		return res.json({
			message: "Comment posted successfully, visit put on hold",
			clientId,
			visitId: visit._id,
			comment: newComment?.text,
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
			.populate({
				path: "clientId",
				model: Client,
				select: "NAME MOBILE ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN"
			})
			.select("clientId location visitingAddress priority order")
			.sort({ order: 1 });

		const data = meetings.map((m) => {
			const c = m.clientId;

			const clientAddress = c
				? [c.ADDRESS1, c.ADDRESS2, c.ADDRESS3, c.CITY, c.PIN,
				].filter(Boolean).join(", ")
				: "";

			return {
				clientId: c?._id,
				clientName: c?.NAME || "",
				clientContact: c?.MOBILE || "",
				clientAddress: clientAddress || "",
				coordinates: m.location?.coordinates || [],
				visitingAddress: m.visitingAddress,
				order: m.order,
				priority: m.priority,
			};
		});
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
		const { startDate, endDate, feName, employeeId, clientName, status } =
			req.query;

		// Helper functions to parse start/end dates in UTC
		const parseStart = (d) =>
			new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
		const parseEnd = (d) =>
			new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999));

		const today = new Date();
		let startFilter, endFilter;

		if (startDate && endDate) {
			startFilter = parseStart(new Date(startDate));
			endFilter = parseEnd(new Date(endDate));
		} else if (startDate) {
			startFilter = parseStart(new Date(startDate));
			endFilter = parseEnd(today);
		} else if (endDate) {
			endFilter = parseEnd(new Date(endDate));
			startFilter = new Date(endFilter);
			startFilter.setUTCDate(startFilter.getUTCDate() - 10);
		} else {
			startFilter = parseStart(today);
			endFilter = parseEnd(today);
		}
		// console.log("Start and End date in UTC ==> ", startFilter, endFilter); // debug

		// /*
		// Fetch FERoute documents with day-range filtering
		const combinedRes = await FERoute.find({
			bookedSlots: {
				$elemMatch: { start: { $gte: startFilter }, end: { $lte: endFilter } },
			},
		})
			.select("feId bookedSlots")
			.populate([
				{ path: "feId", select: "name employeeId contactNumber" },
				// { path: "bookedSlots.client", select: "_id name contactNumber" },
				{
					path: "bookedSlots.client",
					model: Client,
					select: "NAME MOBILE ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN",
				},
				{
					path: "bookedSlots.visit",
					select:
						"_id visitingAddress assignedFE purposeOfVisit priority isCompleted onHold status feComments clientType clientId",
				}
			])
			.lean();

		// console.log("Combined Data :--> ", combinedRes); // debug

		// Group by FE
		const groupByFE = Object.values(
			combinedRes.reduce((acc, route) => {
				const feId = route.feId._id.toString();
				if (!acc[feId]) acc[feId] = { feId: route.feId, bookedSlots: [] };
				acc[feId].bookedSlots.push(...route.bookedSlots);
				return acc;
			}, {})
		);

		// Apply optional filters // Transform each FE
		const filteredList = await Promise.all(
			groupByFE
				.filter((fe) => {
					if (feName && !new RegExp(feName, "i").test(fe.feId.name)) return false;
					if (employeeId && fe.feId.employeeId !== employeeId) return false;
					return true;
				})
				.map(async (fe) => {
					const slots = await Promise.all(
						fe.bookedSlots
							.filter((slot) => {
								if (clientName && slot.client && !new RegExp(clientName, "i").test(slot.client.NAME))
									return false;
								if (status && slot.visit.status !== status) return false;
								if (startFilter && slot.start < startFilter) return false;
								if (endFilter && slot.end > endFilter) return false;
								return true;
							})
							.map(async (slot) => {
								let client = null;
								let clientType = slot.visit.clientType || "mint"; // default permanent

								if (clientType === "mint") {
									const c = slot.client;
									if (c) {
										client = {
											_id: c._id,
											name: c.NAME || "",
											contactNumber: c.MOBILE || "",
											address: [
												c.ADDRESS1,
												c.ADDRESS2,
												c.ADDRESS3,
												c.CITY,
												c.PIN,
											]
												.filter(Boolean)
												.join(", "),
										};
									}
								}

								// TEMPORARY CLIENT
								if (clientType === "temporary") {
									const temp = await TempClient.findById(slot.visit.clientId)
										.select("name mobile address1 address2 address3 city pin")
										.lean();

									if (temp) {
										client = {
											_id: temp._id,
											name: temp.name,
											contactNumber: temp.mobile || "-",
											address: [
												temp.address1,
												temp.address2,
												temp.address3,
												temp.city,
												temp.pin,
											]
												.filter(Boolean)
												.join(", "),
										};
									}
								}

								// FALLBACK → If no client found
								if (!client) {
									client = {
										_id: null,
										name: "Unknown Client",
										contactNumber: "-",
										address: slot.visit.visitingAddress || "-",
									};
								}

								return {
									...slot,
									client,
								};
							}));
					return { feId: fe.feId, bookedSlots: slots };
				})
		);
		// Filter out FE with zero slots
		const finalOutput = filteredList.filter((fe) => fe.bookedSlots.length > 0);
		return res.json({ success: true, data: finalOutput });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ success: false, error: "Server Error" });
	}
};

// Fetch individual FE's availability details
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

// Fetch active Field Executive's list
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

// Track FE's current location and current client
const trackFEAndClient = async (req, res) => {
	try {
		const feId = req.params.id;
		if (!feId || !mongoose.Types.ObjectId.isValid(feId)) {
			return res.status(400).json({ message: "Invalid FE ID" });
		}

		// Fetch FE route info
		const feRoute = await FERoute.findOne({ feId })
			.select("currentLocation currentClient battery")
			.lean();

		if (!feRoute)
			return res
				.status(404)
				.json({ message: `FE route not found or No Clients assigned to FE: ${feId}` });

		let clientLocation = null;

		// Fetch today's client meeting location if currentClient exists
		if (feRoute.currentClient) {
			const startOfDay = new Date();
			startOfDay.setHours(0, 0, 0, 0);
			const endOfDay = new Date();
			endOfDay.setHours(23, 59, 59, 999);

			const meeting = await ClientMeeting.findOne({
				clientId: feRoute.currentClient,
				assignedFE: feId,
				isCompleted: false,
				onHold: false,
				"availability.start": { $gte: startOfDay, $lte: endOfDay },
			})
				.select("location")
				.lean();

			if (meeting?.location?.coordinates?.length === 2)
				clientLocation = meeting.location;
		}

		let latestBattery = null;

		if (feRoute.battery && feRoute.battery.length > 0) {
			const lastEntry = feRoute.battery[feRoute.battery.length - 1];

			latestBattery = {
				batteryPercentage: lastEntry.batteryPercentage,
				timestamps: lastEntry.timestamps,
			};
		}

		res.status(200).json({
			message: "FE and client tracking info fetched successfully",
			feLocation: feRoute.currentLocation || null,
			clientLocation,
			latestBattery,
		});
	} catch (err) {
		console.error("Error tracking FE route:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

// Fetch Client's List
// controller/routePlanController.js
const fetchClientList = async (req, res) => {
	try {
		const search = req.query.search?.trim() || "";
		const isTemporary = req.query.temporary === "true";
		let clients = [];
		// FETCH TEMPORARY CLIENTS -------------------------------
		if (isTemporary) {
			const query = {};

			if (search) {
				// Search by name or mobile/contact number (partial match)
				query.$or = [
					{ name: { $regex: search, $options: "i" } },
					{ mobile: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
				];
			}

			const tempClients = await TempClient.find(query)
				.select("name email mobile address1 address2 city pin")
				.lean();

			clients = tempClients.map((c) => ({
				clientId: c._id,
				name: c.name || "",
				email: c.email || "",
				mobile: c.mobile || "",
				address: [
					c.address1,
					c.address2,
					c.city,
					c.pin
				].filter(Boolean).join(", "),
				isTemporary: true,
			}));
		}
		// FETCH PERMANENT CLIENTS
		else {
			const query = {};
			if (search) {
				query.$or = [
					{ NAME: { $regex: search, $options: "i" } },
					{ MOBILE: { $regex: search, $options: "i" } },
					{ CONTACTNUMBER: { $regex: search, $options: "i" } },
				];
			}

			const mintClients = await Client.find(query)
				.select("NAME EMAIL MOBILE CONTACTNUMBER ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN")
				.limit(FETCH_CLIENT_LIST_LIMIT)
				.lean();

			clients = mintClients.map((c) => ({
				clientId: c._id,
				name: c.NAME || "",
				email: c.EMAIL || "",
				mobile: c.MOBILE || c.CONTACTNUMBER || "",
				address: [c.ADDRESS1, c.ADDRESS2, c.ADDRESS3, c.PIN, c.CITY].filter(Boolean).join(", ") || "",
				isTemporary: false,
			}));
		}

		res.status(200).json({
			message: "Clients fetched successfully",
			clientList: clients,
		});
	} catch (err) {
		console.error("Error fetching clients:", err);
		res.status(500).json({
			message: "Server error",
			details: err.message,
		});
	}
};

// Get address suggestions
const searchAddresses = async (req, res) => {
	try {
		const { searchedAddress } = req.body;

		if (!searchedAddress || searchedAddress.trim().length < 3) {
			return res.status(400).json({ message: "Enter at least 3 characters" });
		}

		const url = "https://places.googleapis.com/v1/places:searchText";

		const response = await axios.post(
			url,
			{
				textQuery: searchedAddress,
				// maxResultCount: 10,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
					"X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location",
				},
			}
		);

		const results = response.data?.places?.map((p) => ({
			name: p.displayName?.text || "",
			address: p.formattedAddress,
			coordinates: p.location
				? [p.location.longitude, p.location.latitude]
				: null,
		}));
		// console.log("results", results); // debug

		res.json({ suggestions: results || [] });
	} catch (error) {
		console.error("Error fetching address suggestions:", error.message);
		res.status(500).json({ message: "Failed to fetch address suggestions" });
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
		const meetings = await ClientMeeting.find({
			isCompleted: false,
			onHold: false,
			assignedFE: { $in: [null, undefined] },
			"availability.start": { $lte: endOfDay },
			"availability.end": { $gte: startOfDay },
			status: "pending",
		}).select(
			"_id clientId clientType priority visitingAddress availability purposeOfVisit"
		);
		const unassignedMeetings = await Promise.all(
			meetings.map(async (m) => {
				let client = null;
				// Default to permanent (mint)
				const clientType = m.clientType || "mint";

				if (clientType === "mint") {
					client = await Client.findById(m.clientId)
						.select("NAME MOBILE ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN")
						.lean();
				} else if (clientType === "temporary") {
					client = await TempClient.findById(m.clientId)
						.select("name mobile address1 address2 address3 city pin")
						.lean();
				}
                // Build client address cleanly
				const clientAddress = client
					? [
						client.ADDRESS1 || client.address1,
						client.ADDRESS2 || client.address2,
						client.ADDRESS3 || client.address3,
						client.CITY || client.city,
						client.PIN || client.pin,
					]
						.filter(Boolean)
						.join(", ")
					: "";

				return {
					_id: m._id,
					priority: m.priority,
					visitingAddress: m.visitingAddress,
					purposeOfVisit: m.purposeOfVisit,
					availability: m.availability,
					clientType,
					clientId: client
						? {
							_id: client._id,
							name: client.NAME || client.name || "Unknown Client",
							contactNumber: client.MOBILE || client.mobile || "-",
							address: clientAddress || m.visitingAddress || "-",
						}
						: {
							_id: null,
							name: "Unknown Client",
							contactNumber: "-",
							address: m.visitingAddress || "-",
						},
				};
			})
		);
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
    const meetings = await ClientMeeting.find({
      isCompleted: false,
      onHold: false,
      assignedFE: { $exists: false },
      status: "pending",
    }).select(
      "_id clientId clientType priority visitingAddress availability purposeOfVisit"
    );

    const unassignedMeetings = await Promise.all(
      meetings.map(async (m) => {
        let client = null;
        let clientType = m.clientType || "mint"; // default to permanent

        if (clientType === "mint") {
          client = await Client.findById(m.clientId)
            .select("NAME MOBILE ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN")
            .lean();
        } else if (clientType === "temporary") {
          client = await TempClient.findById(m.clientId)
            .select("name mobile address1 address2 address3 city pin")
            .lean();
        }

        const clientAddress = client
          ? [
              client.ADDRESS1 || client.address1,
              client.ADDRESS2 || client.address2,
              client.ADDRESS3 || client.address3 || "",
              client.CITY || client.city,
              client.PIN || client.pin,
            ]
              .filter(Boolean)
              .join(", ")
          : "";

        return {
          _id: m._id,
          priority: m.priority,
          visitingAddress: m.visitingAddress,
          purposeOfVisit: m.purposeOfVisit,
          availability: m.availability,
          clientType,
          clientId: client
            ? {
                _id: client._id,
                name: client.NAME || client.name || "Unknown Client",
                contactNumber: client.MOBILE || client.mobile || "-",
                address: clientAddress || m.visitingAddress || "-",
              }
            : {
                _id: null,
                name: "Unknown Client",
                contactNumber: "-",
                address: m.visitingAddress || "-",
              },
        };
      })
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

// Fetch On-Hold/Cancelled clients
const fetchOnHoldClients = async (req, res) => {
  try {
    const { scope } = req.query;

    let filter = { onHold: true, status: "cancelled" };

    if (scope === "today") {
      const now = new Date();
      const startOfDayUTC = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      const endOfDayUTC = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          23,
          59,
          59,
          999
        )
      );

      filter["availability.start"] = { $lte: endOfDayUTC };
      filter["availability.end"] = { $gte: startOfDayUTC };
    }

    // Fetch raw meetings
    const meetings = await ClientMeeting.find(filter).select(
      "_id clientId clientType priority visitingAddress availability assignedFE isCompleted onHold purposeOfVisit status"
    );

    const onHoldMeetings = await Promise.all(
      meetings.map(async (m) => {
        let clientData = null;
        const clientType = m.clientType || "mint"; // default permanent

        // Fetch from correct collection
        if (clientType === "mint") {
          clientData = await Client.findById(m.clientId)
            .select("NAME MOBILE ADDRESS1 ADDRESS2 ADDRESS3 CITY PIN")
            .lean();
        } else if (clientType === "temporary") {
          clientData = await TempClient.findById(m.clientId)
            .select("name mobile address1 address2 address3 city pin")
            .lean();
        }

        // Build Address Safely
        const clientAddress = clientData
          ? [
              clientData.ADDRESS1 || clientData.address1,
              clientData.ADDRESS2 || clientData.address2,
              clientData.ADDRESS3 || clientData.address3,
              clientData.CITY || clientData.city,
              clientData.PIN || clientData.pin,
            ]
              .filter(Boolean)
              .join(", ")
          : "";

        return {
          _id: m._id,
          priority: m.priority,
          visitingAddress: m.visitingAddress,
          purposeOfVisit: m.purposeOfVisit,
          availability: m.availability,
          status: m.status,
          onHold: m.onHold,
          assignedFE: m.assignedFE || null,
          isCompleted: m.isCompleted || false,
          clientType,

          clientId: clientData
            ? {
                _id: clientData._id,
                name:
                  clientData.NAME ||
                  clientData.name ||
                  "Unknown Client",
                contactNumber:
                  clientData.MOBILE ||
                  clientData.mobile ||
                  "-",
                address: clientAddress || m.visitingAddress || "-",
              }
            : {
                _id: null,
                name: "Unknown Client",
                contactNumber: "-",
                address: m.visitingAddress || "-",
              },
        };
      })
    );

    res.status(200).json(onHoldMeetings);
  } catch (err) {
    console.error("Error fetching on-hold client meetings:", err);
    res
      .status(500)
      .json({ message: "Server error", details: err.message });
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

const createTemporaryClient = async (req, res) => {
	try {
		const {
			name,
			email,
			mobile,
			address1,
			address2,
			city,
			pin
		} = req.body;

		// Required fields
		if (!name || !address1 || !address2 || !city || !pin) {
			return res.status(400).json({
				message: "Missing required fields for temporary client"
			});
		}

		// Normalize mobile number → always store with "91"
		let normalizedMobile = "";

		if (mobile) {
			const cleaned = mobile.replace(/\D/g, ""); // remove non-numeric

			if (cleaned.length === 10) {
				normalizedMobile = "91" + cleaned;        // add prefix
			} else if (cleaned.startsWith("91") && cleaned.length === 12) {
				normalizedMobile = cleaned;              // already correct
			} else {
				return res.status(400).json({
					message: "Invalid mobile number format"
				});
			}
		}

		// Check duplicate (based on mobile)
		if (mobile) {
			const existing = await TempClient.findOne({ normalizedMobile });
			if (existing) {
				return res.status(400).json({
					message: "Temporary client with this mobile number already exists"
				});
			}
		}

		const tempClient = new TempClient({
			name,
			email,
			mobile: normalizedMobile,
			address1,
			address2,
			city,
			pin,
		});

		await tempClient.save();

		return res.status(201).json({
			message: "Temporary Client created successfully",
			tempClient
		});

	} catch (err) {
		console.error("Error creating Temporary Client:", err);
		res.status(500).json({
			message: "Server error",
			details: err.message
		});
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
			visitType,
			priority = 0,
		} = req.body;

		if (
			!clientId ||
			!visitingAddress ||
			!availabilityStart ||
			!availabilityEnd ||
			!purposeOfVisit ||
			!visitType
		) {
			return res.status(400).json({ 
				message: "Missing required fields for new visit" 
			});
		}

		// Verify client exists
		// 🔥 Support both permanent + temporary clients
        // ---------------------------------------------
		let client = await Client.findById(clientId);
    let clientType = "mint";

    if (!client) {
      client = await TempClient.findById(clientId);
      clientType = "temporary";
    }

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
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
			clientType, 
			visitingAddress,
			availability: { start: startDay, end: endDay },
			location: {
				type: "Point",
				coordinates: locCoordinates,
				urlString: locationUrlString,
			},
			purposeOfVisit,
			visitType,
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

		// strict 10-digit phone validation
		const phoneRegex = /^[0-9]{10}$/;
		if (!phoneRegex.test(contactNumber)) {
			return res
				.status(400)
				.json({ message: "Contact number must be a valid 10-digit number" });
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
		const { feId, visitId, slotStart, slotEnd, optimizeCurrentRoute } =
			req.body;

		// 1. Validate input
		if (!feId || !visitId || !slotStart || !slotEnd) {
			return res
				.status(400)
				.json({ message: "FE, visitId, and slot are required" });
		}

		const startUTC = new Date(slotStart);
		const endUTC = new Date(slotEnd);
		const nowUTC = new Date();

		// Avoid creating entries in the past
		if (endUTC <= nowUTC) return res.status(400).json({ message: "Cannot assign slots in the past" });

		// 2. Verify FE exists
		const fe = await FE.findById(feId);
		if (!fe)
			return res.status(404).json({ message: "Field Executive not found" });

		// 3. Fetch or create FERoute
		let feRoute = await FERoute.findOne({ feId });
		if (!feRoute) {
			feRoute = new FERoute({
				feId,
				baseLocation: { type: "Point", coordinates: baseLocation },
				currentLocation: {
					type: "Point",
					coordinates: baseLocation,
				},
				availability: [],
				bookedSlots: [],
			});
		}

		// 4. Check FE slot conflicts
		// const conflict = feRoute.bookedSlots.some(
		// 	(slot) => startUTC < slot.end && endUTC > slot.start
		// );

		const visitIds = feRoute.bookedSlots.map((s) => s.visit).filter(Boolean);
		const meetings = await ClientMeeting.find(
			{ _id: { $in: visitIds } },
			{ _id: 1, actualVisitStart: 1, actualVisitEnd: 1 }
		).lean();

		const meetingMap = new Map(
			meetings.map((m) => [m._id.toString(), m])
		);

		const hasConflict = feRoute.bookedSlots.some((slot) => {
			const m = meetingMap.get(slot.visit?.toString());
			const slotStart = m?.actualVisitStart || slot.start;
			const slotEnd = m?.actualVisitEnd || slot.end;

			return startUTC < slotEnd && endUTC > slotStart;
		});

		if (hasConflict) return res.status(400).json({ message: "FE is not available in this slot" });
		
		// 5. Fetch the specific ClientMeeting
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

		// 6. Assign FE to the meeting
		visit.assignedFE = feId;
		visit.availability = { start: startUTC, end: endUTC };	// Update Client's suggested time with actual time
		await visit.save();

		// 7. Update FERoute bookedSlots
		feRoute.bookedSlots.push({
			client: visit.clientId,
			visit: visit._id,
			start: startUTC,
			end: endUTC,
		});

		// 8. Update currentClient (earliest upcoming slot based on order)
		const upcomingSlots = feRoute.bookedSlots
			.filter((s) => s.start > new Date())
			.sort((a, b) => a.start - b.start);
		feRoute.currentClient = upcomingSlots[0]?.client || null;

		await feRoute.save();

		// 9. Route Optimizer worker function
		if (optimizeCurrentRoute) {
			// Wrap in object if coordinates exist
			const currentLocationObj = feRoute.currentLocation?.coordinates
				? { coordinates: feRoute.currentLocation.coordinates }
				: null;

			await optimizeFERoute(feId, currentLocationObj);
		}

		res.status(200).json({ message: "Client assigned to FE successfully" });
	} catch (err) {
		console.error("Error assigning client:", err);
		res.status(500).json({ message: "Server error", details: err.message });
	}
};

const getCoordinatesFromAddress = async (req, res) => {
	try {
		const { address } = req.query;
		// console.log("Entered BE getCoordinatesFromAddress"); // debug
		// console.log("req.query", req.query); // debug
		if (!address) {
			return res.status(400).json({ message: "Address is required" });
		}

		const coordinates = await getLocationCoordinates(address);
		if (!coordinates) {
			return res
				.status(404)
				.json({ message: "Could not find coordinates for given address" });
		}

		res.status(200).json({ coordinates });
	} catch (error) {
		console.error("Error fetching coordinates:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
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
	trackFEAndClient,
	fetchClientList,
	searchAddresses,
	fetchUnassignedClientsToday,
	fetchUnassignedClientsAllTime,
	fetchOnHoldClients,
	createClient,
	createTemporaryClient,
	addVisitForExistingClient,
	createFE,
	assignClientsToFE,
	getCoordinatesFromAddress
};