const mongoose = require('mongoose');
const statusEnum = require('../utils/statusEnum');

const purchaseRedemptionTransactionSchema = new mongoose.Schema({
    transactionPreference: {type: Date, default: Date.now},
    panNumber: String,
    investorName: String,
    familyHead: String,
    iWellCode: String,
    registrantName: String,
    registrantEmail: String,
    purch_RedempTraxType: String,
    purch_redempMfAmcName: String,
    purch_redempSchemeName: String,
    purch_redempSchemeOption: String,
    purch_redempFolio: String,
    purch_redempTransactionUnits_Amount: String,
    purch_redempTransactionAmount: Number,
    paymentMode: String,
    sessionId: String,
    transactionFractions: [{
        fractionAmount: Number, 
        status: {type: String, enum: statusEnum}
    }],
    status: {type: String, enum: statusEnum},
}, {timestamps: true});

module.exports = mongoose.model('predemption', purchaseRedemptionTransactionSchema);
