const mongoose = require('mongoose');

const switchTransactionSchema = new mongoose.Schema({
    transactionPreference: String,
    panNumber: String,
    investorName: String,
    familyHead: String,
    iWellCode: String,
    registrantName: String,
    registrantEmail: String,
    switchMfAmcName: String,
    switchFromScheme: String,
    switchToScheme: String,
    switchSchemeOption: String,
    switchFolio: String,
    switchTransactionUnits_Amount: Number,
    switchTransactionAmount: Number
}, {timestamps: true});

module.exports = mongoose.model('Switch', switchTransactionSchema);
