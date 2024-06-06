const mongoose = require('mongoose');

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
    purch_redempTransactionUnits_Amount: Number,
    purch_redempTransactionAmount: Number,
    sessionId: String,
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
        ]}
}, {timestamps: true});

module.exports = mongoose.model('predemption', purchaseRedemptionTransactionSchema);
