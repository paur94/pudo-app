const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Shop = new Schema({
    accessToken: String,
    name: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    plan: {
        name: String,
        price: Number,
        trial_days: Number
    },
    charge: {
        id: Number,
        name: String,
        api_client_id: Number,
        price: Number,
        status: String,
        return_url: String,
        test: Boolean,
        created_at: Date,
        updated_at: Date,
        billing_on: Date,
        activated_on: Date,
        cancelled_on: Date,
        trial_days: Number,
        trial_ends_on: Date,
        decorated_return_url: String,
        confirmation_url: String
    }
});

module.exports = mongoose.model('Shop', Shop);