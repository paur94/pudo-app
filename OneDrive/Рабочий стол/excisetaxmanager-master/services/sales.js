const Variant = require('../models/Variant')
const VariantDetails = require('../models/VariantDetails')
const { SyncProductAndVariants } = require('../services/shopifyProducts')
const { convertTZ } = require("../utils/dateHelper")

const fetch = require('node-fetch');
const https = require('https');

const httpsAgent = new https.Agent({
    keepAlive: true
});

const { SHIPSTATION_AUTH_TOKEN_A, SHIPSTATION_AUTH_TOKEN_B } = process.env;


async function GetSalesDataForMargins(shop, orders, timeZone) {

    let sales_data = []

    const totals = {
        quantity: 0,
        weight: 0,
        price: 0,
        cost: 0
    }

    const all_variants = await VariantDetails.find({ shop })

    const all_variants_dict = all_variants.reduce((acc, curr) => (acc[curr.shopify_variant_id] = curr, acc), {});

    const sortedOrders = orders.filter(o=>o.fulfillments?.length>0).sort((oa, ob) => oa.fulfillments.sort((fa, fb) => fa.created_at - fb.created_at)[0]?.created_at - ob.fulfillments.sort((fa, fb) => fa.created_at - fb.created_at)[0]?.created_at)

    const minFulfillmentDate = sortedOrders[0].fulfillments.sort((fa, fb) => fa.created_at - fb.created_at)[0].created_at
    const maxFulfillmentDate = sortedOrders[sortedOrders.length - 1].fulfillments.sort((fa, fb) => fa?.created_at - fb?.created_at)?.[0]?.created_at

    const shipmentsArray_A = await GetShipmentsFromShipstation(minFulfillmentDate, maxFulfillmentDate, SHIPSTATION_AUTH_TOKEN_A)
    const shipmentsArray_B = await GetShipmentsFromShipstation(minFulfillmentDate, maxFulfillmentDate, SHIPSTATION_AUTH_TOKEN_B)

    const shipments = [...shipmentsArray_A, ...shipmentsArray_B].reduce((acc, curr) => (acc[curr.orderNumber] = curr, acc), {});

    for (let i = 0; i < orders.length; i++) {

        const order = orders[i]
        if (order.source_name != "web" || order.fulfillment_status != "fulfilled")
            continue;

        const invoice_date = convertTZ((new Date(order.created_at)), timeZone).toLocaleDateString()
        const invoice_number = order.name
        let order_cost = 0;

        let order_subtotal = order.current_subtotal_price;
        let order_total_cost = 0;
        let excise_tax = 0;
        const total_refunded_amount = order.refunds?.reduce((acc, refund) => {
            return refund.transactions?.reduce((acc, transaction) => Number((transaction.kind === "refund" && transaction.status === "success" && transaction.amount) || 0) + acc, 0) + acc
        }, 0)
        let cost_error = false;
        for (let j = 0; j < order.line_items.length; j++) {
            const line_item = order.line_items[j]
            const quantity = Number(line_item.quantity)

            //TODO better approach
            let refunded_quantity = 0
            order.refunds.forEach(refund => {
                refund.refund_line_items.forEach(refund_line => {
                    if (refund_line.line_item_id == line_item.id) {
                        refunded_quantity += refund_line.quantity
                    }
                })
            })

            const final_quantity = (quantity - refunded_quantity);
            if (final_quantity === 0)
                continue;

            if (line_item.vendor == 'ENDS_taxer') {
                const line_discount = line_item.total_discount;
                const line_sale_price = line_item.price * final_quantity - line_discount;
                excise_tax += line_sale_price
            }
            else {
                if (!line_item.variant_id){
                    cost_error = true
                    continue
                }
                    

                const variant_details = all_variants_dict[line_item.variant_id];
                if (!variant_details || !variant_details.cost){
                    cost_error = true
                    continue
                }
                    
                const line_total_cost = variant_details.cost * final_quantity;
                order_total_cost += line_total_cost;
            }
        }
        const shipment = shipments[order.order_number]
        if (!shipment)
            console.log(order.order_number)


        sales_data.push({
            number: order.name,
            date: invoice_date,
            current_total_price: order.current_total_price,
            total_cost: order_total_cost,
            shipmentCost: shipment?.shipmentCost,
            cost_error,
            country: order.shipping_address.country_code,
            state: order.shipping_address.province,
            total_price: order.total_price,
            excise_tax,
            total_refunded_amount: total_refunded_amount,
            margin: order.total_price - order_total_cost - excise_tax - (shipment?.shipmentCost || 0) - total_refunded_amount
        })

    }
    return { sales_data: sales_data, totals }
}



async function GetOrdersShippingData(shop, accessToken, orders, timeZone) {

    const result = []

    for (let i = 0; i < orders.length; i++) {

        const order = orders[i]

        const real_created_date = new Date(order.created_at)
        const converted_creation_date = new Date(real_created_date.setMonth(8))
        const invoice_date = convertTZ(converted_creation_date, timeZone).toLocaleDateString()
        const { zip, country } = order.shipping_address;
        const invoice_number = order.name
        const { total_weight } = order;
        result.push({
            invoice_number,
            invoice_date,
            zip,
            country,
            total_weight
        })
    }
    return { result }
}

const GetShipmentsFromShipstation = async function (createDateStart, createDateEnd, token, url = `https://ssapi.shipstation.com/shipments?pageSize=500`, page = 1) {

    let request = await fetch(`${url}&createDateStart=${createDateStart.toISOString().substr(0, 10)}&createDateEnd=${createDateEnd.toISOString().substr(0, 10)}&page=${page}`,
        {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${token}`,
                'content-type': 'application/json'
            },
            agent: httpsAgent
        })

    if (request.status == 429 || request.status == 502) {
        console.log(`failed status -- ${request.status}, req -- ${request} trying again ${url}`)
        await sleep(1000)
        return await GetShipmentsFromShipstation(createDateStart, createDateEnd, token, url, page)
    }

    const data = (await request.json())

    const { shipments, pages } = data;
    if (pages == page)
        return shipments

    return [...shipments, ...(await GetShipmentsFromShipstation(createDateStart, createDateEnd, token, url, ++page))]
}


async function GetSalesReportData(shop, accessToken, orders, timeZone) {

    let sale_items = []

    const totals = {
        quantity: 0,
        weight: 0,
        price: 0,
        cost: 0
    }

    for (let i = 0; i < orders.length; i++) {

        const order = orders[i]
        if ((!(order.source_name === "web" || order.source_name === 'shopify_draft_order')) || order.fulfillment_status != "fulfilled")
            continue;

        const shipping_address = order.shipping_address;
        const customer_name = `${shipping_address.first_name || ''} ${shipping_address.last_name || ''}`
        const address = `${shipping_address.address1 || ''} ${shipping_address.city || ''} ${shipping_address.province_code || ''} ${shipping_address.country_code || ''}`
        const invoice_date = convertTZ((new Date(order.created_at)), timeZone).toLocaleDateString()
        const invoice_number = order.name

        for (let j = 0; j < order.line_items.length; j++) {
            const line_item = order.line_items[j]

            let refunded_quantity = 0
            order.refunds.forEach(refund => {
                refund.refund_line_items.forEach(refund_line => {
                    if (refund_line.line_item_id == line_item.id) {
                        refunded_quantity += refund_line.quantity
                    }
                })
            })

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

            if (line_item.vendor == 'ENDS_taxer')
                continue

            let variant_data = await VariantDetails.findOne({ shop, shopify_variant_id: line_item.variant_id })

            //TODO a better solution to cost defaut
            let { cost, barcode, weight, contains_nicotine, capacity, items_count } = variant_data || { cost: "-", barcode: "None" };

            const quantity = Number(line_item.quantity)

            const packs_count = items_count || 1
            const final_quantity = (quantity - refunded_quantity);

            if (final_quantity === 0)
                continue;




            const grams = isNaN(Number(line_item.grams)) ? 0 : Number(line_item.grams)

            const oz_from_grams = Math.round((grams / 28.35) * 100) / 100

            weight = (weight || oz_from_grams)

            const brand_family = line_item.vendor.replace(/Disposable/gi, "")

            const line_discount = line_item.discount_allocations && line_item.discount_allocations.reduce((accumulator, a) => accumulator + a.amount, 0) || 0
            const line_sale_price = ((line_item.price * final_quantity) - line_discount) / final_quantity;

            cost = isNaN(Number(cost)) ? (line_sale_price * 0.6) : Number(cost)

            const fixed_barcode = barcode ? (barcode.length > 12 ? barcode.substring(1) : barcode) : "None"
            totals.weight += (isNaN(Number(weight)) ? 0 : Number(weight)) * final_quantity;
            totals.price += line_sale_price * final_quantity;
            totals.cost += cost * final_quantity;
            totals.quantity += final_quantity
            const sale_item = {
                customer_name,
                address,
                address1: shipping_address?.address1,
                city: shipping_address?.city,
                province_code: shipping_address?.province_code,
                zip: shipping_address?.zip,
                contains_nicotine,
                type,
                brand_family,
                invoice_date,
                invoice_number,
                quantity: final_quantity,
                packs_count,
                barcode: fixed_barcode,
                item_weight: weight,
                item_retail_price: line_sale_price,
                item_cost: cost,
                item_capacity: capacity,
                total_capacity: capacity * quantity * packs_count,
                product_name: `${line_item.name}`,
                // product_type: line_item.
            }
            sale_items.push(sale_item)
        }
    }
    return { sale_items, totals }
}

function getUnitValue(unit, variant_title, product_title, inverse = false) {

    const unit_from_variant_title = getUnitfromString(unit, variant_title, inverse)
    const unit_from_product = getUnitfromString(unit, product_title, inverse)

    return unit_from_variant_title || unit_from_product
}

function getUnitfromString(unit, text, inverse = false) {

    if (!text) return null

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

module.exports = { GetSalesReportData, GetSalesDataForMargins, GetOrdersShippingData }