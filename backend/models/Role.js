//schema for adding role and permission to database
const mongoose = require("mongoose")

const roleSchema = mongoose.Schema({
    role: {
        type: String,
        require: true,
    },
    permissions: [
        String
    ]
})

const role = mongoose.model("ROLES", roleSchema)
module.exports=role