require('dotenv').config()
const Koa = require('koa');


const jwt = require('koa-jwt');
const Router = require('koa-router');
const session = require('koa-session');
const { default: shopifyAuth } = require('@shopify/koa-shopify-auth');
const verifyRequest = require('@shopify/koa-shopify-auth').verifyRequest;
const mount = require('koa-mount')
const serve = require('koa-static');

global.fetch = require("node-fetch");
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const bodyParser = require('koa-bodyparser');
const fs = require('fs')

const port = process.env.PORT || 5000;
const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, MONGO_CONNECTION, NODE_ENV } = process.env;
console.log(`NODE_ENV - ${NODE_ENV}`)
const app = new Koa();
const router = new Router();
const { INITIAL_RATES } = require('./utils/taxRates')
const { receiveWebhook } = require('@shopify/koa-shopify-webhooks')

const TaxRate = require("./models/TaxRate")
const Shop = require("./models/Shop")
const Order = require("./models/Order")
const Message = require("./models/Message")
const ShopDetails = require("./models/ShopDetails")
const Tracking = require("./models/Trecking")

const tax = require("./controllers/tax")
const mandatoryWebhooks = require("./controllers/mandatoryWebhooks")
const taxRateApi = require("./controllers/taxRate")
const reportApi = require("./controllers/report")
const productApi = require("./controllers/product")
const orderApi = require("./controllers/order")
const variantApi = require("./controllers/variant")
const shopApi = require("./controllers/shop")
const saleApi = require("./controllers/sale")
const webHookApi = require("./controllers/webHook")
const taxV2 = require("./controllers/taxV2")
const billingApi = require("./controllers/billing")

const { sendSyncMessage } = require('./services/rabbit')
const { getShopDataAndSave } = require('./services/shopifyShop')
const { updateOrderData } = require('./services/shopifyOrders')

const { registerMainWebHooks } = require('./services/webHooks')
const { RemoveProduct } = require("./services/shopifyProducts")
const { CreateUpdateProduct } = require("./services/shopifyProductsV2")
const { fulfillLines } = require("./services/shopifyFulfillments")
const { createRecurringApplicationCharge, checkRecurringApplicationChargeStatus } = require("./services/shopifyBilling")
const { SUBSCRIPTIONS } = require("./utils/billing")
const { addDays } = require("./utils/dateHelper")
const { SCOPES } = require("./utils/shopify")

router
  .get('/install', (ctx, next) => {
    ctx.body = 'Hi there your session has expired, please go to shopify to login install!';
  })

app.keys = [SHOPIFY_API_SECRET]
app.use(bodyParser())
app.use(router.routes())
  .use(router.allowedMethods())

app.use(mount('/api/tax', tax.middleware()))
app.use(mount('/webhooks/mandatory', mandatoryWebhooks.middleware()))
app.use(mount('/billing', billingApi.middleware()))

app.use(async (ctx, next) => {
  if (NODE_ENV === 'development' && (ctx.origin == 'http://localhost:5000' || ctx.origin == 'http://localhost:3000')) {
    const dev_shop = await Shop.findOne({ name: "siroart.myshopify.com" })
    ctx.session = { shop: dev_shop.name, accessToken: dev_shop.accessToken }
  }
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
})

app
  // sets up secure session data on each request
  .use(session({ secure: true, sameSite: 'none' }, app))
  .use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err, ctx);
    }
  })
  .use(
    shopifyAuth({
      apiKey: SHOPIFY_API_KEY,
      secret: SHOPIFY_API_SECRET,
      scopes: SCOPES,

      accessMode: 'offline',
      async afterAuth(ctx) {
        const { shop, accessToken } = ctx.session;

        const { orgin } = ctx.request

        const shop_data = await Shop.findOne({ name: shop });

        if (!shop_data && !(NODE_ENV === 'staging' || NODE_ENV === 'development')) {
          const charge = await createRecurringApplicationCharge(
            shop,
            accessToken,
            SUBSCRIPTIONS.small,
            ctx.host)
          const shop_data = new Shop({
            accessToken: accessToken,
            name: shop,
            charge,
            plan: SUBSCRIPTIONS.small
          });
          await shop_data.save();
        }
        else {
          await Shop.findOneAndUpdate(
            { name: shop },
            {
              $set: {
                accessToken: accessToken,
                name: shop,
              }
            },
            { upsert: true }).exec();
        }

        const shopDetails = await ShopDetails.findOne({ myshopify_domain: shop });

        if (!shopDetails) {
          await registerMainWebHooks(shop, accessToken, ctx.host)
          await getShopDataAndSave(shop, accessToken);
        }
        const rates = await TaxRate.find({ shop })
        if (!rates || rates.length === 0) {
          const store_initial_rates = INITIAL_RATES.map(r => { return { ...r, shop } });
          await TaxRate.insertMany(store_initial_rates)
        }
        return ctx.redirect('/');
      },
    }),
  )
  // everything after this point will require authentication
  .use(verifyRequest({ fallbackRoute: '/install', authRoute: '/auth', }))

const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET });

router.post('/webhooks/products/update', webhook, async (ctx) => {
  const { domain, payload } = ctx.state.webhook;
  const { name: shop, accessToken } = await Shop.findOne({ name: domain })
  await CreateUpdateProduct(shop, accessToken, payload)
  console.log(`**************received rpoduct update id -- ${payload.id}, barcode -- ${payload.barcode} cost -- ${payload.cost}`)
});


router.post('/webhooks/products/delete', webhook, async (ctx) => {
  const { domain, payload } = ctx.state.webhook;
  await RemoveProduct(domain, payload.id)
  console.log(`**************received rpoduct delete id -- ${payload.id}`)
});

router.post('/webhooks/products/create', webhook, async (ctx) => {

  const { domain, payload } = ctx.state.webhook;
  const { name: shop, accessToken } = await Shop.findOne({ name: domain })
  await CreateUpdateProduct(shop, accessToken, payload)
  console.log(`**************received rpoduct create id -- ${payload.id}, barcode -- ${payload.barcode} cost -- ${payload.cost}`)

});

const note_tracking_fieldname = "Custom_tracking_number"
const code_diff = 24001592737836
router.post('/webhooks/orders/partially_fulfilled', webhook, async (ctx) => {
  const { domain, payload } = ctx.state.webhook;

  console.log(`**************received order partially fulfilld id -- ${payload.id}, name -- ${payload.name}`)
  try {

    const { name: shop, accessToken } = await Shop.findOne({ name: domain })

    const custom_tracking_set = payload.note_attributes[note_tracking_fieldname]
    if (!custom_tracking_set) {

      const custom_tracking_number = code_diff + Number(payload.id)
      const tracking = await Tracking.findOneAndUpdate({
        shop: domain,
        order_shopify_id: payload.id,
      }, {
        shop: domain,
        order_shopify_id: payload.id,
        generated_number: custom_tracking_number
      }, { upsert: true });

      const existing_attributes = {};
      payload.note_attributes.forEach(a => {
        existing_attributes[a.name] = a.value
      })

      await updateOrderData(domain, accessToken, payload.id, {
        note_attributes: {
          ...existing_attributes,
          [note_tracking_fieldname]: custom_tracking_number
        }
      })

    }


    const excise_tax_line_ids = payload.line_items.filter(line => line.vendor === 'ENDS_taxer').map(line => {
      return { id: line.id }
    })

    if (excise_tax_line_ids.length > 0) {

      const shopDetails = await ShopDetails.findOne({ myshopify_domain: domain })
      const location_id = shopDetails.primary_location_id
      const excise_tax_lines_fulfillment = await fulfillLines(shop, accessToken, payload.id, excise_tax_line_ids, location_id)
    }

    await Order.findOneAndUpdate({
      shop: domain,
      shopify_id: payload.id

    }, {
      shop: domain,
      shopify_id: payload.id,
      variant_ids:[...payload.line_items.map(l=>l.variant_id)],
      ...payload
    }, { upsert: true })

  }
  catch (e) {
    console.log(`!!!**************error order partially fulfilled id -- ${payload.id}, name -- ${payload.name}`)
  }

});

router.post('/webhooks/orders/fulfill', webhook, async (ctx) => {
  const { domain, payload } = ctx.state.webhook;

  console.log(`**************received order fulfilld id -- ${payload.id}, name -- ${payload.name}`)
  try {

    await Order.findOneAndUpdate({
      shop: domain,
      shopify_id: payload.id,
    }, {
      shop: domain,
      shopify_id: payload.id,
      variant_ids:[...payload.line_items.map(l=>l.variant_id)],
      ...payload
    }, { upsert: true })

    const { name: shop, accessToken } = await Shop.findOne({ name: domain })

    const custom_tracking_set = payload.note_attributes[note_tracking_fieldname]
    if (!custom_tracking_set) {

      const custom_tracking_number = code_diff + Number(payload.id)
      const tracking = await Tracking.findOneAndUpdate({
        shop: domain,
        order_shopify_id: payload.id,
      }, {
        shop: domain,
        order_shopify_id: payload.id,
        generated_number: custom_tracking_number
      }, { upsert: true });

      const existing_attributes = {};
      payload.note_attributes.forEach(a => {
        existing_attributes[a.name] = a.value
      })

      await updateOrderData(domain, accessToken, payload.id, {
        note_attributes: {
          ...existing_attributes,
          [note_tracking_fieldname]: custom_tracking_number
        }
      })

    }
  }
  catch (e) {
    console.log(`!!!**************error order fulfilld id -- ${payload.id}, name -- ${payload.name}`)
  }

});


router.post('/webhooks/app/uninstalled', webhook, async (ctx) => {
  const { domain, payload } = ctx.state.webhook;

  console.log(`**************received app uninstalled -- ${domain}`)
  try {
    await Shop.findOneAndUpdate({
      name: domain,
    }, {
      charge: null,
    })

    await Message.deleteMany({
      shop: domain
    })

    await ShopDetails.findOneAndDelete({ myshopify_domain: domain })
  }
  catch (e) {
    console.log(`!!!**************error app uninstalled -- ${domain}, error -- ${e}`)
  }
});

app.use(router.allowedMethods());
app.use(router.routes());

app.use(async (ctx, next) => {

  if (NODE_ENV === 'staging' || NODE_ENV === 'development') return next()

  const { shop, accessToken } = ctx.session;
  const shop_data = await Shop.findOne({ name: shop })

  if (!shop_data) {
    const redirect_url = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES.join(',')}&redirect_uri=https://${ctx.host}/auth`
    return ctx.redirect(redirect_url);
  }


  const trial_period_end = addDays(new Date(), -shop_data.plan.trial_days)

  //TODO track trial_days after install
  if (shop_data.charge && (shop_data.charge.status === 'active' || shop_data.created_at >= trial_period_end))
    return next()

  const charges = await checkRecurringApplicationChargeStatus(shop, accessToken, ctx.host);

  const active_charge = charges.find(ch => ch.status === 'active')
  const pending_charge = charges.find(ch => ch.status === 'pending')

  if (active_charge) {
    shop_data.charge = active_charge;
    await shop_data.save();
    return next()
  }
  else if (pending_charge) {
    const charge = charges[0]
    shop_data.charge = pending_charge;
    await shop_data.save();
    return ctx.redirect(pending_charge.confirmation_url);
  }
  else {
    const charge = await createRecurringApplicationCharge(
      shop,
      accessToken,
      SUBSCRIPTIONS.small,
      ctx.host)
    shop_data.charge = charge;
    await shop_data.save();
    return ctx.redirect(charge.confirmation_url);
  }

});

app.use(mount('/api/taxrates', taxRateApi.middleware()))
app.use(mount('/api/reporting', reportApi.middleware()))
app.use(mount('/api/products', productApi.middleware()))
app.use(mount('/api/orders', orderApi.middleware()))
app.use(mount('/api/variants', variantApi.middleware()))
app.use(mount('/api/shops', shopApi.middleware()))
app.use(mount('/api/sales', saleApi.middleware()))
app.use(mount('/api/taxesv2', taxV2.middleware()))

app.on('error', (err, ctx) => {
  console.log('error', err);
  ctx.status = err.status || 500;
  ctx.body = {
    message: err.message,
    error: err
  }
})

mongoose.connect(MONGO_CONNECTION, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function () {

  const taxRate = await TaxRate.findOne({})
  if (!taxRate) {
    await TaxRate.insertMany([
      {
        tax: { name: "e-liquid", tag: "taxable_eliquid", shop: "babstest.myshopify.com" },
        state: { name: "California", shortcode: "CA" },
        shop: "babstest.myshopify.com",
        //TODO global taxType Enum
        taxType: "cost_percent",
        value: 57.5,
      }
    ])
  }

  console.log("mongoose connected")

})

const REACT_ROUTER_PATHS = [
  '/dashboard'
];

app
  .use(async (ctx, next) => {
    if (ctx.request.path.indexOf("/dashboard") != -1) {
      ctx.request.path = '/';
    }
    await next()
  })
  .use(serve('build'))


app.listen(port, () => console.log(`running on port ${port}`))