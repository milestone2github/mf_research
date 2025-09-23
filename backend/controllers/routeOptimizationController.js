// Update Field Executive's current location
const { FE } = require("../models");
const { RouteOptimization } = require("../models");

// Update Current Location of Field Executive
exports.updateUserLocation = async (req, res) => {
	try {
		const { lat, long } = req.body;
		const feId = req.user.id; // parsed from JWT middleware

		if (!lat || !long) {
			return res
				.status(400)
				.json({ error: "Latitude and longitude are required" });
		}

		await FE.findByIdAndUpdate(feId, {
			currentLocation: { type: "Point", coordinates: [long, lat] },
		});

		return res.status(200).json({ message: "Location updated successfully" });
	} catch (err) {
		return res
			.status(500)
			.json({ error: "Failed to update location", details: err.message });
	}
};

// GET tasks (pending + optimized order)
exports.getTasks = async (req, res) => {
	try {
		const feId = req.user.id; // from JWT
		const today = new Date();
		const startOfDay = new Date(today.setHours(0, 0, 0, 0));
		const endOfDay = new Date(today.setHours(23, 59, 59, 999));

		const tasks = await RouteOptimization.aggregate([
			{
				$match: {
					date: { $gte: startOfDay, $lte: endOfDay },
					feList: { $in: [feId] },
				},
			},
			{ $unwind: "$routes" }, // destructure routes into separate steps
			{
				$lookup: {
					from: "clients",
					localField: "routes.client",
					foreignField: "_id",
					as: "client",
				},
			},
			{ $unwind: "$client" },
			{ $match: { "routes.status": "pending" } },
			{
				$sort: {
					"routes.order": 1,
					"client.priority": -1, // higher priority first if same order
				},
			},
			{
				$project: {
					_id: 0,
					task_id: "$routes._id",
					client_name: "$client.name",
					task_status: "$routes.status",
					task_priority: "$client.priority",
					visitStart: "$routes.visitStart",
					visitEnd: "$routes.visitEnd",
					order: "$routes.order",
				},
			},
		]);

		if (!tasks.length) {
			return res.status(404).json({ message: "No tasks found for today" });
		}

		return res.json(tasks);
	} catch (err) {
		return res
			.status(500)
			.json({ error: "Failed to fetch tasks", details: err.message });
	}
};

// GET completed tasks
exports.getCompletedTasks = async (req, res) => {
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
