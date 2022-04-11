const TaxRate = require("../models/TaxRate")
const Checkout = require("../models/Checkout")
const Shop = require("../models/Shop")
const VariantDetails = require("../models/VariantDetails")
const { getUnitfromString } = require("../utils/unitHelper")
const { getLineSubtotalData } = require("../utils/orderCalculationsHelper")
const { asyncForEach } = require("../utils/asyncHelper")


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

async function calcConcreteTax(state_tax, cost, capacity, item_sale_price) {

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
            return state_tax.value *  100
        }
        case 'ml_fixed': {
            return state_tax.value * variant.capacity * 100
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