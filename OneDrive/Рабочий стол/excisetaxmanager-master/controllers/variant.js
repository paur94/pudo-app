const Router = require('koa-router');
const router = new Router();
const VariantDetails = require("../models/VariantDetails")

router.get(`/low_quantity/count`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, $expr: { $lt: ["$inventory_quantity", "$min_inventory_quantity"] } };
    const count = await VariantDetails.find(filter).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/low_quantity_product_types`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size, term } = ctx.params;

    const productTypes = await VariantDetails.aggregate([
        // join Recipes collection
        {
            $lookup: {
                from: 'productdetails',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $project: {
                product: 1,
                inventory_quantity: 1,
                min_inventory_quantity: 1,
                product: {
                    shop: 1,
                    title: 1,
                    track_min_quantity: 1,
                    product_type: 1
                }
            }
        },
        {
            $match: {
                ...(term && { 'product.shop': shop, 'product.title': { "$regex": term, "$options": "i" }, 'product.track_min_quantity': { $ne: true } }),
                $expr: {
                    $lt: ["$inventory_quantity", "$min_inventory_quantity"]
                }
            }
        },
        { $group: { _id: '$product.product_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ])

    ctx.status = 200;
    ctx.body = { data: productTypes };
})

router.get(`/low_quantity/:page/:page_size/:sort/:product_type*/:term*`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size, term, product_type } = ctx.params;

    const variants = await VariantDetails.aggregate([
        {
            $lookup: {
                from: 'productdetails',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $project: {
                title: 1,
                image_src: 1,
                min_inventory_quantity: 1,
                inventory_quantity: 1,
                product: 1,
                quantity_diff: {
                    $subtract: ["$min_inventory_quantity", "$inventory_quantity"]
                },
                product: {
                    shop: 1,
                    removed: 1,
                    title: 1,
                    vendor: 1,
                    images: 1,
                    product_type: 1,
                    track_min_quantity: 1,
                    shop: 1
                }
            }
        },

        {
            $match: {
                ...(term && { 'product.title': { "$regex": term, "$options": "i" } }),
                'product.shop': shop,
                'product.product_type': product_type || "",
                'product.removed': { $ne: true },
                'product.track_min_quantity': { $ne: true },
                $expr: {
                    $lt: ["$inventory_quantity", "$min_inventory_quantity"]
                }
            }
        },
        { $sort: { quantity_diff: -1 } },
        {
            $skip: page * page_size
        },
        { $limit: page_size * 1 }
    ])

    const count = await VariantDetails.aggregate([
        // join Recipes collection
        {
            $lookup: {
                from: 'productdetails',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $unwind: '$product'
        },
        {
            $project: {
                product: 1,
                inventory_quantity: 1,
                min_inventory_quantity: 1,
                product: {
                    shop:1,
                    title: 1,
                    track_min_quantity: 1,
                    product_type: 1,
                }
            }
        },
        {
            $match: {
                ...(term && { 'product.title': { "$regex": term, "$options": "i" } }),
                'product.product_type': product_type || "",
                'product.shop':shop,
                'product.track_min_quantity': { $ne: true },
                $expr: {
                    $lt: ["$inventory_quantity", "$min_inventory_quantity"]
                }
            }
        },
        { $count: "res" }
    ])


    ctx.status = 200;
    ctx.body = { data: variants, count: count && count[0]?.res };
})

router.get(`/no_cost/count`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, $or: [{ cost: "" }, { cost: null }] };

    const count = await VariantDetails.find(filter).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})

router.get(`/no_barcode/count`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, $or: [{ barcode: { $exists: false } }, { barcode: { $eq: "" } }, { barcode: null }] };
    const count = await VariantDetails.find(filter).countDocuments()
    ctx.status = 200;
    ctx.body = { count: count };
})


router.get(`/no_cost/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, $or: [{ cost: "" }, { cost: null }] };

    const count = await VariantDetails.find(filter).countDocuments()
    const products = await VariantDetails.find(filter).skip(page * page_size).limit(page_size * 1).sort("product").populate('product');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})

router.get(`/no_barcode/:page/:page_size/:sort`, async (ctx) => {
    const { shop } = ctx.session;
    const { page, sort, page_size } = ctx.params;
    const filter = { shop, $or: [{ barcode: { $exists: false } }, { barcode: { $eq: "" } }, { barcode: null }] };
    const count = await VariantDetails.find(filter).countDocuments()
    const products = await VariantDetails.find(filter).skip(page * page_size).limit(page_size * 1).populate('product');
    ctx.status = 200;
    ctx.body = { data: products, count: count };
})


module.exports = router