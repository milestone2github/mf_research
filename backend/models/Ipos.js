// ipos.js
const mongoose = require('mongoose');

const iposSchema = new mongoose.Schema({
  company: { type: String, required: false },
  slug: { type: String, required: false },
  open_date: { type: Date, required: false },
  close_date: { type: Date, required: false },
  lot_size: { type: String, required: false },
  price: { type: String, required: false },
  type: { type: String, required: false },
  face_value: { type: String, required: false },
  market_lot: { type: String, required: false },
  minimum_order_quantity: { type: String, required: false },
  listing_at: { type: String, required: false },
  issue_size: { type: String, required: false },
  allotment_date: { type: Date, required: false },
  initiation_refund: { type: Date, required: false },
  demat_account: { type: Date, required: false },
  listing_date: { type: Date, required: false },
  min_lot: { type: Number, required: false },
  max_lot: { type: Number, required: false },
  min_share: { type: String, required: false },
  max_share: { type: String, required: false },
  min_amount: { type: Number, required: false },
  max_amount: { type: Number, required: false },
  status: { type: Number, required: false },
  created_at: { type: Date, default: Date.now, required: false },
  updated_at: { type: Date, default: Date.now },
});

// Import your Mnivesh DB connection
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const Ipos = mniveshDbConnection.model('ipos', iposSchema);

module.exports = Ipos;
