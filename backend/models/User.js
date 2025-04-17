//schema for adding users and assigning roles to them 
const mongoose = require("mongoose")
// const { connectToMniveshDB } = require("../dbConfig/connection")
// const mniveshDbConnection = connectToMniveshDB();

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
    },
    mintUsername: {type: String, trim: true},
    insuranceDashboardId: {type: String, trim: true},
    folderId: {type: String, trim: true},
})

module.exports = mongoose.model("USERS", userSchema);
