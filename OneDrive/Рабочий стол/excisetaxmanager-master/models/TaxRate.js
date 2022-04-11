const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaxRate = new Schema({
    tax: { name: { type: String, required: true }, tag: { type: String, required: true } },
    state: { name: { type: String, required: true }, shortcode: { type: String, required: true } },
    shop: { type: String, required: true },
    taxType: { type: String, required: true },
    value: { type: Number, required: true },
    bound: { unit: String, min: Number, max: Number },
    created: {
        type: Date,
        default: Date.now
    }
});

TaxRate.index({ "tax.tag": 1, 'state.shortcode': 1, shop: 1, "bound.unit": 1, "bound.min": 1, "bound.max": 1 }, { unique: true })

module.exports = mongoose.model('TaxRate', TaxRate);