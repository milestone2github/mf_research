const mongoose = require('mongoose');

const zohoEmployeeIdCountSchema = new mongoose.Schema({
    currentCount: { type: Number, required: true, default: 385 }
}, {
    timestamps: true
});

const ZohoEmployeeIdCount = mongoose.model("ZohoEmployeeIdCount", zohoEmployeeIdCountSchema);

module.exports = ZohoEmployeeIdCount;
