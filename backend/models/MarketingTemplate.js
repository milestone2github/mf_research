const mongoose = require('mongoose');

const marketingTemplateSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    publishDate: { type: Date, required: true }
});

const MarketingTemplate = mongoose.model('MarketingTemplate', marketingTemplateSchema);

module.exports = MarketingTemplate;
