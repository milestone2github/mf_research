const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = "PLI_Leaderboard_Data";
const zohoUsersCollection = "Zoho_Users";
const lumpsumAuditCollection = "Lumpsum_audit";
const leaderboardAuditCollection = "Leaderboard_audit";
const sipCollection = "MF_SIP_Leaderboard";
const referralCollection = "referralLeaderboard";
const mfLeadersCollection = "MF_Leaders";

let db;

// Initiate db connection with PLI_Leaderboard_Data collection
async function dbInstanceConnect() {
	try {
		const client = new MongoClient(uri);
		await client.connect();
		console.log("Connected to PLI_Leaderboard_Data DB");
		db = client.db(dbName);
	} catch (err) {
		console.log("PLI_Leaderboard DB connection failed: ", err.message);
	}
}
dbInstanceConnect();  // run once

// Fetch Zoho's employee_id for referencing in db
async function fetchEmployeeId(email) {
	const zohoUsers = db.collection(zohoUsersCollection);
	const empInfo = await zohoUsers.findOne(
		{ email },
		{ projection: { id: 1, full_name: 1 } }
	);
	return empInfo || null;
}

// Lumpsum Audit data fetch
const lumpsumAudit = async (req, res) => {
	try {
		const { month, year } = req.query;
		const email = req.user.email;
		if (!email) return res.status(400).json({ message: "Email is required" });

		const lumpsumColl = db.collection(lumpsumAuditCollection);

		const empInfo = await fetchEmployeeId(email);
		if (!empInfo)
			return res.status(404).json({ message: "Employee not found" });

		const { id: employee_id } = empInfo;

		const query = { employee_id };

		if (month && year) {
			// Specific month filter
			const monthStr = `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}`;
			query.month = monthStr;
			console.log("month string ==> ", monthStr); // debug
		} else if (year && !month) {
			// Year-only filter
			query.month = { $regex: `^${year.toString().padStart(4, "0")}-` };
		}

		const lumpsumDataFetch = lumpsumColl
			.find(query, {
				projection: {
					AUM: 1,
					"Breakdown.Totals.Total Additions": 1,
					"Breakdown.Totals.Total Subtractions": 1,
					"Incentive.growth_pct": 1,
					"Incentive.band": 1,
					"Incentive.final_incentive": 1,
					"Meetings.count": 1,
					"Streak.bonus_total": 1,
					month: 1,
				},
			})
			.sort({ month: -1 });

		if (!month && !year) {
			lumpsumDataFetch.limit(24); // limit last 24 months if no filter
		}

		const lumpsumData = await lumpsumDataFetch.toArray();

		// Format resultant data in custom object
		const formattedData = lumpsumData.map((d) => ({
			month: d.month,
			aum: d.AUM || 0,
			totalAdditions: d.Breakdown?.Totals?.["Total Additions"] || 0,
			totalSubtractions: d.Breakdown?.Totals?.["Total Subtractions"] || 0,
			growthPct: d.Incentive?.growth_pct || 0,
			incentiveBand: d.Incentive?.band || null,
			finalIncentive: d.Incentive?.final_incentive || 0,
			meetingCount: d.Meetings?.count || 0,
			streakBonus: d.Streak?.bonus_total || 0,
		}));

		res.json({
			empId: employee_id,
			empName: empInfo.full_name,
			data: formattedData,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal Server Error" });
	}
};


const leaderboardAudit = async (req, res) => {
	try {
		const { leadId } = req.query;
		const email = req.user.email;
		if (!email) return res.status(400).json({ message: "Email is required" });

		const leaderboardAuditColl = db.collection(leaderboardAuditCollection);

		const empInfo = await fetchEmployeeId(email);

		if (!empInfo)
			return res.status(404).json({ message: "Employee not found" });

		const { id: employee_id } = empInfo;

		const query = { employee_id };

		if (leadId) {
			query.lead_id = leadId;
		}

		const leaderboardDataFetch = leaderboardAuditColl
			.find(query, {
				projection: {
					lead_id: 1,
					justification: 1,
					points: 1,
					weight_factor: 1
				},
			});

		const leaderboarAuditData = await leaderboardDataFetch.toArray();

		// Format resultant data in custom object
		const formattedData = leaderboarAuditData.map((d) => ({
			leadId: d.lead_id,
			points: d.points || 0,
			weightFactor: d.weight_factor || 0,
			justification: d.justification || ''
		}));

		res.json({
			empId: employee_id,
			empName: empInfo.full_name,
			data: formattedData,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal Server Error" });
	}
}


const mfSIP = async (req, res) => {
	try {

	} catch (err) {
		res.status(500).json({ message: "Internal Server Error" });
	}
}


const referralLeaderboard = async (req, res) => {
	try {

	} catch (err) {
		res.status(500).json({ message: "Internal Server Error" });
	}
}


const mfLeaders = async (req, res) => {
	try {

	} catch (err) {
		res.status(500).json({ message: "Internal Server Error" });
	}
}

module.exports = {
	lumpsumAudit,
	leaderboardAudit,
	mfSIP,
	referralLeaderboard,
	mfLeaders,
};