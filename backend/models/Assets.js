const mongoose = require('mongoose');
const { connectToMniveshDB } = require('../dbConfig/connection');
const mniveshDbConnection = connectToMniveshDB();

const AllocationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
  allocatedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date },
  status: {
    type: String,
    enum: ['allocated', 'returned', 'lost', 'replaced'],
    default: 'allocated'
  }
}, { _id: false });

const AssetSchema = new mongoose.Schema({
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'AssetType', required: true },
  allocations: [AllocationSchema],
  assetCode: { type: String },
  dateOfPurchase: { type: Date },
  assetName: { type: String },
  brandName: { type: String },
  modelNumber: { type: String },
  serialNumber: { type: String, unique: true, required: true },
  warrantyExpiryDate: { type: Date },
  status: { 
    type: String, 
    enum: ['available', 'allocated', 'removed', 'repair'], 
    default: 'available' 
  },
  merchantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
  remarks: { type: String },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'USERS' }
}, { timestamps: true });


// ✅ Add virtual allocatedTo
AssetSchema.virtual('allocatedTo').get(function () {
  if (!this.allocations || this.allocations.length === 0) return null;

  const lastAlloc = [...this.allocations].reverse()[0]; // last allocation
  if (!lastAlloc || !lastAlloc.userId) return null;

  if (lastAlloc.userId.name) {
    return { _id: lastAlloc.userId._id, name: lastAlloc.userId.name };
  }

  // fallback: only ObjectId
  return { _id: lastAlloc.userId, name: "Unknown User" };
});



// ✅ Enable virtuals in JSON & object output
AssetSchema.set('toJSON', { virtuals: true });
AssetSchema.set('toObject', { virtuals: true });

// const Assets = mniveshDbConnection.model('Asset', AssetSchema);
const Assets = mongoose.model('Asset', AssetSchema);

module.exports = Assets;