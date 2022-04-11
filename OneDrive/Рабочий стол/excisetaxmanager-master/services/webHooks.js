const { asyncForEach } = require('../utils/asyncHelper');
const { registerWebhook } = require('@shopify/koa-shopify-webhooks')

const web_hooks = (host) => [
    {
        address: `https://${host}/webhooks/orders/partially_fulfilled`,
        topic: 'ORDERS_PARTIALLY_FULFILLED',
    },
    {
        address: `https://${host}/webhooks/orders/fulfill`,
        topic: 'ORDERS_FULFILLED',
    },
    {
        address: `https://${host}/webhooks/products/create`,
        topic: 'PRODUCTS_CREATE',
    },
    {
        address: `https://${host}/webhooks/products/update`,
        topic: 'PRODUCTS_UPDATE',
    },
    {
        address: `https://${host}/webhooks/products/delete`,
        topic: 'PRODUCTS_DELETE',
    },
    {
        address: `https://${host}/webhooks/app/uninstalled`,
        topic: 'APP_UNINSTALLED',
    }
]

async function registerMainWebHooks(shop, accessToken, host) {

    await asyncForEach(web_hooks(host), async (web_hook) => {
        const registration = await registerWebhook({
            ...web_hook,
            accessToken,
            shop,
            apiVersion: '2021-07',
        });

        if (registration.success) {
            console.log('Successfully registered webhook!');
        } else {
            console.log('Failed to register webhook', registration.result);
        }
    })
}
module.exports = { registerMainWebHooks }