const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory' },
    name: { type: String, required: true }, //new
    serialNumber: { type: String, unique: true, required: true }, //modified
    allocatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' }, // new
    status: { type: String, enum: ['available', 'allocated', 'removed', 'repair'], default: "available" }, // new
    remarks: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
}, {timestamps: true});

// Import your mnivesh DB connection
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const Assets = mniveshDbConnection.model('Asset', AssetSchema);

module.exports = Assets;