//schema for adding users and assigning roles to them 
const mongoose = require("mongoose")

const workdriveschema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    nameforproject: {type: String, trim: true},
    date: {
        type: Date,
        default: Date.now
    },
    note: {type: String, trim: true},
    error: {type: String, trim: true},
    proceeded: {type: Boolean},
})

const Workdrive = mongoose.model("Workdrive", workdriveschema)
module.exports = Workdrive