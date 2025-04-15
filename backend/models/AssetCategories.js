const { default: mongoose } = require("mongoose");

const AssetCategorySchema = mongoose.Schema({
    name: { type: String, unique: true, required: true }
});

// Import DB connection
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const AssetCategories = mniveshDbConnection.model('AssetCategory', AssetCategorySchema);

module.exports = AssetCategories;