const mongoose = require('mongoose')
const { statusEnum, approvalStatusEnum, reconcileStatus } = require('../utils/enums')

const transactionSchema = new mongoose.Schema({
  transactionPreference: { type: Date, default: Date.now },
  panNumber: { type: String, required: true },
  investorName: String,
  familyHead: String,
  iWellCode: String,
  relationshipManager: { type: String, trim: true },
  serviceManager: { type: String, trim: true },
  registrantName: String,
  registrantEmail: { type: String, required: true },
  category: { type: String, enum: ['systematic', 'purchredemp', 'switch'] },
  transactionType: String,
  transactionFor: String, //systematic only
  amcName: { type: String, required: true },
  schemeName: { type: String, trim: true }, //switch to scheme
  fromSchemeName: String, //switch from scheme and swp source scheme
  folioNumber: { type: String, required: true },
  transactionUnits: String,
  amount: Number,
  paymentMode: String,
  schemeOption: String,
  fromSchemeOption: String,
  firstTransactionAmount: Number, //systematic only
  sipSwpStpDate: Date, //systematic only
  sipPauseMonths: String, //systematic only
  tenure: String, //systematic only
  frequency: String, //systematic only
  transactionDate: Date,
  chequeNumber: { type: String, maxLength: 6 },
  sessionId: String,
  orderId: { type: String, trim: true },
  orderPlatform: { type: String, trim: true },
  note: { type: String, trim: true, maxLength: 1200 },
  status: { type: String, enum: statusEnum },
  approvalStatus: { type: String, enum: approvalStatusEnum, default: '' },
  linkStatus: { type: String, enum: ['generated', 'locked', 'unlocked'], default: 'unlocked' },
  hasFractions: { type: Boolean, default: false },
  transactionFractions: [{
    fractionAmount: Number,
    transactionDate: { type: Date, default: Date.now },
    addedBy: String,
    orderId: { type: String, trim: true },
    orderPlatform: { type: String, trim: true },
    folioNumber: String,
    note: { type: String, trim: true, maxLength: 1200 },
    linkStatus: { type: String, enum: ['initialized', 'generated', 'deleted'] },
    status: { type: String, enum: statusEnum },
    approvalStatus: { type: String, enum: approvalStatusEnum, default: '' },
    validations: [{
      validatedBy: {
        ref: 'USERS',
        type: mongoose.Schema.Types.ObjectId,
      },
      validatedAt: Date,
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] }
    }],
    reconciliation: {
      reconciledBy: {
        ref: 'USERS',
        type: mongoose.Schema.Types.ObjectId,
      },
      reconcileStatus: {
        type: String,
        enum: reconcileStatus
      },
      reconciledAt: Date,
      folioNumber: String,
      orderId: String,
      sipSwpStpDate: Date,
      firstTransactionAmount: Number,
      transactionPreference: Date,
      amount: Number, // in case of major issues
      schemeName: String, // in case of major issues
      panNumber: String, // in case of major issues
      note: {type: String, trim: true, minLength: 5, maxLength: 1000 }
    },
    managementApproval: {
      approvedBy: {
        ref: 'USERS',
        type: mongoose.Schema.Types.ObjectId,
      },
      approvedAt: Date,
    }
  }],
  validations: [{
    validatedBy: {
      ref: 'USERS',
      type: mongoose.Schema.Types.ObjectId,
    },
    validatedAt: Date,
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'] }
  }],
  reconciliation: {
    reconciledBy: {
      ref: 'USERS',
      type: mongoose.Schema.Types.ObjectId,
    },
    reconcileStatus: {
      type: String,
      enum: reconcileStatus
    },
    reconciledAt: Date,
    folioNumber: String,
    orderId: String,
    sipSwpStpDate: Date,
    firstTransactionAmount: Number,
    transactionPreference: Date,
    amount: Number, // in case of major issues
    schemeName: String, // in case of major issues
    panNumber: String, // in case of major issues
    note: {type: String, trim: true, minLength: 5, maxLength: 1000 }
  },
  managementApproval: {
    approvedBy: {
      ref: 'USERS',
      type: mongoose.Schema.Types.ObjectId,
    },
    approvedAt: Date,
  }
}, { timestamps: true })

module.exports = mongoose.model('Transactions', transactionSchema)