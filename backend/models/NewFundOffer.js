const mongoose = require('mongoose')

const newFundOfferSchema = new mongoose.Schema({
  orderId: {type: String, required: true},
  panNumber: {type: String, required: true},
  investorName: {type: String, required: true},
  familyHead: String,
  iWellCode: String,
  registrantName: String,
  registrantEmail: String,
  amcName: String,
  schemeName: String,
  schemeCode: {type: String, required: true},
  schemeOption: String,
  ucc: String,
  amount: Number,
  folioNumber: String,
  nfoUrl: String,
  status: String
}, {timestamps: true})

module.exports = mongoose.model("NewFundOffer", newFundOfferSchema)