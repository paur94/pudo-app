const Router = require('koa-router');
const router = new Router();
const ShopDetails = require("../models/ShopDetails")
const { getShopDataAndSave } = require("../services/shopifyShop")
const { sendSyncMessage } = require("../services/rabbit")
const Message = require("../models/Message")

router.post(`/details`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const data = ctx.request.body;

    const shop_data = await ShopDetails.findOneAndUpdate(
        { myshopify_domain: shop },
        {
            $set: { ...data }
        },
        { upsert: true }).exec();

    ctx.status = 200;
    ctx.body = { data: shop_data };
})

router.get(`/details`, async (ctx) => {
    const { shop, accessToken } = ctx.session;

    const shop_data = await ShopDetails.findOne({ myshopify_domain: shop })
    if (!shop_data) {
        ctx.status = 404;
        ctx.body = { message: `Shop ${shop} not found.` };
    }
    ctx.status = 200;
    ctx.body = { data: shop_data };
})

router.get(`/tags-set`, async (ctx) => {
    const { shop, accessToken } = ctx.session;

    const res = await ShopDetails.findOneAndUpdate(
        { myshopify_domain: shop },
        {
            $set: {
                tags_set: true
            }
        }).exec();

    ctx.status = 200;
    ctx.body = { data: res };

})

router.get(`/sync`, async (ctx) => {
    const { shop, accessToken } = ctx.session;

    const res = await getShopDataAndSave(shop, accessToken);

    ctx.status = 200;
    ctx.body = { data: res };

})

router.get(`/start-product-order-sync`, async (ctx) => {
    const { shop, accessToken } = ctx.session;

    const sync_message = await Message.findOne({ shop, channel: "shop_sync_exchange" });

    if (!sync_message)
        await sendSyncMessage(shop);

    ctx.status = 200;
    ctx.body = { data: sync_message };

})

module.exports = router