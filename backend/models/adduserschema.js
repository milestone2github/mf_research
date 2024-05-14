//schema for adding users and assigning roles to them 
const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        require: true,
        unique:true
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref:"ROLES"
    }
})

const user = mongoose.model("USERS", userSchema)
module.exports=user