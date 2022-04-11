const fetch = require('node-fetch');
const https = require('https');
const { asyncForEach, sleep } = require('../utils/asyncHelper');
const { parseLinkHeader } = require('../utils/linkParser');
const { getUnitfromString } = require("../utils/unitHelper")

const httpsAgent = new https.Agent({
    keepAlive: true
});

async function getInventoryItemData(shop, accessToken, ids) {

    const inventory_item_request = (await fetch(`https://${shop}/admin/api/2021-04/inventory_items.json?ids=${ids.join(',')}`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))

    if (inventory_item_request.status == 429 || inventory_item_request.status == 502) {
        await sleep(1000)
        return await getInventoryItemData(shop, accessToken, ids)
    }

    const inventory_item_shopify_data = await inventory_item_request.json()
    return inventory_item_shopify_data.inventory_items;
}

module.exports = { getInventoryItemData }