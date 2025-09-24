const { Schema, model } = require("mongoose");

// -------------------- Client --------------------
const clientSchema = new Schema(
	{
		name: { type: String, required: true },
		address: { type: String, required: true },
		contactNumber: { type: String, required: true },
		availability: {
			start: { type: Date, required: true },
			end: { type: Date, required: true },
		},
		location: {
			type: { type: String, enum: ["Point"], default: "Point" },
			coordinates: { type: [Number], required: true }, // [LONGITUDE, LATITUDE]
		},
		purposeOfVisit: { type: String, required: true },
		priority: { type: Number, default: 0 },
		feComments: { type: String },
	},
	{ timestamps: true }
);
clientSchema.index({ location: "2dsphere" });

// -------------------- Field Executive --------------------
const fieldExecutiveSchema = new Schema(
	{
		contactNumber: { type: String, required: true, unique: true },
		employeeId: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
	},
	{ timestamps: true }
);

// -------------------- Field Executive Route Details --------------------
const fieldExecutiveRouteSchema = new Schema(
	{
		feId: { type: Schema.Types.ObjectId, ref: "FE", required: true },
		baseLocation: {
			type: { type: String, enum: ["Point"], default: "Point" },
			coordinates: { type: [Number], required: true }, // [LONGITUDE, LATITUDE]
		},
		currentLocation: {
			type: { type: String, enum: ["Point"], default: "Point" },
			coordinates: { type: [Number] }, // [LONGITUDE, LATITUDE]
		},
		availability: [
			{
				start: { type: Date, required: true },
				end: { type: Date, required: true },
			},
		],
		bookedSlots: [
			{
				client: { type: Schema.Types.ObjectId, ref: "Client" },
				start: { type: Date, required: true },
				end: { type: Date, required: true },
			},
		],
		currentClient: { type: Schema.Types.ObjectId, ref: "Client" },
	},
	{ timestamps: true }
);
fieldExecutiveRouteSchema.index({
	baseLocation: "2dsphere",
	currentLocation: "2dsphere",
});

// -------------------- Route --------------------
const routeSchema = new Schema(
	{
		fe: { type: Schema.Types.ObjectId, ref: "FE", required: true },
		client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
		visitStart: { type: Date, required: true },
		visitEnd: { type: Date, required: true },
		order: { type: Number },
		status: {
			type: String,
			enum: ["pending", "completed", "cancelled"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

// -------------------- Route Optimization --------------------
const routeOptimizationSchema = new Schema(
	{
		date: { type: Date, required: true },
		feList: [{ type: Schema.Types.ObjectId, ref: "FERoute" }],
		clients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
		routes: [routeSchema],
		generatedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

// -------------------- Models --------------------
const Client = model("Client", clientSchema);
const FE = model("FE", fieldExecutiveSchema);
const FERoute = model("FERoute", fieldExecutiveRouteSchema);
const RouteOptimization = model("RouteOptimization", routeOptimizationSchema);

module.exports = { Client, FE, FERoute, RouteOptimization };