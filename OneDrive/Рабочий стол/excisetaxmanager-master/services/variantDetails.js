const fetch = require('node-fetch');
const https = require('https');
const { asyncForEach, sleep } = require('../utils/asyncHelper');
const { parseLinkHeader } = require('../utils/linkParser');
const { getUnitfromString } = require("../utils/unitHelper")
const { getInventoryItemData } = require("../services/shopifyInventoryItem")
const VariantDetails = require('../models/VariantDetails')
const Order = require('../models/Order')

const httpsAgent = new https.Agent({
    keepAlive: true
});

async function syncAllCosts(shop, accessToken) {
    const variants = await VariantDetails.find({ shop, cost: { $exists: false } })
    const variants_array_chunked = splitArrayToChunks(variants, 20);
    await asyncForEach(variants_array_chunked, async (chunk) => {
        syncVariantsCosts(shop, accessToken, chunk)
    })
}

async function GetDeletedVariantsFromOrders(shop){
    const orders = await Order.find({ shop })
    //TODO implement
}

async function syncVariantsCosts(shop, accessToken, variants) {

    const inventory_items_ids = variants.map(variant => variant.shopify_inventory_item_id);
    const inventory_items = await getInventoryItemData(shop, accessToken, inventory_items_ids);
    
    inventory_items.forEach((inventory_item) => {
        const variant = variants.find(variant => variant.shopify_inventory_item_id == inventory_item.id)
        variant.cost = inventory_item && inventory_item.cost
        variant.save()
    })

}

function splitArrayToChunks(array, chunk_size) {

    let i, j, result = [];
    for (i = 0, j = array.length; i < j; i += chunk_size) {
        result.push(array.slice(i, i + chunk_size));
    }
    return result

}

module.exports = { syncAllCosts, syncVariantsCosts }