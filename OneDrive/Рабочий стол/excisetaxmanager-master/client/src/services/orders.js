import { handleErrors } from "../utils/errorHandling_ts"


export const getShopifyTotal = () => fetch(`/api/orders/shopify/total`).then(handleErrors).then(response => response.json())

