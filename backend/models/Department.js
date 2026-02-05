const mongoose = require("mongoose");

const departmentSchema = mongoose.Schema({
    name: {
        type: String, required: true, trim: true
    },
    zohoid: {
    type: String,   
    trim: true
  },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PERMISSIONS"
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Department = mongoose.model("DEPARTMENTS", departmentSchema);

module.exports = Department;
