const mongoose = require("mongoose");

// Schema for marketing category
const marketingCategorySchema = new mongoose.Schema(
	{
		key: {
			type: String,
			unique: true,
			required: true,
			immutable: true,
			uppercase: true,
			trim: true,
      default: "MARKETING"
		},
		label: { 
      type: String, 
      required: true, 
      default: "Marketing",
      trim: true 
    },
		isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false }
	},
	{ timestamps: true }
);

// Schema for disclaimer options
const disclaimerOptionsSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    required: true,
    immutable: true,
    uppercase: true,
    trim: true
  },
  label: {
    type: String,
    required: true,
    trim: true
  },
	text: {
		type: String,
		required: false,
	},
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true })

const marketingTemplateSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		imageUrl: { type: String, required: true, trim: true },

		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "MarketingCategory",
			required: true,
		},

		disclaimer: {
			type: mongoose.Schema.ObjectId,
      ref: "DisclaimerOptions",
			// enum: ["MUTUAL_FUND", "INSURANCE", "STOCK_MARKET"],
			required: true,
		},

		publishDate: { type: Date, required: true },

		closeDate: {
			type: Date,
			default: null,
			// validate: {
			// 	validator: function (v) {
			// 		if (this.category === "MARKETING") return !!v;
			// 		return v == null;
			// 	},
			// 	message:
			// 		"closeDate is required for MARKETING and must be null for MARKETING_COLLATERAL",
			// },
		},
	},
	{ timestamps: true }
);

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

const MarketingCategory = mongoose.model(
	"MarketingCategory",
	marketingCategorySchema
);

const DisclaimerOptions = mongoose.model(
	"DisclaimerOptions",
	disclaimerOptionsSchema
);

module.exports = {
  MarketingTemplate,
  MarketingCategory,
  DisclaimerOptions
};
