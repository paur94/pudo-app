const fetch = require('node-fetch');
const https = require('https');

const httpsAgent = new https.Agent({
    keepAlive: true
});

async function checkRecurringApplicationChargeStatus(shop, accessToken, host) {

    const charge_request = (await fetch(`https://${shop}/admin/api/2021-07/recurring_application_charges.json`, {
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        }
    }))

    const charge_response_data = await charge_request.json()
    const result = charge_response_data.recurring_application_charges
    return result;
}

async function createRecurringApplicationCharge(shop, accessToken, subscription, host) {

    const charge_request = (await fetch(`https://${shop}/admin/api/2021-07/recurring_application_charges.json`, {
        method: 'POST',
        headers: {
            'X-Shopify-Access-Token': accessToken,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "recurring_application_charge": {
                "name": subscription.name || "Recurring charge",
                "price": subscription.price,
                "trial_days": subscription.trial_days,
                "return_url": `https://${host}/`
            }
        })
    }))

    const charge_response_data = await charge_request.json()

    return charge_response_data.recurring_application_charge;
}

module.exports = { createRecurringApplicationCharge, checkRecurringApplicationChargeStatus }