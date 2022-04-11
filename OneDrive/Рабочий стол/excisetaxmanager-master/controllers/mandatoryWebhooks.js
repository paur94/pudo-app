const Router = require('koa-router');
const router = new Router();

const { verifyShopifyRequest } = require("../utils/shopify")

//TODO set verifyShopifyRequest from root, server.js
router.post(`/customers/data_request`, verifyShopifyRequest, async (ctx) => {
    ctx.status = 200;
    ctx.body = {};
    console.log(`**************received customers/data_request`)
})

router.post(`/customers/redact`, verifyShopifyRequest, async (ctx) => {
    ctx.status = 200;
    ctx.body = {};
    console.log(`**************received customers/redact`)
})

router.post(`/shop/redact`, verifyShopifyRequest, async (ctx) => {
    ctx.status = 200;
    ctx.body = {};
    console.log(`**************received shop/redact`)
})

module.exports = router