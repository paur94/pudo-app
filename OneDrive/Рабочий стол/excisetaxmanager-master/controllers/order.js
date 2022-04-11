const Router = require('koa-router');
const router = new Router();
const { getOrders } = require("../services/shopifyOrders")
const { asyncForEach } = require('../utils/asyncHelper')
const { getOrdersCount } = require('../services/shopifyOrders')
const Order = require("../models/Order")
const Message = require('../models/Message')

const PAGE_SIZE = 500;

router.get(`/fix_variants`, async (ctx) => {

    await fixVariants()

    ctx.status = 200;
    ctx.body = { page: page, pages: Math.ceil(count / PAGE_SIZE) };

})


async function fixVariants(page = 0) {

    const count = await Order.find({}).countDocuments();
    const orders = await Order.find({}).sort('order_number').skip(page * PAGE_SIZE).limit(PAGE_SIZE);

    await asyncForEach(orders, async (o) => {
        o.variant_ids = [...o.line_items.map(l => l.variant_id)]
        await o.save();
    })

    const totalPages = Math.ceil(count / PAGE_SIZE)

    if (page <= totalPages)
        return fixVariants(++page)

}


router.get(`/sync-progress`, async (ctx) => {
    const oldest_orders_date = new Date(2021, 0, 0)

    const message = await Message.findOne({ shop, channel: "shop_sync_exchange" });
    const synced_count = await Order.find({ shop }).countDocuments();

    ctx.status = 200;
    ctx.body = { synced_count, message };

})

router.get(`/shopify/total`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    //TODO global const or config
    const oldest_orders_date = new Date(2021, 0, 0)

    const shopify_orders_count = await getOrdersCount(shop, accessToken, `https://${shop}/admin/orders/count.json?status=closed&created_at_min=${oldest_orders_date.toISOString()}`)
    ctx.body = { count: shopify_orders_count };
})
module.exports = router