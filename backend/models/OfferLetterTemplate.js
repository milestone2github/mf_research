const mongoose = require("mongoose");

const OfferLetterTemplateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true
    },

    title: {
      type: String,
      required: true
    },

    type: {
      type: String,
      required: true,
      enum: ["fulltime", "intern", "contract"]
    },

    body: {
      type: String,
      required: true
    },

    settings: {
      companyName: {
        type: String,
        required: true
      },

      offerValidityDays: {
        type: Number,
        default: 2
      },

      probationMonths: {
        type: Number,
        default: 3
      },

      probationNoticeDays: {
        type: Number,
        default: 7
      },

      postProbationNotice: {
        type: String
      },

      hrPhone: {
        type: String,
        default: "+91 9910049264"
      },

      hrEmail: {
        type: String,
        default: "jobs@niveshonline.com"
      },

       headerImageUrl: {
        type: String
      },

      hrSignatureImageUrl: {
        type: String
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "OfferLetterTemplate",
  OfferLetterTemplateSchema
);
