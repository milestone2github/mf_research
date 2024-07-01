const mongoose = require('mongoose')
const statusEnum = require('../utils/statusEnum')

const transactionSchema = new mongoose.Schema({
  transactionPreference: { type: Date, default: Date.now },
  panNumber: {type: String, required: true},
  investorName: String,
  familyHead: String,
  iWellCode: String,
  registrantName: String,
  registrantEmail: {type: String, required: true},
  category: {type: String, enum: ['systematic', 'purchredemp', 'switch']},
  transactionType: String,
  transactionFor: String, //systematic only
  amcName: {type: String, required: true},
  schemeName: {type: String, required: true}, //switch to scheme
  fromSchemeName: String, //switch from scheme only
  folioNumber: {type: String, required: true},
  transactionUnits: String,
  amount: Number,
  paymentMode: String,
  schemeOption: String,
  fromSchemeOption: String, 
  firstTransactionAmount: Number, //systematic only
  sipSwpStpDate: Date, //systematic only
  sipPauseMonths: String, //systematic only
  tenure: String, //systematic only
  transactionDate: Date,
  chequeNumber: {type: String, maxLength: 6},
  sessionId: String,
  status: {type: String, enum: statusEnum},
  linkStatus: {type: String, enum: ['generated', 'locked', 'unlocked'], default: 'unlocked'},
  transactionFractions: [{
    fractionAmount: Number,
    transactionDate: {type: Date, default: Date.now},
    addedBy: String, 
    linkStatus: {type: String, enum: ['initialized', 'generated', 'deleted']},
    status: {type: String, enum: statusEnum}
  }],
}, {timestamps: true})

module.exports = mongoose.model('Transactions', transactionSchema)