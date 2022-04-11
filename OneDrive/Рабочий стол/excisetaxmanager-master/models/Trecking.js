const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Tracking = new Schema({
    shop: { type: String, required: true },
    generated_number: { type: String, required: true },
    order_shopify_id: { type: String, required: true },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Tracking', Tracking);

