const Router = require('koa-router');
const router = new Router();
const ShopDetails = require("../models/ShopDetails")
const { getShopDataAndSave } = require("../services/shopifyShop")
const { sendSyncMessage } = require("../services/rabbit")
const Message = require("../models/Message")

router.get(`/order`, async (ctx) => {
    

    ctx.status = 200;
    ctx.body = { };
})
router.get(`/product`, async (ctx) => {
    

    ctx.status = 200;
    ctx.body = { };
})


module.exports = router