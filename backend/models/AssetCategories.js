const mongoose = require('mongoose');
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
}, { timestamps: true });

// module.exports = mniveshDbConnection.model('AssetCategory', CategorySchema);
module.exports = mongoose.model('AssetCategory', CategorySchema);

