const { MongoClient } = require("mongodb");

require("dotenv").config();

// Example: process.env.MONGO_URI = "mongodb+srv://username:password@milestone.wftaulr.mongodb.net"
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

    // Fetch and sort leaderboard data
    const data = await collection
      .find({})
      .sort({ score: -1 }) // highest score first
      .project({
        _id: 0,
        employee_id: 1,
        employee_name: 1,
        score: 1,
        updated_at: 1
      })
      .toArray();

    res.status(200).json(data);
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