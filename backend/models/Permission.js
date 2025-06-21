const mongoose = require("mongoose");

const permissionSchema = mongoose.Schema({
    name: {
        type: String, required: true, trim: true
    },
    key: {
        type: String, required: true,
        unique: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CATEGORIES",
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Permission = mongoose.model("PERMISSIONS", permissionSchema);

module.exports = Permission;
