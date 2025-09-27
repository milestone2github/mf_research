// backend/models/InsuranceRecoFile.js
const mongoose = require("mongoose");
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const InsuranceRecoFileSchema = new mongoose.Schema({
  filenames: {
    type: [String],
    required: true,
    default: [],
  },
});

module.exports = mongoose.model(
  "InsuranceRecoFile",
  InsuranceRecoFileSchema,
  "insurancerecofiles" // force collection name
);
