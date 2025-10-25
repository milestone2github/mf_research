const mongoose = require('mongoose')

const marketingUserSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USERS',
    required: true,
    unique: true
  },
  email: {type: String, trim: true},
  phone: {type: String, trim: true},
  name: {type: String, trim: true},
})

const MarketingUser = mongoose.model('MarketingUser', marketingUserSchema)

module.exports = MarketingUser