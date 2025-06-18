const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: String,
  phone: String,
  otp: Number,
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expires in 10 minutes
});

module.exports = mongoose.model('Otp', otpSchema);
