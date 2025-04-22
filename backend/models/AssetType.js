const mongoose = require('mongoose');
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const TypeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetCategory', required: true }
}, { timestamps: true });

// module.exports = mniveshDbConnection.model('AssetType', TypeSchema);
module.exports = mongoose.model('AssetType', TypeSchema);
