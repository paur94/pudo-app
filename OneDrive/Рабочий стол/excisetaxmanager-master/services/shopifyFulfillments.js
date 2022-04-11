const fetch = require('node-fetch');
const https = require('https');

const httpsAgent = new https.Agent({
    keepAlive: true
});

async function fulfillLines(shop, accessToken, order_id, line_item_ids, location_id) {

    const fulfillment_request = (await fetch(`https://${shop}/admin/api/2021-07/orders/${order_id}/fulfillments.json`, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        },

        body: JSON.stringify({
            "fulfillment": {
                "location_id": location_id,
                "notify_customer": false,
                "line_items": line_item_ids
            }
        })
    }))

    if (fulfillment_request.status == 429 || fulfillment_request.status == 502) {
        await sleep(1000)
        return await fulfillLines(shop, accessToken, ids)
    }

    const fulfillment_request_data = await fulfillment_request.json()
    return fulfillment_request.fulfillment;
}

module.exports = { fulfillLines }