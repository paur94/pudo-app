const Router = require('koa-router');
const router = new Router();

const { verifyShopifyRequest } = require("../utils/shopify")

//TODO set verifyShopifyRequest from root, server.js
router.post(`/status`, verifyShopifyRequest, async (ctx) => {
    ctx.status = 200;
    ctx.body = {};
    console.log(`**************received customers/data_request`)
})

router.get(`/status`, verifyShopifyRequest, async (ctx) => {
    ctx.status = 200;
    ctx.body = {};
    console.log(`**************received customers/data_request`)
})

module.exports = router


