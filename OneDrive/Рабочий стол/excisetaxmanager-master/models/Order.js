const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Order = new Schema({

    shop: { type: String, required: true },
    shopify_id: { type: String, required: true },

    checkout_token: String,
    closed_at: Date,
    created_at: Date,
    current_total_price: Number,
    current_subtotal_price: Number,
    current_total_tax: Number,
    financial_status: String,
    variant_ids: [String],
    fulfillments: [{
        created_at: Date,
        shopify_id: String,
        order_id: String,
        status: String,
        tracking_company: String,
        tracking_number: String,
        updated_at: Date
    }],
    line_items: [{
        fulfillable_quantity: Number,
        fulfillment_service: String,
        fulfillment_status: String,
        grams: Number,
        id: String, //TODO test
        price: Number,
        product_id: Number,
        quantity: Number,
        requires_shipping: Boolean,
        sku: String,
        title: String,
        variant_id: String,
        variant_title: String,
        vendor: String,
        name: String,
        gift_card: Boolean,
        taxable: Boolean,
        total_discount: Number,
        discount_allocations: [{
            amount: Number,
        }],
        tax_lines: [{
            title: String,
            price: Number,
        }]
    }],
    name: String,
    order_number: Number,
    processed_at: Date,
    processing_method: String,
    refunds: [
        {
            "id": String,
            "order_id": String,
            "created_at": Date,
            "processed_at": Date,
            "refund_line_items": [],
            "transactions": [],
            "order_adjustments": []
        }
    ],
    shipping_address: {
        "address1": String,
        "address2": String,
        "city": String,
        "company": String,
        "country": String,
        "first_name": String,
        "last_name": String,
        "latitude": String,
        "longitude": String,
        "phone": String,
        "province": String,
        "zip": String,
        "name": String,
        "country_code": String,
        "province_code": String
    },
    source_name: String,
    subtotal_price: Number,
    token: String,
    total_discounts: Number,
    total_line_items_price: String,
    total_price: String,
    total_tax: String,
    total_weight: Number,
    updated_at: Date,
    fulfillment_status: String,
    current_total_discounts: Number,
    shipping_lines: {
        discounted_price: Number,
        price: Number,
        title: String
    },
    created: {
        type: Date,
        default: Date.now
    }

});

Order.index({ shop: 1, shopify_id: 1 }, { unique: true });

module.exports = mongoose.model('Order', Order);