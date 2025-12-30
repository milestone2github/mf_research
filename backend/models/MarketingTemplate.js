const mongoose = require("mongoose");

const marketingTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  imageUrl: { type: String, required: true, trim: true },

  // ✅ store only type in same field
  disclaimer: {
    type: String,
    enum: ["MUTUAL_FUND", "INSURANCE", "STOCK_MARKET"],
    required: true,
  },

  category: {
    type: String,
    enum: ["MARKETING", "MARKETING_COLLATERAL"],
    default: "MARKETING",
    required: true,
  },

  publishDate: { type: Date, required: true },

  closeDate: {
    type: Date,
    default: null,
    validate: {
      validator: function (v) {
        if (this.category === "MARKETING") return !!v;
        return v == null;
      },
      message:
        "closeDate is required for MARKETING and must be null for MARKETING_COLLATERAL",
    },
  },

  createdAt: { type: Date, default: Date.now },
});

marketingTemplateSchema.pre("validate", function (next) {
  if (this.closeDate && this.publishDate && this.closeDate < this.publishDate) {
    this.invalidate("closeDate", "closeDate cannot be before publishDate");
  }
  next();
});

const MarketingTemplate = mongoose.model(
  "MarketingTemplate",
  marketingTemplateSchema
);

module.exports = MarketingTemplate;
