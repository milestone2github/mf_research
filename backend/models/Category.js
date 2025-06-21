const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: {
        type: String, required: true, trim: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Category = mongoose.model("CATEGORIES", categorySchema);

module.exports = Category;
