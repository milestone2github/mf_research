const mongoose = require("mongoose");

const roleSchema = mongoose.Schema({
    name: {
        type: String, required: true, trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DEPARTMENTS",
        required: true
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "PERMISSIONS"
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Role = mongoose.model("ROLES", roleSchema);

module.exports = Role;



//schema for adding role and permission to database
// const mongoose = require("mongoose")

// const roleSchema = mongoose.Schema({
//     role: {
//         type: String,
//         require: true,
//     },
//     permissions: [
//         String
//     ]
// })

// const role = mongoose.model("ROLES", roleSchema)
// module.exports=role