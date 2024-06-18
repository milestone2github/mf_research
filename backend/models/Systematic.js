const mongoose = require('mongoose');
const statusEnum = require('../utils/statusEnum')

const systematicTransactionSchema = new mongoose.Schema({
  registrantEmail: {
    type: String,
    trim: true,
    default: ""
  },
  transactionPreference: {type: Date, default: Date.now},
  registrantName: {
    type: String,
    trim: true,
    default: ""
  },
  panNumber: {
    type: String,
    required: true,
    trim: true,
  },
  iWellCode: String,
  investorName: {
    type: String,
    required: true,
    trim: true
  },
  familyHead: {
    type: String,
    trim: true
  },
  systematicTraxType: {
    type: String,
  },
  systematicTraxFor: {
    type: String
  },
  systematicSchemeName: {
    type: String,
    trim: true
  },
  systematicMfAmcName: {
    type: String,
    trim: true
  },
  systematicSourceScheme: {
    type: String,
    trim: true,
    default: ""
  },
  systematicFolio: {
    type: String,
    trim: true,
  },
  sipPauseMonths: {
    type: String,
    trim: true
  },
  systematicSchemeOption: String,
  sip_swp_stpAmount: Number,
  tenureOfSip_swp_stp: Number,
  sip_stp_swpDate: Date,
  firstTransactionAmount: Number,
  firstInstallmentPaymentMode: String,
  transactionFractions: [{
    fractionAmount: Number, 
    status: {type: String, enum: statusEnum}
  }],
  status: {type: String, enum: statusEnum},
  sessionId: String
}, {timestamps: true});

module.exports = mongoose.model('systematic', systematicTransactionSchema);
