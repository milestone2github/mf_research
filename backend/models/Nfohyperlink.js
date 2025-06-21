const mongoose = require('mongoose');

const nfohyperlinkSchema = mongoose.Schema({
    imageUrl: {
        type: String, required: true,
    },
    redirectUrl: {
        type: String, required: true,
    },
}, { timestamps: true }
)

const nfohyperlink = mongoose.model("NFOhyperlink", nfohyperlinkSchema)

module.exports = nfohyperlink