const mongoose = require('mongoose');

const purchaseRedemptionTransactionSchema = new mongoose.Schema({
    transactionPreference: String,
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
    purch_redempTransactionUnits_Amount: Number,
    purch_redempTransactionAmount: Number,
}, {timestamps: true});

module.exports = mongoose.model('predemption', purchaseRedemptionTransactionSchema);
