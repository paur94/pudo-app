const Router = require('koa-router');
const cors = require('@koa/cors');
const router = new Router();
const TaxRate = require("../models/TaxRate")
const Checkout = require("../models/Checkout")
const Shop = require("../models/Shop")
const TaxLine = require("../models/TaxLine")
const { getUnitfromString } = require("../utils/unitHelper")
const TAX_PRODUCT_HANDLE = 'excise_tax'

router.post(`/getCheckoutTaxes/:shop/:checkoutId`, async (ctx) => {
    const { checkoutId, shop_name } = ctx.params;
    const shop = await Shop.findOne({ name: shop_name })


    if (!shop) {
        console.log(`no shop ${shop}`)
        ctx.status = 404;
        ctx.body = "shop not found please install the app in your shop";
        return
    }

    try {

        const checkout_request = await (await fetch(`https://${name}/admin/api/2021-04/checkouts/${id}.json`, {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            }
        })).json()

    }
    catch(e){
        console.log(e)
        ctx.status = 500;
        //TODO logappropriate error to heroku
        ctx.body = e;
    }   
    ctx.status = 200;
    ctx.body = { yaay: "ok" };
})

router.post(`/webhook`, async (ctx) => {
    const order = ctx.request.body
    //TODO filter tax products
    //TODO delete tax products
    ctx.status = 200;
    ctx.body = { yaay: "ok" };
})

router.get(`/addwebhook/:shop_name`, async (ctx) => {

    const { shop_name } = ctx.params;

    const shop = await Shop.findOne({ name: shop_name })

    const { name, accessToken } = shop

    const webhook = {
        "topic": "orders/create",
        "address": "https://d54c7ab0c6d7.ngrok.io/api/tax/webhook",
        "format": "json"
    }

    try {
        const create_webhook_request = await (await fetch(`https://${name}/admin/api/2021-04/webhooks.json`, {
            method: 'POST',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            },
            body: JSON.stringify({ webhook })
        })).json()
        ctx.status = 200;
        ctx.body = { yaay: "ok" };
    }
    catch (e) {
        ctx.status = 500;
        ctx.body = e;
    }
})

router.get(`/test/:id`, cors(), async (ctx) => {
    ctx.status = 200;
    ctx.body = { yaay: "ok" };
})

router.get(`/getVariantTax/:shop_name/:variant_id/:state`, cors(), async (ctx) => {
    const { variant_id, shop_name, state } = ctx.params;
    const shop = await Shop.findOne({ name: shop_name })
    const { name, accessToken } = shop
    const result = await calculateTotalTaxByVariant(variant_id, state, shop)
    ctx.status = 200;
    ctx.body = { tax: result };
})


router.get(`/addtaxes/:shop_name/:id/:state/:country`, cors(), async (ctx) => {
    ///TODO add api key for shop
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
        if (country_code === 'US') {
            const tax_line_item = await getTaxLineItem(checkout_request.checkout, shop, province_code)
            const tax_price = tax_line_item && tax_line_item.properties && tax_line_item.properties.excise_tax
            if (tax_price == old_tax_total) {
                ctx.status = 304;
                ctx.body = { yaay: "ok" };
                return
            }
            if (tax_price > 0)
                final_line_items.push(tax_line_item)
            else if (all_line_items.length === final_line_items.length) {
                ctx.status = 304;
                ctx.body = { yaay: "ok" };
                return
            }
        }
        else if (all_line_items.length === final_line_items.length) {
            ctx.status = 304;
            ctx.body = { yaay: "ok" };
            return
        }

        const update_checkout_request = await (await fetch(`https://${name}/admin/api/2021-04/checkouts/${id}.json`, {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': shop.accessToken,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                checkout: {
                    "line_items": final_line_items
                }
            })
        })).json()

        if (update_checkout_request.errors) {
            ctx.status = 500;
            ctx.body = update_checkout_request.errors;
            return
        }

        await Checkout.findOneAndUpdate(
            { token: id },
            {
                $set: {
                    token: checkout_request.checkout.token,
                    shop: name,
                    province: province_code,
                    country: country_code,
                    updated_at: new Date(update_checkout_request.checkout.updated_at)
                }
            },
            { upsert: true }).exec()

        ctx.status = 200;
        ctx.body = { updated_at: update_checkout_request.checkout.updated_at };
    }
    catch (e) {
        console.log(e)
        ctx.status = 500;
        ctx.body = e;
    }

})

async function calculateTotalTaxByVariant(variantId, state, shop) {

    const tax_rates = await TaxRate.find({ "state.shortcode": state, shop: shop.name })

    const variant_request = await (await fetch(`https://${shop.name}/admin/api/2021-04/variants/${variantId}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'content-type': 'application/json'
        }
    })).json()


    if (variant_request.errors) {
        console.log(variant_request.errors)
        throw variant_request.errors
    }
    const variant = variant_request.variant

    const product_request = await (await fetch(`https://${shop.name}/admin/api/2021-04/products/${variant.product_id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'content-type': 'application/json'
        }
    })).json()

    if (product_request.errors) {
        console.log(product_request.errors)
        throw product_request.errors
    }

    const product = product_request.product
    let tax = 0;
    for (const state_tax of tax_rates) {
        if (product.tags.indexOf(state_tax.tax.tag) > -1) {
            const tax_value = await calcConcreteTax(state_tax, variant, product, shop)
            tax += tax_value;
        }
    }

    return tax;
}

async function calculateTotalTaxByCheckout(checkout, state, shop) {

    const line_items = checkout.line_items;

    const tax_rates = await TaxRate.find({ "state.shortcode": state, shop: shop.name })
    const all_rates = await TaxRate.find({})
    let total_tax = 0
    for (const line_item of line_items) {
        total_tax += await calcLineTaxes(line_item, tax_rates, checkout.token, shop)
    }

    return total_tax;
}

async function calcLineTaxes(line_item, tax_rates, token, shop) {

    const product_request = await (await fetch(`https://${shop.name}/admin/api/2021-04/products/${line_item.product_id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'content-type': 'application/json'
        }
    })).json()

    if (product_request.errors) {
        console.log(product_request.errors)
        throw product_request.errors
    }

    const product = product_request.product
    let tax = 0;
    for (const state_tax of tax_rates) {
        if (product.tags.indexOf(state_tax.tax.tag) > -1) {

            const variant = product.variants.find(variant => variant.id == line_item.variant_id)

            const is_out_of_bounds = checkOutofBounds(state_tax, variant, product)

            const tax_value = is_out_of_bounds ? 0 : await calcConcreteTax(state_tax, variant, product, shop)
            tax += line_item.quantity * tax_value;

            await TaxLine.create({
                checkout_id: token,
                variant_id: line_item.variant_id,
                tax_rate_id: state_tax._id,
                value: tax_value,
                quantity: line_item.quantity,
                shop: shop.name,
            });
        }
    }

    return tax;
}

function checkOutofBounds(tax_rate, variant, product) {
    const { bound } = tax_rate
    if (!bound || !bound.unit)
        return false

    const unit_value = getUnitValue(bound.unit, variant.title, product.title)
    return (bound.min && unit_value < bound.min) || (bound.max && unit_value > bound.max)
}

async function calcConcreteTax(state_tax, variant, product, shop) {
    //TODO add per ML logic
    switch (state_tax.taxType) {
        case 'cost_percent': {
            const inventory_item_request = await (await fetch(`https://${shop.name}/admin/api/2021-04/inventory_items/${variant.inventory_item_id}.json`, {
                method: 'GET',
                headers: {
                    'X-Shopify-Access-Token': shop.accessToken,
                    'content-type': 'application/json'
                }
            })).json()
            if (inventory_item_request.errors) {
                console.log(inventory_item_request.errors)
                throw inventory_item_request.errors
            }
            const { inventory_item } = inventory_item_request
            const tax_value = Number(inventory_item.cost) * state_tax.value
            return tax_value;
        }
        case 'price_percent': {
            const tax_value = Number(variant.price) * state_tax.value
            return tax_value
        }
        case 'item_fixed': {
            return state_tax.value * 100
        }
        case 'per_pod_or_cartridge': {
            const number_of_packs = getUnitValue('pack of', variant.title, product.title, true) || 1
            const bundle = getUnitValue('x', variant.title, product.title) || getUnitValue('x', variant.title, product.title, true) || 1
            return state_tax.value * number_of_packs * 100 * bundle
        }
        case 'ml_fixed': {
            const mil_default_value = state_tax.tax && state_tax.tax.tag == 'PACT-disposable' ? 1.4 : 60
            const mil = getUnitValue('ml', variant.title, product.title) || mil_default_value
            const bundle = getUnitValue('x', variant.title, product.title) || getUnitValue('x', variant.title, product.title, true) || 1
            return state_tax.value * mil * 100 * bundle
        }
    }
}

function getUnitValue(unit, variant_title, product_title, inverse = false) {

    const unit_from_variant_title = getUnitfromString(unit, variant_title, inverse)
    const unit_from_product = getUnitfromString(unit, product_title, inverse)

    return unit_from_variant_title || unit_from_product
}

async function getTaxLineItem(checkout, shop, province_code) {
    const domestik = checkout.shipping_address && checkout.shipping_address.country_code == "US"
    if (!domestik)
        return

    const total_tax = await calculateTotalTaxByCheckout(checkout, province_code, shop)
    const tax_product = (await getTaxProduct(shop)) || (await createTaxProduct(shop));
    const variant_id = tax_product && tax_product.variants && tax_product.variants[0] && tax_product.variants[0].id;

    return {
        variant_id: variant_id,
        properties: { 'excise_tax': total_tax },
        price: 1000000,
        quantity: 1
    };
}

async function getTaxProduct(shop) {
    const tax_product_request = await (await fetch(`https://${shop.name}/admin/api/2021-04/products.json?handle=${TAX_PRODUCT_HANDLE}`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'content-type': 'application/json'
        }
    })).json()
    if (tax_product_request.errors) {
        throw tax_product_request.errors
    }
    const tax_product = tax_product_request.products && tax_product_request.products.length > 0 && tax_product_request.products[0];
    return tax_product;
}

async function createTaxProduct(shop) {
    const new_tax_product_data = {
        product: {
            "title": `Tax product`,
            "handle": TAX_PRODUCT_HANDLE,
            "vendor": "ENDS_taxer",
            "product_type": "ENDS_tax",
            "tags": "tax_product",
            "variants": [{
                "option1": "Tax",
                "price": 1000000,
                "inventory_management": "shopify",
                "inventory_policy": "continue",
                "taxable": false
            }]
        }
    };

    const new_tax_product_request = await (await fetch(`https://${shop.name}/admin/api/2021-04/products.json`, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': shop.accessToken,
            'content-type': 'application/json'
        },
        body: JSON.stringify(new_tax_product_data)
    })).json()

    if (new_tax_product_request.errors) {
        throw new_tax_product_request.errors
    }
    return new_tax_product_request.product
}

module.exports = router
