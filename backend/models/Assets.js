const mongoose = require('mongoose');
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const AssetSchema = new mongoose.Schema({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
    name: { type: String, required: true },
    serialNumber: { type: String, unique: true, required: true },
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
    status: { type: String, enum: ['available', 'allocated', 'removed', 'repair'], default: "available" },
    remarks: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
}, {timestamps: true});

// const Assets = mniveshDbConnection.model('Asset', AssetSchema);
const Assets = mongoose.model('Asset', AssetSchema);

module.exports = Assets;