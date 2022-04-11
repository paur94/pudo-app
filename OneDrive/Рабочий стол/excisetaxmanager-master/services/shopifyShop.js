const fetch = require('node-fetch');
const https = require('https');
const { asyncForEach, sleep } = require('../utils/asyncHelper');
const { parseLinkHeader } = require('../utils/linkParser');
const { getUnitfromString } = require("../utils/unitHelper")
const ShopDetails = require("../models/ShopDetails")

const httpsAgent = new https.Agent({
    keepAlive: true
});

async function getShopDataAndSave(shop, accessToken) {

    const shop_request = (await fetch(`https://${shop}/admin/api/2021-10/shop.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))

    if (shop_request.status == 429 || shop_request.status == 502) {
        await sleep(1000)
        return await getInventoryItemData(shop, accessToken, ids)
    }

    const shop_data = await shop_request.json()

    await ShopDetails.findOneAndUpdate(
        { myshopify_domain: shop },
        {
            $set: {
                shop_id: shop_data.shop.id,
                full_name: shop_data.shop.name,
                full_address: `${shop_data.shop.address1 || ''} ${shop_data.shop.address2 || ''}`,
                ...shop_data.shop,
                resp_party_name: shop_data.shop.shop_owner
            }
        },
        { upsert: true }).exec();

}

module.exports = { getShopDataAndSave }