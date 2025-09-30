const { Schema, model } = require("mongoose");

// -------------------- Field Executive Comments --------------------
const feCommentSchema = new Schema({
	text: { type: String, required: true },
	by: { type: Schema.Types.ObjectId, ref: "FE" }, // optional, track who added
	byName: { type: String },
	location: {  // store current location of FE when he writes comments (on Mark as Complete OR just adding comments)
		type: { type: String, enum: ["Point"], default: "Point" },
		coordinates: {
			type: [Number],
			validate: {
				validator: (val) => val.length === 2,
				message: "Coordinates must be [longitude, latitude]",
			},
		},
	},
	createdAt: { type: Date, default: Date.now },
});

// -------------------- Client --------------------
// TO handle multiple recurring visits to same client
const clientVisitSchema = new Schema({
	visitingAddress: { type: String, required: true },
	availability: {
		start: { type: Date, required: true },
		end: { type: Date, required: true },
	},
	location: {
		type: { type: String, enum: ["Point"], default: "Point" },
		coordinates: { type: [Number], required: true }, // [LONGITUDE, LATITUDE]
		urlString: { type: String, required: true },
	},
	assignedFE: { type: Schema.Types.ObjectId, ref: "FE" }, // track which FE is assigned
	purposeOfVisit: { type: String, required: true },
	priority: { type: Number, default: 0 },
	isCompleted: { type: Boolean, default: false },
	onHold: { type: Boolean, default: false },
	feComments: [feCommentSchema],
	createdAt: { type: Date, default: Date.now },
});

const clientSchema = new Schema(
	{
		name: { type: String, required: true },
		address: { type: String, required: true },
		contactNumber: { type: String, required: true, unique: true },
		visitDetails: [clientVisitSchema],
		// availability: {
		// 	start: { type: Date, required: true },
		// 	end: { type: Date, required: true },
		// },
		// location: {
		// 	type: { type: String, enum: ["Point"], default: "Point" },
		// 	coordinates: { type: [Number], required: true }, // [LONGITUDE, LATITUDE]
		// 	urlString: { type: String, required: true }
		// },
		// purposeOfVisit: { type: String, required: true },
		// priority: { type: Number, default: 0 },
		// isCompleted: { type: Boolean, default: false },
		// onHold: { type: Boolean, default: false },
		// feComments: [feCommentSchema],
	},
	{ timestamps: true }
);
clientSchema.index({ "visitDetails.location": "2dsphere" });
clientSchema.index({ "visitDetails.feComments.location": "2dsphere" });
// clientSchema.index({ location: "2dsphere" });
// clientSchema.index({ "feComments.location": "2dsphere" });

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
		actualVisitStart: { type: Date, required: true },	// Actual starting time from current location
		actualVisitEnd: { type: Date, required: true },		// Actual end-time afte the task marked as completed
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

// // Convert date to midnight UTC before saving
// routeOptimizationSchema.pre("save", function (next) {
// 	if (this.date) {
// 		const d = new Date(this.date);
// 		this.date = new Date(
// 			Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
// 		);
// 	}
// 	next();
// });

// -------------------- Models --------------------
const Client = model("Client", clientSchema);
const FE = model("FE", fieldExecutiveSchema);
const FERoute = model("FERoute", fieldExecutiveRouteSchema);
const RouteOptimization = model("RouteOptimization", routeOptimizationSchema);

module.exports = { Client, FE, FERoute, RouteOptimization };