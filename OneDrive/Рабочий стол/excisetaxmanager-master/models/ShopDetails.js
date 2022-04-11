const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ShopDetails = new Schema({
    full_name: String,
    full_address:String,
    shopify_id: String,
    name: String,
    email: String,
    domain: String,
    province: String,
    country: String,
    address1: String,
    zip: String,
    city: String,
    phone: String,
    phone_extention: String,
    address2: String,
    created_at: Date,
    updated_at: Date,
    country_code: String,
    country_name: String,
    currency: String,
    customer_email: String,
    timezone: String,
    iana_timezone: String,
    shop_owner: String,
    weight_unit: String,
    province_code: String,
    taxes_included: Boolean,
    tax_shipping: Boolean,
    county_taxes: Boolean,
    plan_display_name: String,
    plan_name: String,
    has_discounts: Boolean,
    has_gift_cards: Boolean,
    myshopify_domain: String,
    primary_location_id: Number,
    territory: String,
    //TODO emp_number = fei_number
    emp_number: String,
    fei_number: String,
    mailing_address: String,
    mailing_city: String,
    mailing_state: String,
    mailing_zip: String,
    mailing_territory: String,

    resp_party_name: String,
    resp_party_title:String,
    resp_party_phone_number:String,

    delivery_services: [
        {
            name: String,
            address: String,
            phone_number: String,
        }
    ],

    tags_set: Boolean
});

module.exports = mongoose.model('ShopDetails', ShopDetails);

