const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = "PLI_Leaderboard_Data";
const collectionName = "aggregatedScores";

exports.getLeaderboard = async (_req, res) => {
  let client;

  try {
    // Connect directly to MongoDB
    client = new MongoClient(uri);
    await client.connect();
    console.log("Connected directly to MongoDB Atlas");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // --------------------------------------------
    // Determine the current financial year
    // FY starts in April, ends next March
    // --------------------------------------------
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    const fyField = `score_${startYear}-${String(endYear).slice(-2)}`;

    console.log(`Fetching leaderboard for Financial Year: ${startYear}-${endYear}`);

    // --------------------------------------------
    // 1️⃣ Fetch Financial Year Data
    // --------------------------------------------
    const fyDataRaw = await collection
      .find({ [fyField]: { $exists: true } })
      .sort({ [fyField]: -1 }) // sort by FY score
      .project({
        _id: 0,
        employee_id: 1,
        employee_name: 1,
        [fyField]: 1,
        updated_at: 1,
      })
      .toArray();

    const fyData = fyDataRaw.map((d) => ({
      employee_id: d.employee_id,
      employee_name: d.employee_name,
      score: d[fyField],
      updated_at: d.updated_at,
    }));

    // --------------------------------------------
    // 2️⃣ Fetch Current Month Data
    // --------------------------------------------
    const monthlyDataRaw = await collection
      .find({ scoreCurrentMonth: { $exists: true } })
      .sort({ scoreCurrentMonth: -1 }) // sort by current month score
      .project({
        _id: 0,
        employee_id: 1,
        employee_name: 1,
        scoreCurrentMonth: 1,
        updated_at: 1,
      })
      .toArray();

    const monthlyData = monthlyDataRaw.map((d) => ({
      employee_id: d.employee_id,
      employee_name: d.employee_name,
      score: d.scoreCurrentMonth,
      updated_at: d.updated_at,
    }));

    // --------------------------------------------
    // Send both datasets to frontend
    // --------------------------------------------
    res.status(200).json({
      financialYear: `${startYear}-${endYear}`,
      fyData,
      monthlyData,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) {
      await client.close();
      console.log("MongoDB connection closed");
    }
  }
};
