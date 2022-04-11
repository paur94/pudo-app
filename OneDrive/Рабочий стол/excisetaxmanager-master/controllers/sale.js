const Router = require('koa-router');
const router = new Router();
const { getOrders, getOrdersAndSave } = require("../services/shopifyOrders")
const { GetSalesReportData, GetOrdersShippingData, GetSalesDataForMargins } = require("../services/sales")
const Order = require("../models/Order")
const ShopDetails = require("../models/ShopDetails")
const { getTimezoneDiffernence } = require("../utils/dateHelper")

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

router.get(`/margins/state-by-month/:month/:year`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const now = new Date()
    const { month, state, year } = ctx.params;

    const shopDetails = await ShopDetails.findOne({ myshopify_domain: shop })
    const timezone_difference = getTimezoneDiffernence(shopDetails['iana_timezone'])
    console.log(`timezone_difference ${timezone_difference}`)
    //TODO Jan, Dec
    const month_index = months.indexOf(month)
    const from = new Date(new Date(year, month_index, 1).setMinutes(timezone_difference)).toISOString()
    const to = new Date(new Date(year, month_index + 1, 1).setMinutes(timezone_difference)).toISOString()

    const count = await Order.find({
        shop,
        processed_at: {
            $gte: from,
            $lt: to
        }
    }).countDocuments();

    const orders = await Order.find({
        shop,
        processed_at: {
            $gte: from,
            $lt: to
        }
    });

    const sales_report_data = await GetSalesDataForMargins(shop, orders, shopDetails['iana_timezone']);

    ctx.status = 200;
    ctx.body = { data: sales_report_data, count: count };
})


router.get(`/state-by-month/:state/:month/:year`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const now = new Date()
    const { month, state, year } = ctx.params;

    const shopDetails = await ShopDetails.findOne({ myshopify_domain: shop })
    const timezone_difference = getTimezoneDiffernence(shopDetails['iana_timezone'])
    console.log(`timezone_difference ${timezone_difference}`)
    //TODO Jan, Dec
    const month_index = months.indexOf(month)
    const from = new Date(new Date(year, month_index, 1).setMinutes(timezone_difference)).toISOString()
    const to = new Date(new Date(year, month_index + 1, 1).setMinutes(timezone_difference)).toISOString()

    const count = await Order.find({
        shop,
        "shipping_address.province_code": state,
        processed_at: {
            $gte: from,
            $lt: to
        }
    }).countDocuments();

    const orders = await Order.find({
        shop,
        "shipping_address.province_code": state,
        processed_at: {
            $gte: from,
            $lt: to
        }
    });

    const sales_report_data = await GetSalesReportData(shop, accessToken, orders, shopDetails['iana_timezone']);

    ctx.status = 200;
    ctx.body = { data: sales_report_data, count: count };
})


router.get(`/order_shipping_data/:month`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const now = new Date()
    const { month, state } = ctx.params;

    const shopDetails = await ShopDetails.findOne({ myshopify_domain: shop })
    const timezone_difference = getTimezoneDiffernence(shopDetails['iana_timezone'])

    //TODO Jan, Dec
    const month_index = months.indexOf(month)
    const from = new Date(new Date(2021, month_index, 1).setMinutes(timezone_difference)).toISOString()
    const to = new Date(new Date(2021, month_index + 1, 1).setMinutes(timezone_difference)).toISOString()

    const count = await Order.find({
        shop,
        processed_at: {
            $gte: from,
            $lt: to
        }
    }).countDocuments();



    const orders = await Order.find({
        shop,
        processed_at: {
            $gte: from,
            $lt: to
        }
    });

    const shipping_data = await GetOrdersShippingData(shop, accessToken, orders, shopDetails['iana_timezone']);

    ctx.status = 200;
    ctx.body = shipping_data;
})

router.get(`/:page/:page_size/:sort`, async (ctx) => {
    const { shop, accessToken } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const count = await Order.find({ shop, shipping_address: { $exists: true } }).countDocuments();
    const orders = await Order.find({ shop, shipping_address: { $exists: true } }).sort('order_number').skip(page * page_size).limit(page_size * 1).populate('variants');
    const sales_report_data = await GetSalesReportData(shop, accessToken, orders);
    console.log(orders.map(o => o.order_number).join(','))
    ctx.status = 200;
    ctx.body = { data: sales_report_data, count: count };
})


// router.get(`/last_month`, async (ctx) => {
//     const { shop, accessToken } = ctx.session;

//     const now = new Date()
//     const from = new Date(now.getFullYear(), now.getMonth() - 1, 0).toISOString()
//     const to = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

//     const count = await Order.find({
//         shop,
//         // processed_at: {
//         //     $gte: from,
//         //     $lt: to
//         // }
//     }).countDocuments();

//     const orders = await Order.find({
//         shop,
//         // processed_at: {
//         //     $gte: from,
//         //     $lt: to
//         // }
//     }).populate('variants');

//     const sales_report_data = await GetSalesData(shop, accessToken, orders);

//     ctx.status = 200;
//     ctx.body = { data: sales_report_data, count: count };
// })

// router.get(`/last_month/:state`, async (ctx) => {
//     const { shop, accessToken } = ctx.session;
//     const now = new Date()
//     const from = new Date(now.getFullYear(), now.getMonth() - 1, 0).toISOString()
//     const to = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

//     const count = await Order.find({
//         shop,
//         processed_at: {
//             $gte: from,
//             $lt: to
//         }
//     }).countDocuments();

//     const orders = await Order.find({
//         shop,
//         processed_at: {
//             $gte: from,
//             $lt: to
//         }
//     }).populate('variants');

//     const sales_report_data = await GetSalesData(shop, accessToken, orders);

//     ctx.status = 200;
//     ctx.body = { data: sales_report_data, count: count };
// })

module.exports = router
