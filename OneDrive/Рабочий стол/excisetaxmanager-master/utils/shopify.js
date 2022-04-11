const fetch = require('node-fetch');
const https = require('https');
const crypto = require("crypto")
const httpsAgent = new https.Agent({
    keepAlive: true
});
const { parseLinkHeader } = require('./linkParser')


const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, MONGO_CONNECTION, NODE_ENV } = process.env;

const verifyShopifyRequest = (ctx, next) => {
    const { headers, request } = ctx;
    const { "x-shopify-hmac-sha256": hmac } = headers;
    const { rawBody } = request;

    const generatedHash = crypto
        .createHmac('sha256', SHOPIFY_API_SECRET)
        .update(rawBody)
        .digest('base64')

    if (hmac === generatedHash)
        return next()

    ctx.status = 400
    ctx.body = "HMAC validation failed"
    return
};



const getOrders = async (shop, accessToken, url, state_code) => {
    const request = await fetch(url,
        {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            },
            agent: httpsAgent
        });
    if (request.errors) {
        console.log(request.errors)
        throw request.errors
    }

    const shop_orders = (await request.json())
    const link_string = request.headers.get('link')
    const links = link_string && parseLinkHeader(link_string)
    const { next } = links || {}
    if (next && next["href"]) {
        const next_items = await getOrders(shop, accessToken, next["href"], state_code)
        const filtered_orders = state_code ? filter_orders_by_state(shop_orders.orders, state_code) : shop_orders.orders
        const result = [...filtered_orders, ...next_items]
        return result
    }
    else {
        const filtered_orders = state_code ? filter_orders_by_state(shop_orders.orders, state_code) : shop_orders.orders
        return filtered_orders
    }
}

const filter_orders_by_state = (orders, state_code) => {
    return orders.filter(order => order["shipping_address"] && order["shipping_address"]["country_code"] === "US" && order["shipping_address"]["province_code"] === state_code)
}

const SCOPES = ['read_themes',  'write_products', 'write_inventory', 'write_orders', 'write_checkouts', 'read_product_listings', 'unauthenticated_read_product_listings']

// const SCOPES = ['read_themes', 'read_draft_orders', 'write_draft_orders', 'write_products', 'write_inventory', 'write_orders', 'write_checkouts', 'read_product_listings', 'unauthenticated_read_product_listings']

module.exports = { getOrders, verifyShopifyRequest, SCOPES }