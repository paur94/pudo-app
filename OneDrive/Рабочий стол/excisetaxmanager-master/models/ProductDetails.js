const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductDetails = new Schema({

    shop: { type: String, required: true },
    title: { type: String, required: true },
    vendor: String,
    product_type: String,
    shopify_product_id: { type: String, required: true },
    updated_at: Date,
    created_at: Date,
    status: String,
    published_scope: String,
    //TODO change to string
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    images: [{
        id: String,
        product_id: String,
        position: Number,
        created_at: Date,
        updated_at: Date,
        width: Number,
        height: Number,
        src: String,
        variant_ids: [
            {}
        ]
    }],
    variants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "VariantDetails",
        default: []
    }],
    approved: { type: Boolean, default: false },
    inventory_min_set: { type: Boolean, default: false },
    is_ends: { type: Boolean, default: true },
    removed: { type: Boolean, default: false },
    track_min_quantity: { type: Boolean, default: false },
    category_tags: [{
        type: String,
        default: []
    }]
});

ProductDetails.index({ shop: 1, shopify_product_id: 1 }, { unique: true });

module.exports = mongoose.model('ProductDetails', ProductDetails);