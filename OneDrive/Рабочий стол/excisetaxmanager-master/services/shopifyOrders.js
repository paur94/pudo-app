const fetch = require('node-fetch');
const https = require('https');
const { asyncForEach } = require('../utils/asyncHelper');
const { parseLinkHeader } = require('../utils/linkParser');
const { getUnitfromString } = require("../utils/unitHelper")
const Order = require("../models/Order")

const httpsAgent = new https.Agent({
    keepAlive: true
});

const getOrdersCount = async function (shop, accessToken, url = `https://${shop}/admin/api/2021-04/orders/count.json`) {
    let request = await fetch(url,
        {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            },
            agent: httpsAgent
        });

    const data = (await request.json());
    const count = data.count;

    return count;
}

const updateOrderData = async function (shop, accessToken, id, data) {
    url = `https://${shop}/admin/api/2021-04/orders/${id}.json`
    let request = await fetch(url,
        {
            method: 'PUT',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            },
            body: JSON.stringify({

                order: { ...data, id }
            }),
            agent: httpsAgent
        });
    const res = (await request.json());
    const order = data.order;
}

const getOrders = async function (shop, accessToken, page_size = 10, url = `https://${shop}/admin/api/2021-04/orders.json?limit=${page_size}`) {
    let request = await fetch(url,
        {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            },
            agent: httpsAgent
        });

    const data = (await request.json());
    const orders = data.orders;

    const link_string = request.headers.get('link')
    const links = link_string && parseLinkHeader(link_string)
    const { next, previous } = links || {}

    return { orders, pagination: { next, previous } };
}

const getOrdersAndSave = async function (shop, accessToken, url = `https://${shop}/admin/api/2021-04/orders.json?limit=50&status=any`) {
    let page_url = url;
    while (page_url) {
        page_url = await getPagedOrdersAndSave(shop, accessToken, page_url)
    }
}

const getPagedOrdersAndSave = async function (shop, accessToken, url = `https://${shop}/admin/api/2021-04/orders.json?limit=50&status=any`) {

    let request = await fetch(url,
        {
            method: 'GET',
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'content-type': 'application/json'
            },
            agent: httpsAgent
        });

    if (request.status == 429 || request.status == 502) {
        console.log(`status -- ${requset.status}, waiting 1 second`)
        await sleep(1000)
        return await getPagedOrdersAndSave(shop, accessToken, url)
    }

    const data = (await request.json());
    console.log(`syncing ${data.orders.length} orders`)

    await asyncForEach(data.orders, async (order) => {
        const is_up_to_date = await Order.exists({ shop, shopify_id: order.id, updated_at: { $eq: order.updated_at } })
        if (!is_up_to_date) {
            await Order.findOneAndUpdate({
                shop,
                shopify_id: order.id,
            }, {
                shop,
                shopify_id: order.id,
                ...order
            }, { upsert: true })
        }
    })

    const link_string = request.headers.get('link')
    const links = link_string && parseLinkHeader(link_string)
    const { next } = links || {}

    return next && next["href"]
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { getOrders, getOrdersAndSave, getOrdersCount, updateOrderData }