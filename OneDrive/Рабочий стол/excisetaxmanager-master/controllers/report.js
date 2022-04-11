const Router = require('koa-router');
const router = new Router();
const { getOrders } = require("../utils/shopify")
const fs = require('fs');

const templates = {
    default: require('../pact_templates/default'),
    california: require('../pact_templates/california'),
}

const html_to_pdf = require('html-pdf-node');
const Variant = require('../models/Variant')
const VariantDetails = require('../models/VariantDetails')

router.post(`/sales`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { page_url } = ctx.params;

    const { orders, pagination } = await getOrders(shop, accessToken, 10, page_url);

    const sales_report_data = await GetSalesReportData(shop, accessToken, orders);

    ctx.status = 200;
    ctx.body = { data: sales_report_data, pagination };
})

router.get(`/last_month_total_taxes`, async (ctx) => {

    const { shop, accessToken } = ctx.session;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 0).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const url = `https://${shop}/admin/api/2021-04/orders.json?status=closed&created_at_min=${from}&created_at_max=${to}`
    const orders = await getOrders(shop, accessToken, url)

    const taxes_by_states = {}
    const total_taxes = orders.forEach((order) => {
        const state = order.shipping_address && order.shipping_address.province_code
        taxes_by_states[state] = taxes_by_states[state] || 0
        const tax_line = order.line_items.find(line => line.vendor == 'ENDS_taxer')
        const tax = tax_line && tax_line.pre_tax_price ? Number(tax_line.pre_tax_price) : 0
        taxes_by_states[state] += tax
    });

    ctx.status = 200;
    ctx.body = taxes_by_states;
})

router.get(`/last_month_pdf/:state`, async (ctx) => {

    const { state } = ctx.params;
    const { shop, accessToken } = ctx.session;
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 0).toISOString()
    const to = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const url = `https://${shop}/admin/api/2021-04/orders.json?status=closed&created_at_min=${from}&created_at_max=${to}`
    const orders = await getOrders(shop, accessToken, url, state)

    const { sale_items, totals } = await GetSalesReportData(shop, accessToken, orders, state)


    const report_data = {
        state: states[state],
        sale_items,
        totals,
        period: {
            from,
            to
        },
        shop: {
            full_name: "Siroart Inc., DBA Vape Juice Depot",
            address: "555 Riverdale Dr. Ste D",
            city: "Glendale",
            state: "CA",
            zip: "91204",
            territory: "Los Angeles",
            emp_number: "81-1373814",
            mailing_address: "555 Riverdale Dr. Ste D",
            mailing_city: "Glendale",
            mailing_state: "CA",
            mailing_zip: "91204",
            mailing_territory: "Los Angeles",
            email: "regulatory@vapejuicedepot.com",
            resp: {
                name: "Habib Kajajian",
                title: "CEO",
                phone_number: "(424) 777-9098"
            },
        },
        delivery_services: [
            {
                name: "United States Postal Service",
                address: "3370 Glendale Blvd, Los Angeles, CA 90039",
                pone_number: "(800) 275-8777"
            }
        ]
    }

    ctx.status = 200;
    ctx.response.set("content-type", 'application/pdf');
    ctx.response.set("content-disposition", "attachment; filename=test.pdf");
    const report_html_content = GetHTML(report_data, state == "CA" || state == "MN" || state == "GA" ? "california" : "default")
    ctx.body = await GeneratePDF(report_html_content)
})


router.get(`/pdf/:from/:to/:state`, async (ctx) => {

    const { state, from, to } = ctx.params;
    const { shop, accessToken } = ctx.session;

    const url = `https://${shop}/admin/api/2021-04/orders.json?status=closed&created_at_min=${from}&created_at_max=${to}`
    const orders = await getOrders(shop, accessToken, url, state)

    const { sale_items, totals } = await GetSalesReportData(shop, accessToken, orders, state)


    const report_data = {
        state: states[state],
        sale_items,
        totals,
        period: {
            from,
            to
        },
        shop: {
            full_name: "Siroart Inc., DBA Vape Juice Depot",
            address: "555 Riverdale Dr. Ste D",
            city: "Glendale",
            state: "CA",
            zip: "91204",
            territory: "Los Angeles",
            emp_number: "81-1373814",
            mailing_address: "555 Riverdale Dr. Ste D",
            mailing_city: "Glendale",
            mailing_state: "CA",
            mailing_zip: "91204",
            mailing_territory: "Los Angeles",
            email: "regulatory@vapejuicedepot.com",
            resp: {
                name: "Habib Kajajian",
                title: "CEO",
                phone_number: "(424) 777-9098"
            },
        },
        delivery_services: [
            {
                name: "United States Postal Service",
                address: "3370 Glendale Blvd, Los Angeles, CA 90039",
                pone_number: "(800) 275-8777"
            }
        ]
    }

    ctx.status = 200;
    ctx.response.set("content-type", 'application/pdf');
    ctx.response.set("content-disposition", "attachment; filename=test.pdf");
    const report_html_content = GetHTML(report_data, state == "CA" || state == "MN" || state == "GA" ? "california" : "default")
    ctx.body = await GeneratePDF(report_html_content)
    // ctx.body = { report_data }
})

async function is_E_Liquid(product_id, shop, accessToken) {

    const product_item_request = (await fetch(`https://${shop}/admin/api/2021-04/products/${product_id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))

    if (product_item_request.status == 429) {
        sleep(2000)
        return await is_E_Liquid(line_item, shop, accessToken)
    }

    const product_data = await product_item_request.json()

    return product_data.product.tags.indexOf("PACT-eliquid") > -1
}

router.get(`/:from/:to/:state`, async (ctx) => {

    const { state, from, to } = ctx.params;
    const { shop, accessToken } = ctx.session;

    const url = `https://${shop}/admin/api/2021-04/orders.json?status=closed&created_at_min=${from}&created_at_max=${to}`
    const orders = await getOrders(shop, accessToken, url, state)

    let sale_items = []

    const totals = {
        quantity: 0,
        weight: 0,
        price: 0,
        cost: 0
    }

    for (let i = 0; i < orders.length; i++) {

        const order = orders[i]
        if (order.source_name != "web" || order.fulfillment_status != "fulfilled")
            continue;

        const shipping_address = order.shipping_address;
        const customer_name = `${shipping_address.first_name} ${shipping_address.last_name}`
        const address = `${shipping_address.address1} ${shipping_address.city} ${shipping_address.province_code} ${shipping_address.country_code}`
        const invoice_date = (new Date(order.created_at)).toLocaleDateString()
        const invoice_number = order.name

        for (let j = 0; j < order.line_items.length; j++) {
            const line_item = order.line_items[j]
            let type = 4//TODO get type

            const nicotine = getUnitValue('mg', line_item.variant_title, line_item.title)
            if (nicotine > 0) {
                type = 'WithNicotine'
            }
            else if (nicotine == 0 && line_item.name.indexOf("mg") > -1) {
                type = 'NoNicotine'
            }
            else {
                type = 'Other'
            }

            if (state == "NY") {
                const is_liquid = await is_E_Liquid(line_item.product_id, shop, accessToken)
                if (is_liquid) {
                    continue
                }
            }

            if (line_item.vendor == 'ENDS_taxer')
                continue

            const variant_data = await getVariantDetails(line_item, shop, accessToken);
            const quantity = Number(line_item.quantity)

            const sales_price = Number(line_item.pre_tax_price);

            //TODO a better solution to cost defaut
            let { cost, barcode, weight } = variant_data || { cost: "-", barcode: "None" };

            cost = isNaN(Number(cost)) ? (sales_price * 0.6) : Number(cost) * quantity
            const grams = isNaN(Number(line_item.grams)) ? 0 : Number(line_item.grams)

            const oz_from_grams = Math.round((grams / 28.35) * 100) / 100

            weight = (weight || oz_from_grams) * quantity

            const brand_family = line_item.vendor.replace(/Disposable/gi, "")

            const final_sale_price = state == "CA" || state == "MN" || state == "GA" ? (sales_price / quantity) : sales_price
            const final_cost = state == "CA" || state == "MN" || state == "GA" ? cost / quantity : cost

            const fixed_barcode = barcode ? (barcode.length > 12 ? barcode.substring(1) : barcode) : "None"
            totals.weight += isNaN(Number(weight)) ? 0 : Number(weight);
            totals.price += final_sale_price;
            totals.cost += final_cost;
            totals.quantity += quantity
            const sale_item = {
                customer_name,
                address,
                type,
                brand_family,
                invoice_date,
                invoice_number,
                quantity,
                barcode: fixed_barcode,
                weight,
                sales_price: final_sale_price,
                cost: final_cost,
                product_name: `${line_item.name}`
            }
            sale_items.push(sale_item)
        }
    }

    const report_data = {
        state: states[state],
        sale_items,
        totals,
        period: {
            from,
            to
        },
        shop: {
            full_name: "Siroart Inc., DBA Vape Juice Depot",
            address: "555 Riverdale Dr. Ste D",
            city: "Glendale",
            state: "CA",
            zip: "91204",
            territory: "Los Angeles",
            emp_number: "81-1373814",
            mailing_address: "555 Riverdale Dr. Ste D",
            mailing_city: "Glendale",
            mailing_state: "CA",
            mailing_zip: "91204",
            mailing_territory: "Los Angeles",
            email: "regulatory@vapejuicedepot.com",
            resp: {
                name: "Habib Kajajian",
                title: "CEO",
                phone_number: "(424) 777-9098"
            },
        },
        delivery_services: [
            {
                name: "United States Postal Service",
                address: "3370 Glendale Blvd, Los Angeles, CA 90039",
                pone_number: "(800) 275-8777"
            }
        ]
    }

    ctx.status = 200;
    ctx.response.set("content-type", 'application/pdf');
    ctx.response.set("content-disposition", "attachment; filename=test.pdf");
    const report_html_content = GetHTML(report_data, state == "CA" || state == "MN" || state == "GA" ? "california" : "default")
    // ctx.body = await GeneratePDF(report_html_content)
    ctx.body = { sale_items, totals }
})

async function is_E_Liquid(product_id, shop, accessToken) {

    const product_item_request = (await fetch(`https://${shop}/admin/api/2021-04/products/${product_id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))

    if (product_item_request.status == 429) {
        sleep(2000)
        return await is_E_Liquid(line_item, shop, accessToken)
    }

    const product_data = await product_item_request.json()

    return product_data.product.tags.indexOf("PACT-eliquid") > -1
}

function GetHTML(data, template_name) {

    const template = templates[template_name];
    return template.main_template(data)

}

function GeneratePDF(report_html_content) {
    return new Promise((resolve, reject) => {
        let options = { format: 'Letter', landscape: true, margin: { top: 70, right: 20, bottom: 60, left: 20 } };
        let file = { content: report_html_content };
        html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
            resolve(pdfBuffer)
        });
    })
}

async function getVariantDetailsFromDB(line_item, shop, accessToken) {

    const variant_data = await VariantDetails.findOne({ shop, shopify_variant_id: line_item.variant_id })
    if (!variant_data)
        return await getVariantDetails(line_item, shop, accessToken)

    return variant_data
}

async function getVariantDetails(line_item, shop, accessToken) {

    //TODO add shop to filter
    let variant_data = await Variant.findOne({ variant_id: line_item.variant_id })

    if (variant_data != null) {
        return variant_data;
    }

    const variant_request = await fetch(`https://${shop}/admin/api/2021-04/variants/${line_item.variant_id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    })

    if (variant_request.status == 429) {
        sleep(2000)
        return await getVariantDetails(line_item, shop, accessToken)
    }

    if (variant_request.status == 404) {
        await Variant.create({
            shop,
            product_id: line_item.product_id,
            variant_id: line_item.variant_id
        });
    }

    const variant_shopify_data = await variant_request.json()
    if (variant_shopify_data.errors) {
        console.log(variant_shopify_data.errors)
        return null
    }

    const inventory_item_request = (await fetch(`https://${shop}/admin/api/2021-04/inventory_items/${variant_shopify_data.variant.inventory_item_id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))



    if (inventory_item_request.status == 429) {
        sleep(2000)
        return await getVariantDetails(line_item, shop, accessToken)
    }

    const inventory_item_shopify_data = await inventory_item_request.json()

    if (inventory_item_shopify_data.errors) {
        console.log(inventory_item_shopify_data.errors)
        return null
    }

    variant_data = {
        shop,
        product_id: line_item.product_id,
        variant_id: line_item.variant_id,
        inventory_item_id: inventory_item_shopify_data.inventory_item.id,
        cost: inventory_item_shopify_data.inventory_item.cost,
        barcode: variant_shopify_data.variant.barcode,
        weight: variant_shopify_data.variant.weight,
        weight_unit: variant_shopify_data.variant.weight_unit,
    }

    await Variant.create(variant_data);
    return variant_data;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}



function getUnitValue(unit, variant_title, product_title, inverse = false) {

    const unit_from_variant_title = getUnitfromString(unit, variant_title, inverse)
    const unit_from_product = getUnitfromString(unit, product_title, inverse)

    return unit_from_variant_title || unit_from_product
}

function getUnitfromString(unit, text, inverse = false) {
    const regexp_string = inverse ? `(\\s*(${unit} ?)\\d+(?:.\\d+)?)` : `(\\d+(?:.\\d+)?)\\s*(${unit})`;
    const regex = new RegExp(regexp_string, 'i')
    const reg_match = text.match(regex)

    let result = Number(reg_match && reg_match[1])
    if (!inverse)
        return Number(reg_match && reg_match[1])

    //Here we have unit with number so we should extract number with one more match
    const result_with_unit = reg_match && reg_match[1]
    //Khir vi ko
    if (result_with_unit) {
        const result = result_with_unit.match(/\d+/g);
        return Number(result && result[0])
    }
    return null
}


async function GetSalesReportData(shop, accessToken, orders, state) {

    let sale_items = []

    const totals = {
        quantity: 0,
        weight: 0,
        price: 0,
        cost: 0
    }

    for (let i = 0; i < orders.length; i++) {

        const order = orders[i]
        if (order.source_name != "web" || order.fulfillment_status != "fulfilled")
            continue;

        const shipping_address = order.shipping_address;
        const customer_name = `${shipping_address.first_name} ${shipping_address.last_name}`
        const address = `${shipping_address.address1} ${shipping_address.city} ${shipping_address.province_code} ${shipping_address.country_code}`
        const invoice_date = (new Date(order.created_at)).toLocaleDateString()
        const invoice_number = order.name

        for (let j = 0; j < order.line_items.length; j++) {
            const line_item = order.line_items[j]
            let type = 4//TODO get type

            //TODO get from variant data
            const nicotine = getUnitValue('mg', line_item.variant_title, line_item.title)
            if (nicotine > 0) {
                type = 'WithNicotine'
            }
            else if (nicotine == 0 && line_item.name.indexOf("mg") > -1) {
                type = 'NoNicotine'
            }
            else {
                type = 'Other'
            }
            //TODO remove this
            if (state == "NY") {
                const is_liquid = await is_E_Liquid(line_item.product_id, shop, accessToken)
                if (is_liquid) {
                    continue
                }
            }

            if (line_item.vendor == 'ENDS_taxer')
                continue

            let variant_data = await getVariantDetailsFromDB(line_item, shop, accessToken)


            const quantity = Number(line_item.quantity)

            const sales_price = Number(line_item.pre_tax_price);

            //TODO a better solution to cost defaut
            let { cost, barcode, weight } = variant_data || { cost: "-", barcode: "None" };

            cost = isNaN(Number(cost)) ? (sales_price * 0.6) : Number(cost) * quantity
            const grams = isNaN(Number(line_item.grams)) ? 0 : Number(line_item.grams)

            const oz_from_grams = Math.round((grams / 28.35) * 100) / 100

            weight = (weight || oz_from_grams) * quantity

            const brand_family = line_item.vendor.replace(/Disposable/gi, "")

            // const weight = line_item.grams // TODO check if it is line_item weight or product item

            const final_sale_price = state == "CA" || state == "MN" || state == "GA" ? (sales_price / quantity) : sales_price
            const final_cost = state == "CA" || state == "MN" || state == "GA" ? cost / quantity : cost

            const fixed_barcode = barcode ? (barcode.length > 12 ? barcode.substring(1) : barcode) : "None"
            totals.weight += (isNaN(Number(weight)) ? 0 : Number(weight)) * quantity;
            totals.price += final_sale_price;
            totals.cost += final_cost;
            totals.quantity += quantity
            const sale_item = {
                customer_name,
                address,
                type,
                brand_family,
                invoice_date,
                invoice_number,
                quantity,
                barcode: fixed_barcode,
                weight,
                sales_price: final_sale_price,
                cost: final_cost,
                product_name: `${line_item.name}`
            }
            sale_items.push(sale_item)
        }
    }
    return { sale_items, totals }
}

const states = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AS": "American Samoa",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "DC": "District Of Columbia",
    "FM": "Federated States Of Micronesia",
    "FL": "Florida",
    "GA": "Georgia",
    "GU": "Guam",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MH": "Marshall Islands",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "MP": "Northern Mariana Islands",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PW": "Palau",
    "PA": "Pennsylvania",
    "PR": "Puerto Rico",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VI": "Virgin Islands",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming"
}

module.exports = router