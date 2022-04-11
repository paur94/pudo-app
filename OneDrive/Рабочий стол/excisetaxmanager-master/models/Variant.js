const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Variant = new Schema({
    product_id: { type: String, required: true },
    variant_id: { type: String, required: true },
    shop: { type: String, required: true },
    inventory_item_id: { type: String },
    weight: Number,
    weight_unit: String,
    cost: Number,
    barcode: String,
    last_update: {
        type: Date,
        default: Date.now
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Variant', Variant);