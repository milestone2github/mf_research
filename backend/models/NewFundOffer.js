const mongoose = require('mongoose')

const newFundOfferSchema = new mongoose.Schema({
  sessionId: {type: String, required: true},
  panNumber: {type: String, required: true},
  investorName: {type: String, required: true},
  familyHead: String,
  iWellCode: String,
  registrantName: String,
  registrantEmail: String,
  amcName: String,
  schemeCode: {type: String, required: true},
  schemeOption: String,
  ucc: String,
  amount: Number,
  folioNumber: String,
  nfoUrl: String
}, {timestamps: true})

module.exports = mongoose.model("NewFundOffer", newFundOfferSchema)