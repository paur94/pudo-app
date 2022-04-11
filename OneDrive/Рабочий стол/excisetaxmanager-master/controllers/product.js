const Router = require('koa-router');
const router = new Router();
const { CreateUpdateAllProductDetails, getProductsCount } = require("../services/shopifyProductsV2")
const { SyncProductVariantsDetails } = require("../services/shopifyProducts")

const ProductDetails = require("../models/ProductDetails")
const VariantDetails = require("../models/VariantDetails")
const Message = require("../models/Message")
const Order = require('../models/Order')

const { asyncForEach } = require('../utils/asyncHelper');
const amqplib = require('amqplib');

const AMQP_URL = process.env.CLOUDAMQP_URL || "amqp://localhost";

router.get(`/amqp-sync-products-data`, async (ctx) => {

    const { shop, accessToken } = ctx.session;
    const conn = await amqplib.connect(AMQP_URL, "heartbeat=60");
    const ch = await conn.createChannel()
    var exch = 'shop_sync_exchange';
    var q = 'shop_sync_queue';

    await ch.assertExchange(exch, 'direct', { durable: true }).catch(console.error);
    await ch.assertQueue(q, { durable: true });
    const message_body = JSON.stringify({ shop })

    const message = await Message.create({
        shop,
        queua: q,
        channel: exch,
        body: message_body
    });

    const res = await ch.sendToQueue(q, new Buffer(message_body), { correlationId: message._id.toString(), persistent: true });

    ctx.status = 200;
    ctx.body = { message: 'processing' };
})

router.get(`/shopify/total`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const shopify_products_count = await getProductsCount(shop, accessToken, `https://${shop}/admin/products/count.json`)
    ctx.body = { count: shopify_products_count };
})

router.get(`/sync-progress`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    try {
        const oldest_orders_date = new Date(2021, 3, 0)

        const message = await Message.findOne({ shop, channel: "shop_sync_exchange" });

        const total_variants = await VariantDetails.find({ shop }).countDocuments()
        const variants_synced = await VariantDetails.find({ shop, cost: { $exists: true } }).countDocuments()

        const products_synced = await ProductDetails.find({ shop }).countDocuments();

        const synced_orders_count = await Order.find({ shop }).countDocuments();

        ctx.status = 200;
        ctx.body = { products_synced, total_variants, variants_synced, message, synced_orders_count };

    }
    catch (e) {
        //TODO handle log
        console.log(e)
        ctx.status = 500;
        ctx.body = { error: e };
    }

})

router.get(`/missing_data_stats`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;

    const nocaegory_filter = { shop, removed: { $ne: true }, $or: [{ category_tags: { $exists: false } }, { category_tags: { $eq: [] } }] };
    const nocategory_count = await ProductDetails.find(nocaegory_filter).countDocuments()

    const pending_filter = { shop, removed: { $ne: true }, is_ends: true, approved: { $ne: true } }
    const pending_count = await ProductDetails.find(pending_filter).countDocuments()

    const approved_filter = { shop, removed: { $ne: true }, is_ends: true, approved: true }
    const approved_count = await ProductDetails.find(approved_filter).countDocuments()

    //TODO replace is_ends with category_tags
    const excluded_filter = { shop, removed: { $ne: true }, is_ends: false }
    const excluded_count = await ProductDetails.find({ shop, is_ends: false }).countDocuments()


    const nocost_filter = { shop, removed: { $ne: true }, $or: [{ cost: "" }, { cost: null }] };
    const nocost_count = await VariantDetails.find(nocost_filter).countDocuments()

    const nobarcode_filter = { shop, removed: { $ne: true }, $or: [{ barcode: { $exists: false } }, { barcode: { $eq: "" } }, { barcode: null }] };
    const nobarcode_count = await VariantDetails.find(nobarcode_filter).countDocuments()

    const lowquantity_filter = { shop, removed: { $ne: true }, shop, $expr: { $lt: ["$inventory_quantity", "$min_inventory_quantity"] } };
    const lowquantity_count = await VariantDetails.find(lowquantity_filter).countDocuments()

    const nominquantity_filter = { shop, removed: { $ne: true }, inventory_min_set: { $ne: true } };
    const nominquantity_count = await ProductDetails.find(nominquantity_filter).countDocuments()

    ctx.status = 200;
    ctx.body = {
        nocategory_count,
        pending_count,
        approved_count,
        excluded_count,
        nocost_count,
        nobarcode_count,
        nominquantity_count,
        lowquantity_count
    };
})

router.get(`/sync_and_get/:id`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { id } = ctx.params;
    const productDetails = await SyncProductVariantsDetails(shop, accessToken, id)

    const next_not_approved_product = await ProductDetails.find({ _id: { $gt: id }, removed: { $ne: true }, approved: { $ne: true }, shop }).sort({ _id: 1 }).limit(1)
    const previous_product = await ProductDetails.find({ _id: { $lt: id }, removed: { $ne: true }, shop }).sort({ _id: -1 }).limit(1)

    const next_id = next_not_approved_product[0] && next_not_approved_product[0]._id;
    const previous_id = previous_product[0] && previous_product[0]._id;


    ctx.status = 200;
    ctx.body = { data: productDetails, next_id, previous_id };

})

router.get(`/get_product/:id`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { id } = ctx.params;
    const productDetails = await ProductDetails.findOne({ shop, _id: id }).populate('variants')
    ctx.status = 200;
    ctx.body = { data: productDetails };

})

router.post(`/do_not_track/:id`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { id } = ctx.params;
    const productDetails = await ProductDetails.findOne({ shop, _id: id })
    productDetails.track_min_quantity = true;
    await productDetails.save();
    ctx.status = 200;
    ctx.body = { data: productDetails };
})

router.post(`/approve/:id`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { id } = ctx.params;
    const data = ctx.request.body;
    const productDetails = await ProductDetails.findOne({ shop, _id: id }).populate('variants')

    await asyncForEach(productDetails.variants, async (variant) => {

        const variant_calculations = data.variants.find(v => v._id == variant._id)

        variant.capacity = variant_calculations.capacity;
        variant.contains_nicotine = variant_calculations.contains_nicotine;
        variant.items_count = variant_calculations.items_count;
        await variant.save();
    })

    productDetails.approved = true;
    productDetails.save();

    ctx.status = 200;
    ctx.body = { data: productDetails };
})



router.post(`/setMinInventoryQuantity/:id`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { id } = ctx.params;
    const data = ctx.request.body;
    const productDetails = await ProductDetails.findOne({ shop, _id: id }).populate('variants')

    await asyncForEach(productDetails.variants, async (variant) => {
        const variant_data = data.variants.find(v => v._id == variant._id)
        variant.min_inventory_quantity = variant_data.min_inventory_quantity;
        await variant.save();
    })
    if (!data.variants.some(v => !v.min_inventory_quantity)) {
        productDetails.inventory_min_set = true
        await productDetails.save();
    }
    ctx.status = 200;
    ctx.body = { data: productDetails };
})

router.get(`/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await ProductDetails.find({ shop, removed: { $ne: true } }).countDocuments()
    const products = await ProductDetails.find({ shop, removed: { $ne: true } }).skip(page * page_size).limit(page_size * 1).sort({ [`${sort || 'state.name'}`]: -1 }).populate('variants');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})

router.get(`/all/count`, async (ctx) => {
    const { shop } = ctx.session;
    const count = await ProductDetails.find({ shop, removed: { $ne: true } }).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/pending/count`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: true, approved: { $ne: true } }).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/pending/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: true, approved: { $ne: true } }).countDocuments()
    const products = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: true, approved: { $ne: true } }).skip(page * page_size).limit(page_size * 1).sort({ [`${sort || 'state.name'}`]: -1 }).populate('variants');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})


router.get(`/nominquantity_product_types`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size, term } = ctx.params;

    const productTypes = await ProductDetails.aggregate([
        {
            $match: {
                'shop':shop,
                'track_min_quantity':{ $ne: true }, 
                'removed': { $ne: true },
                'inventory_min_set': { $ne: true }
            }
        },
        { $group: { _id: '$product_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])

    ctx.status = 200;
    ctx.body = { data: productTypes };
})

router.get(`/nominquantity/count`, async (ctx) => {
    const { shop } = ctx.session;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, 'inventory_min_set': { $ne: true }, 'track_min_quantity':{ $ne: true } }).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/nominquantity/:page/:page_size/:sort/:product_type*/:term?`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size, term, product_type } = ctx.params;
    const filter = term ? { title: { "$regex": term, "$options": "i" }, shop, product_type, removed: { $ne: true }, 'inventory_min_set': { $ne: true }, 'track_min_quantity':{ $ne: true } }
        : { shop, product_type : product_type || '', removed: { $ne: true }, 'inventory_min_set': { $ne: true }, 'track_min_quantity':{ $ne: true } }

    const count = await ProductDetails.find(filter).countDocuments()
    const products = await ProductDetails.find(filter).skip(page * page_size).limit(page_size * 1).sort({ [`${sort || 'state.name'}`]: -1 }).populate('variants');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})

router.get(`/approved/count`, async (ctx) => {
    const { shop } = ctx.session;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: true, approved: true }).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/approved/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: true, approved: true }).countDocuments()
    const products = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: true, approved: true }).skip(page * page_size).limit(page_size * 1).sort({ [`${sort || 'state.name'}`]: -1 }).populate('variants');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})

router.get(`/excluded/count`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: false }).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/excluded/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: false }).countDocuments()
    const products = await ProductDetails.find({ shop, removed: { $ne: true }, is_ends: false }).skip(page * page_size).limit(page_size * 1).sort({ [`${sort || 'state.name'}`]: -1 }).populate('variants');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})


router.get(`/no_category_tag/count`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, removed: { $ne: true }, $or: [{ category_tags: { $exists: false } }, { category_tags: { $eq: [] } }] };

    const count = await ProductDetails.find(filter).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/no_category_tag/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, removed: { $ne: true }, $or: [{ category_tags: { $exists: false } }, { category_tags: { $eq: [] } }] };

    const count = await ProductDetails.find(filter).countDocuments()
    const products = await ProductDetails.find(filter).skip(page * page_size).limit(page_size * 1).sort("product").populate('product');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})

module.exports = router