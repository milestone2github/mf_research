const { Schema, model } = require("mongoose");
const { connectToMilestoneDB } = require('../dbConfig/connection');

const mintConnection  = connectToMilestoneDB();

// -------------------- Client --------------------
const clientSchema = new Schema(
  {
    // use DB keys as paths and alias them to our app-friendly names
    NAME: { type: String, alias: "name" },
    EMAIL: { type: String, alias: "email" },
    MOBILE: { type: String, alias: "mobile" },
    ADDRESS1: { type: String, alias: "address1" },
    ADDRESS2: { type: String, alias: "address2" },
    CITY: { type: String, alias: "city" },
    PIN: { type: String, alias: "pin" },
  },
  { timestamps: true, strict: false, collection: "MintDb" }
);

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

// Handle multiple recurring visits/meetings with same client
const clientMeetingSchema = new Schema({
	clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
	clientType: { type: String, enum: ["mint", "temporary"], default: "mint" },
	visitingAddress: { type: String, required: true },
	availability: {
		start: { type: Date, required: true },
		end: { type: Date, required: true },
	},
	location: {
		type: { type: String, enum: ["Point"], default: "Point" },
		coordinates: { type: [Number], required: true },
		urlString: { type: String, required: true },
	},
	assignedFE: { type: Schema.Types.ObjectId, ref: "FE" },
	purposeOfVisit: { type: String, required: true },
	priority: { type: Number, default: 0 },
	isCompleted: { type: Boolean, default: false },
	onHold: { type: Boolean, default: false },
	order: { type: Number },
	actualVisitStart: { type: Date }, // Actual starting time from current location
	actualVisitEnd: { type: Date }, // Actual end-time afte the task marked as completed
	status: {
		type: String,
		enum: ["pending", "completed", "cancelled"],
		default: "pending",
	},
	feComments: [feCommentSchema],
	createdAt: { type: Date, default: Date.now },
});
clientMeetingSchema.index({ location: "2dsphere" });
clientMeetingSchema.index({ "feComments.location": "2dsphere" });

// -------------------- Field Executive --------------------
const fieldExecutiveSchema = new Schema(
	{
		contactNumber: { type: String, required: true, unique: true },
		employeeId: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		status: { type: String, enum: ["active", "inactive"], default: "active" },
	},
	{ timestamps: true }
);

// -------------------- Field Executive Route Details --------------------
const fieldExecutiveRouteSchema = new Schema(
	{
		feId: { type: Schema.Types.ObjectId, ref: "FE", required: true },
		docDate: { type: Date, required: true }, // New field: date of this route
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
				visit: { type: Schema.Types.ObjectId, ref: "ClientMeeting" },
				start: { type: Date, required: true },
				end: { type: Date, required: true },
			},
		],
		currentClient: { type: Schema.Types.ObjectId, ref: "Client" },
		battery: [
			{
				timestamps: { type: Date, required: true },
				batteryPercentage: { type: Number, required: true },
			},
		],
	},
	{ timestamps: true }
);
fieldExecutiveRouteSchema.index({
	baseLocation: "2dsphere",
	currentLocation: "2dsphere",
},{ feId: 1, docDate: 1 }, { unique: true });

// -------------------- Route --------------------
// const routeSchema = new Schema(
// 	{
// 		fe: { type: Schema.Types.ObjectId, ref: "FE", required: true },
// 		client: { type: Schema.Types.ObjectId, ref: "Client", required: true },
// 		actualVisitStart: { type: Date, required: true },	// Actual starting time from current location
// 		actualVisitEnd: { type: Date, required: true },		// Actual end-time afte the task marked as completed
// 		order: { type: Number },
// 		status: {
// 			type: String,
// 			enum: ["pending", "completed", "cancelled"],
// 			default: "pending",
// 		},
// 	},
// 	{ timestamps: true }
// );

// -------------------- Route Optimization --------------------
// const routeOptimizationSchema = new Schema(
// 	{
// 		date: { type: Date, required: true },
// 		feList: [{ type: Schema.Types.ObjectId, ref: "FERoute" }],
// 		clients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
// 		routes: [routeSchema],
// 		generatedAt: { type: Date, default: Date.now },
// 	},
// 	{ timestamps: true }
// );

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

// -------------------- Temporary Client --------------------
const temporaryClientSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String },
		mobile: { type: String },
		address1: { type: String, required: true },
		address2: { type: String, required: true },
		city: { type: String, required: true },
		pin: { type: String, required: true },
		type: { type: String, default: "temporary" }
	},
	{ timestamps: true }
);

// -------------------- Models --------------------
const Client = mintConnection.model("Client", clientSchema);
const ClientMeeting = model("ClientMeeting", clientMeetingSchema);
const FE = model("FE", fieldExecutiveSchema);
const FERoute = model("FERoute", fieldExecutiveRouteSchema);
const TempClient = model("TemporaryClient", temporaryClientSchema);
// const RouteOptimization = model("RouteOptimization", routeOptimizationSchema);

module.exports = { Client, ClientMeeting, FE, FERoute, TempClient };