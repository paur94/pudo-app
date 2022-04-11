const fetch = require('node-fetch');
const https = require('https');
const { asyncForEach } = require('../utils/asyncHelper');
const { parseLinkHeader } = require('../utils/linkParser');
const { getUnitfromString } = require("../utils/unitHelper")
const { hasSubString } = require("../utils/stringHelper")
const { CATEGORY_TAGS } = require("../utils/taxRates")

const { syncVariantsCosts } = require("./variantDetails")

const httpsAgent = new https.Agent({
    keepAlive: true
});

const ProductDetails = require('../models/ProductDetails')
const VariantDetails = require('../models/VariantDetails')

const getProductsCount = async function (shop, accessToken, url = `https://${shop}/admin/api/2021-04/products/count.json`) {
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

const CreateUpdateAllProductDetails = async function (shop, accessToken, url = `https://${shop}/admin/products.json?limit=250`, products_synced = 0, variants_synced = 0) {
    let page_url = url;
    while (page_url) {
        page_url = await CreatePageProductDetails(shop, accessToken, page_url)
    }
}


const CreatePageProductDetails = async function (shop, accessToken, url = `https://${shop}/admin/products.json?limit=250`, products_synced = 0, variants_synced = 0) {
    console.log(`syncing ${shop}`)
    console.log(`url ${url}`)
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
        console.log(`failed status -- ${request.status}, req -- ${request} trying again ${url}`)
        await sleep(1000)
        return await CreatePageProductDetails(shop, accessToken, url, products_synced, variants_synced)
    }

    const data = (await request.json())
    const all_variants = [];

    const { products } = data;
    console.log(`syncing ${products.length}`)

    try {
        await asyncForEach(products, async (shopify_product_data) => {
            await CreateUpdateProduct(shop, accessToken, shopify_product_data, true)
        })
    }
    catch (e) {
        console.log(e)
    }

    const link_string = request.headers.get('link')
    const links = link_string && parseLinkHeader(link_string)
    const { next } = links || {}

    return next && next["href"]
}

async function CreateUpdateProduct(shop, accessToken, shopify_product_data, force_update) {
    const shopify_variants = shopify_product_data.variants

    if(!force_update){
        const is_up_to_date = await ProductDetails.exists({ shop, shopify_product_id: shopify_product_data.id, updated_at: { $gte: shopify_product_data.updated_at } })
        if (is_up_to_date)
            return
    }

    const { tags } = shopify_product_data;
    const is_ends = !hasSubString(tags, "PACT-exclude")

    const category_tags = CATEGORY_TAGS.filter(ct=>hasSubString(tags, ct))
    const product_db = await ProductDetails.findOneAndUpdate({ shop, shopify_product_id: shopify_product_data.id }, {
        shop,
        shopify_product_id: shopify_product_data.id,
        title: shopify_product_data.title,
        tags,
        is_ends,
        category_tags,
        vendor: shopify_product_data.vendor,
        images: shopify_product_data.images,
        product_type: shopify_product_data.product_type,
        updated_at: shopify_product_data.updated_at,
        created_at: shopify_product_data.created_at,
        status: shopify_product_data.status,
        published_scope: shopify_product_data.published_scope,
    }, { upsert: true, new: true })

    const currentVariantDetailsList = []
    await asyncForEach(shopify_variants, async (shopify_variant_data) => {
        const res = await ParseAndSaveVariantDetails(shop, accessToken, shopify_variant_data, shopify_product_data, product_db.approved)
        currentVariantDetailsList.push(res)
    })

    await syncVariantsCosts(shop, accessToken, currentVariantDetailsList)
    const allVariantDetailsOfProduct = await VariantDetails.find({ shop, shopify_product_id: shopify_product_data.id })
    const variantDetalsToDelete = allVariantDetailsOfProduct.filter(v => !currentVariantDetailsList.some(cv => cv.shopify_variant_id === v.shopify_variant_id))

    // TODO async
    variantDetalsToDelete.forEach((v) => {
        VariantDetails.deleteOne({ _id: v._id })
    })
}

function parseVariantMetadata(shopify_variant_data, product_data) {
    const mil_default_value = product_data.tags.indexOf('PACT-disposable') > -1 ? 1.4 : 60;
    const capacity = getUnitfromString('ml', shopify_variant_data.title) || getUnitfromString('ml', product_data.title);
    const strength = getUnitfromString('mg', shopify_variant_data.title) || getUnitfromString('mg', product_data.title);
    const bundle = getUnitfromString('x', shopify_variant_data.title) || getUnitfromString('x', product_data.title) || 1;
    const packs_count = getUnitfromString('pack of', shopify_variant_data.title) || getUnitfromString('pack of', product_data.title) || 1;
    const items_count = packs_count * bundle;
    const contains_nicotine = strength > 0;

    return {
        capacity: capacity,
        contains_nicotine: contains_nicotine,
        items_count: items_count,
    }
}

async function ParseAndSaveVariantDetails(shop, accessToken, shopify_variant_data, product_data, approved) {

    const image = product_data.images.find(img => img.variant_ids.some(id => id === shopify_variant_data.id))
    const image_src = image && image.src;

    const product_from_db = await ProductDetails.findOne({ shop, shopify_product_id: product_data.id })

    const parsed_data = {
        shop,
        product: product_from_db,
        shopify_inventory_item_id: shopify_variant_data.inventory_item_id,
        shopify_product_id: product_data.id,
        title: shopify_variant_data.title,
        shopify_variant_id: shopify_variant_data.id,
        variant_price: Number(shopify_variant_data.price),
        weight: shopify_variant_data.weight,
        weight_unit: shopify_variant_data.weight_unit,
        barcode: shopify_variant_data.barcode,
        last_update: shopify_variant_data.updated_at,
        inventory_quantity: shopify_variant_data.inventory_quantity,
        image_src,
    }

    if (!approved) {
        const { capacity, contains_nicotine, items_count } = parseVariantMetadata(shopify_variant_data, product_data)
        parsed_data.capacity = capacity;
        parsed_data.contains_nicotine = contains_nicotine;
        parsed_data.items_count = items_count;
    }

    const variant_details = await VariantDetails.findOneAndUpdate({ shop, shopify_variant_id: shopify_variant_data.id }, parsed_data, { upsert: true, new: true });

    const product_conditions = {
        shop,
        shopify_product_id: product_data.id,
        'variants._id': { $ne: variant_details._id }
    }

    const product_update = {
        $addToSet: { variants: variant_details._id }
    }

    const data = await ProductDetails.findOneAndUpdate(product_conditions, product_update, { upsert: true, new: true });

    return variant_details;
}

async function getInventoryItemData(shop, accessToken, id) {

    const inventory_item_request = (await fetch(`https://${shop}/admin/api/2021-04/inventory_items/${id}.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))

    if (inventory_item_request.status == 429 || inventory_item_request.status == 502) {
        await sleep(1000)
        return await getInventoryItemData(shop, accessToken, id)
    }

    const inventory_item_shopify_data = await inventory_item_request.json()
    return inventory_item_shopify_data.inventory_item;
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { CreateUpdateAllProductDetails, CreateUpdateProduct, getProductsCount }