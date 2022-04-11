const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaxLine = new Schema({
    checkout_id: { type: String, required: true },
    variant_id: { type: String, required: true },
    tax_rate_id: { type: Schema.Types.ObjectId, ref: 'TaxRate' },
    value: Number,
    shop: { type: String, required: true },
    quantity: { type: Number, required: true },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TaxLine', TaxLine);