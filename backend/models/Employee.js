const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, trim: true},
  phone: {type: String, trim: true},
  department: {type: String, trim: true},
  role: {type: String, trim: true},
})

const Employee  = mongoose.model('Employee', employeeSchema)

module.exports = Employee 