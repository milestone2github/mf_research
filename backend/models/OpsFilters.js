const mongoose = require('mongoose')

const opsFilterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'USERS'
  },
  allTrxFilters: {
    values: {
      type: [{type: String, trim: true}],
      validate: [arrayLimit, '{PATH} exceeds the limit of 5']
    },
    activeIdx: {type: Number, default: -1}
  },
  reconciliationFilters: {
    values: {
      type: [{type: String, trim: true}],
      validate: [arrayLimit, '{PATH} exceeds the limit of 5'] 
    },
    activeIdx: {type: Number, default: -1}
  }
});

// Custom validation function to limit the size of the array
function arrayLimit(val) {
  return val.length <= 5; 
}

const OpsFilter = mongoose.model('OpsFilter', opsFilterSchema)
module.exports = OpsFilter