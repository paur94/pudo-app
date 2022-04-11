const amqplib = require('amqplib');
const AMQP_URL = process.env.CLOUDAMQP_URL || "amqp://localhost";
require('dotenv').config()
const { CreateUpdateAllProductDetails } = require("./services/shopifyProductsV2")
const { getOrdersAndSave } = require("./services/shopifyOrders")
const converter = require('json-2-csv');
const { GetSalesData } = require("./services/sales")
const Order = require("./models/Order")
const Shop = require("./models/Shop")
const Message = require("./models/Message")

const fs = require("fs")
const { sleep } = require("./utils/asyncHelper")
const { MONGO_CONNECTION } = process.env;
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

mongoose.connect(MONGO_CONNECTION, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', async function () {
    console.log("worker connected to mongoose")
})

// async function Start() {
//     const { name: shop, accessToken } = await Shop.findOne({ name: 'siroart.myshopify.com' })

//     const orders = await Order.find({
//         shop,
//     });

//     console.log(`shop report started ${orders.length}`)
//     const sales_report_data = await GetSalesData(shop, accessToken, orders);

//     converter.json2csv(sales_report_data.order_data, (err, csv) => {
//         if (err) {
//             throw err;
//         }

//         fs.writeFileSync('report.csv', csv);
//         // print CSV string
//         console.log(csv);
//     });

// }

// Start()

async function StartConsuming() {
    const conn = await amqplib.connect(AMQP_URL, "heartbeat=60");
    const ch = await conn.createChannel()
    var exch = 'shop_sync_exchange';
    var q = 'shop_sync_queue';
    await ch.assertExchange(exch, 'direct', { durable: true }).catch(console.error);
    await ch.assertQueue(q, { durable: true });
    await ch.consume(q, async function (msg) {
        const { shop } = JSON.parse(msg.content.toString())
        
        const { correlationId } = msg.properties;
        const { accessToken } = await Shop.findOne({ name: shop })

        await Message.findOneAndUpdate({ _id: correlationId }, {
            status: "started",
            modified: new Date()
        });

        console.log(` [x] Received message, id -- ${correlationId}`)

        // console.log(shop)
        // await CreateUpdateAllProductDetails(shop, accessToken)
        // console.log(`shop --- ${shop}, products synced`)
        console.log(`shop --- ${shop}, syncing orders`)
        const oldest_orders_date = new Date(2021, 0, 0)
        await getOrdersAndSave(shop, accessToken, `https://${shop}/admin/orders.json?status=closed&created_at_min=${oldest_orders_date.toISOString()}`)
        console.log(`shop --- ${shop}, orders sync finished`)
        await Message.findOneAndUpdate({ _id: correlationId }, {
            status: "finished",
            modified: new Date()
        });
        console.log(`shop --- ${shop}, all sync finished`)

        ch.ack(msg)

    }, { noAck: false });
}

StartConsuming();