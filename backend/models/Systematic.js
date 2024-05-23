const mongoose = require('mongoose');

const systematicTransactionSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    default: ""
  },
  transactionPreference: {
    type: String,
    default: ""
  },
  registrant: {
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
  systematicSchemeOption: {
    type: String,
    required: true,
  },
  systematicFolio: {
    type: String,
    trim: true,
  },
  sip_swp_stpAmount: { type: Number },
  tenureOfSip_swp_stp: { type: Number },
  sipPauseMonths: {
    type: String,
    trim: true
  },
  sip_stp_swpDate: {
    type: Date,
  },
  firstTransactionAmount: {
    type: Number,
  }
}, {timestamps: true});

module.exports = mongoose.model('systematic', systematicTransactionSchema);
