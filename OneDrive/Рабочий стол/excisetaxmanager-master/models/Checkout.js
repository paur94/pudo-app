const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Checkout = new Schema({
    token: String,
    shop: String,
    country: String,
    province: String,
    updated_at: Date,
});

module.exports = mongoose.model('Checkout', Checkout);

