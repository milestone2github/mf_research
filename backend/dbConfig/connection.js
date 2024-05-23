const mongoose = require("mongoose")
require('dotenv').config()

let milestoneDbConnection;

const connetToTransactionsDb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}/mftransactiondb`)
    if (connect) {
      console.log("Connected to MfTransacts DB");
    }
    else {
      throw new Error("MfTransacts DB connection failed")
    }
  } catch (error) {
    console.log("MfTransacts DB connection failed: ", error.message);
    process.exit(1);
  }
}

const connectToMilestoneDB = () => {
  try {
    if (!milestoneDbConnection) {
      milestoneDbConnection = mongoose.createConnection(`${process.env.MONGO_URI}/Milestone`);
      console.log('Connected to Milestone DB');
    }
    return milestoneDbConnection;
  } catch (error) {
    console.error('Milestone DB connection failed: ', error.message)
    process.exit(1)
  }
};

module.exports = { connetToTransactionsDb, connectToMilestoneDB };