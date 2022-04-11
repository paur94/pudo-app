const Router = require('koa-router');
const cors = require('@koa/cors');
const router = new Router();
const TaxRate = require("../models/TaxRate")
const Checkout = require("../models/Checkout")
const Shop = require("../models/Shop")
const Order = require("../models/Order")
const ShopDetails = require("../models/ShopDetails")
const VariantDetails = require("../models/VariantDetails")
const TaxLine = require("../models/TaxLine")
const { getUnitfromString } = require("../utils/unitHelper")
const { getLineSubtotalData } = require("../utils/orderCalculationsHelper")
const { asyncForEach } = require("../utils/asyncHelper")
const { getTimezoneDiffernence, getMonthRangeForTimezoneISOString } = require("../utils/dateHelper")

const TAX_PRODUCT_HANDLE = 'excise_tax'
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get(`/addtaxes/:shop_name/:id/:state/:country`, cors(), async (ctx) => {

    const { id, shop_name, state, country } = ctx.params;
    const shop = await Shop.findOne({ name: shop_name })

    if (!shop) {
        console.log(`no shop ${shop}`)
        ctx.status = 404;
        ctx.body = "shop not found please install the app in your shop";
        return
    }

    const { name, accessToken } = shop
    try {

        const checkout_request = await (await fetch(`https://${name}/admin/api/2021-04/checkouts/${id}.json`, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            }
        })).json()

        if (checkout_request.errors) {
            console.log(checkout_request.errors)
            ctx.status = 500;
            ctx.body = checkout_request.errors;
            return
        }

        const province_code = state || checkout_request.checkout.shipping_address.province_code
        const country_code = country || (checkout_request.checkout && checkout_request.checkout.shipping_address && checkout_request.checkout.shipping_address.country_code)

        const checkout_data = await Checkout.findOne({ token: id, province: province_code, country: country_code })

        const no_changes = checkout_data && checkout_data.updated_at && checkout_data.updated_at.getTime() == new Date(checkout_request.checkout.updated_at).getTime()

        if (no_changes) {
            ctx.status = 304;
            ctx.body = { yaay: "ok" };
            return
        }

        const all_line_items = checkout_request.checkout.line_items;
        const ordinary_line_items = all_line_items.filter(line_item => line_item.vendor != "ENDS_taxer").map(line_item => { return { variant_id: line_item.variant_id, quantity: line_item.quantity } })

        const final_line_items = [...ordinary_line_items]

        const old_tax_item = all_line_items.find(line_item => line_item.vendor === "ENDS_taxer")
        const old_tax_total = old_tax_item && old_tax_item.properties && old_tax_item.properties.excise_tax
        
        const taxes = await CalculateOrderTaxes(order, state, shop_name)

        ctx.status = 200;
        ctx.body = { updated_at: update_checkout_request.checkout.updated_at };
    }
    catch (e) {
        console.log(e)
        ctx.status = 500;
        ctx.body = e;
    }

})


router.get(`/state-by-month/:state/:month/:year`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const now = new Date()
    const { month, state, year } = ctx.params;

    const shopDetails = await ShopDetails.findOne({ myshopify_domain: shop })

    const timezone_difference = getTimezoneDiffernence(shopDetails['iana_timezone'])

    //TODO Jan, Dec
    const month_index = months.indexOf(month)
    const from = new Date(new Date(year, month_index, 1).setMinutes(timezone_difference)).toISOString()
    const to = new Date(new Date(year, month_index + 1, 1).setMinutes(timezone_difference)).toISOString()
    
    const count = await Order.find({
        shop,
        "shipping_address.province_code": state,
        processed_at: {
            $gte: from,
            $lt: to
        }
    }).countDocuments();

    const orders = await Order.find({
        shop,
        "shipping_address.province_code": state,
        processed_at: {
            $gte: from,
            $lt: to
        }
    });
    
    let total_taxes_cents = 0
    await asyncForEach(orders, async (order) => {
        total_taxes_cents += await CalculateOrderTaxes(order, state, shop)
    })


    ctx.status = 200;
    ctx.body = {
        tax: total_taxes_cents / 100, orders: count
    };
})

async function CalculateOrderTaxes(order, state, shop_name) {
    const country_code = order.shipping_address && order.shipping_address.country_code;
    if (country_code !== 'US')
        return 0;

    const taxable_lines = order._doc.line_items.filter(line_item => line_item.vendor != "ENDS_taxer")

    const tax_rates = await TaxRate.find({ "state.shortcode": state, shop: shop_name })

    let result = 0;
    await asyncForEach(taxable_lines, async (line_item) => {
        result += await calcLineTaxes(order, line_item, tax_rates, shop_name)
    })

    return result;
}

async function calcLineTaxes(order, line_item, tax_rates, shop_name) {

    const variantDetails = await VariantDetails.findOne({ shopify_variant_id: line_item.variant_id, shop: shop_name }).populate("product")

    if (variantDetails == null)
        return 0

    const { line_sale_price, final_quantity } = getLineSubtotalData(order, line_item)

    if (final_quantity == 0)
        return 0

    const product = variantDetails.product
    let tax = 0;
    for (const state_tax of tax_rates) {
        //TODO change array to string in model
        //TODO use regex for substring checking from string helper
        if (product.tags[0].indexOf(state_tax.tax.tag) > -1) {

            const is_out_of_bounds = checkOutofBounds(state_tax, variantDetails, product)

            const tax_value = is_out_of_bounds ? 0 : await calcConcreteTax(state_tax, variantDetails, line_sale_price, final_quantity)
            tax += final_quantity * tax_value;

        }
    }

    return tax;
}

async function calcConcreteTax(state_tax, variant, item_sale_price, final_quantity) {

    switch (state_tax.taxType) {
        case 'cost_percent': {
            //TODO remove all default values
            const tax_value = (Number(variant.cost) || (item_sale_price * 0.6)) * state_tax.value
            return tax_value;
        }
        case 'price_percent': {
            const tax_value = Number(item_sale_price) * state_tax.value
            return tax_value
        }
        case 'item_fixed': {
            return state_tax.value * 100
        }
        case 'per_pod_or_cartridge': {
            return state_tax.value * variant.items_count * 100
        }
        case 'ml_fixed': {
            return state_tax.value * variant.capacity * 100 * variant.items_count
        }
    }
}

function checkOutofBounds(tax_rate, variant, product) {
    const { bound } = tax_rate
    if (!bound || !bound.unit)
        return false

    const unit_value = getUnitValue(bound.unit, variant.title, product.title)
    return (bound.min && unit_value < bound.min) || (bound.max && unit_value > bound.max)
}

function getUnitValue(unit, variant_title, product_title, inverse = false) {

    const unit_from_variant_title = getUnitfromString(unit, variant_title, inverse)
    const unit_from_product = getUnitfromString(unit, product_title, inverse)

    return unit_from_variant_title || unit_from_product
}

module.exports = router
