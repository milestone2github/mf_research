const mongoose = require("mongoose");
require('dotenv').config()

let milestoneDbConnection = null;

const connetToTransactionsDb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}/mftransactiondb`)
    if (connect) {
      console.log("Connected to MfTransactions DB");
    }
    else {
      throw new Error("MfTransactions DB connection failed")
    }
  } catch (error) {
    console.log("MfTransactions DB connection failed: ", error.message);
    process.exit(1);
  }
}

const connectToMilestoneDB = () => {
  try {
    if (!milestoneDbConnection) {
      milestoneDbConnection = mongoose.createConnection(`${process.env.MONGO_URI}/Milestone`);
      milestoneDbConnection.on('connected', async () => {
        console.log('Connected to Milestone DB')
        // const collections = await milestoneDbConnection.listCollections()
        // console.log('collections ', collections)
      })
    }
    return milestoneDbConnection;
  } catch (error) {
    console.error('Milestone DB connection failed: ', error.message)
    process.exit(1)
  }
};

module.exports = { connetToTransactionsDb, connectToMilestoneDB };