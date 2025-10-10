const mongoose = require('mongoose');


const MerchantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    contactPerson: { type: String },
    address: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Merchant', MerchantSchema);
