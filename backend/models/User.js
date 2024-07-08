//schema for adding users and assigning roles to them 
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique:true
    },
    nameAsRM: {type: String, trim: true},
    role: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:"ROLES"
    }
})

const User = mongoose.model("USERS", userSchema)
module.exports = User