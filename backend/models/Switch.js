const mongoose = require('mongoose');
const statusEnum = require('../utils/statusEnum');

const switchTransactionSchema = new mongoose.Schema({
    transactionPreference: {type: Date, default: Date.now},
    panNumber: String,
    investorName: String,
    familyHead: String,
    iWellCode: String,
    registrantName: String,
    registrantEmail: String,
    switchMfAmcName: String,
    switchFromScheme: String,
    switchToScheme: String,
    switchFromSchemeOption: String,
    switchToSchemeOption: String,
    switchFolio: String,
    switchTransactionUnits_Amount: String,
    switchTransactionAmount: Number,
    orderNo: String,
    sessionId: String,
    transactionFractions: [{
        fractionAmount: Number, 
        status: {type: String, enum: statusEnum}
    }],
    status: {type: String, enum: statusEnum},
}, {timestamps: true});

module.exports = mongoose.model('Switch', switchTransactionSchema);
