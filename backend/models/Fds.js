// fds.js
const mongoose = require('mongoose');

const fdsSchema = new mongoose.Schema({
  id: { type: Number, required: false },
  name: { type: String, required: false },
  logo: { type: String, required: false },
  slug: { type: String, required: false },
  rating: { type: String, required: false },
  roi: { type: Number, required: false },
  month_12: { type: String, required: false },
  month_24: { type: String, required: false },
  month_36: { type: String, required: false },
  month_48: { type: String, required: false },
  month_60: { type: String, required: false },
  senior: { type: Number, required: false },
  status: { type: Number, required: false },
  created_at: { type: Date, default: Date.now, required: false },
  updated_at: { type: Date, default: Date.now },
});

// Import your mnivesh DB connection
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const Fds = mniveshDbConnection.model('fixed_deposits', fdsSchema);

module.exports = Fds;
