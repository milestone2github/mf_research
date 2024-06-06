const mongoose = require('mongoose');

const systematicTransactionSchema = new mongoose.Schema({
  email: {
    type: String,
    trim: true,
    default: ""
  },
  transactionPreference: {type: Date, default: Date.now},
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
  status: {type: String, 
    enum: [
        'PENDING', 
        'REQUESTED', 
        '2FA_VALIDATED', 
        'EXPIRED', 
        '2FA_VALIDATED_PAYMENT_PENDING', 
        'PAYMENT_PROCESSED', 
        'PAYMENT_STATUS_PENDING', 
        'SYSTEM_UPDATE_AWAITING',
        'SEND_TO_RTA',
        'INVALID_TRANSACTION',
        'RTA_PROCESSED',
        'RTA_REJECTED',
        'ALLOTTED',
        'ALLOTMENT_PENDING'
    ]},
  sessionId: String
}, {timestamps: true});

module.exports = mongoose.model('systematic', systematicTransactionSchema);
