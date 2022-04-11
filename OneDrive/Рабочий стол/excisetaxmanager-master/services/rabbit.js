const amqplib = require('amqplib');

const AMQP_URL = process.env.CLOUDAMQP_URL || "amqp://localhost";

const Message= require("../models/Message");

async function sendSyncMessage(shop, host) {

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

    return res;
}

module.exports = { sendSyncMessage }