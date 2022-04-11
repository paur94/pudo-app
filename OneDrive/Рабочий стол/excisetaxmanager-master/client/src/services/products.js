import { handleErrors } from "../utils/errorHandling_ts"

export const getAll = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/products/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getPending = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/products/pending/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getApproved = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/products/approved/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getExcluded = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/products/excluded/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getNoMinQuantity = (product_type, page = 0, page_size = 10, sort = 'created', term = "") => fetch(`/api/products/nominquantity/${page}/${page_size}/${sort}/${product_type}/${term}`).then(handleErrors).then(response => response.json())
export const getNoMinQuantityProductTypes = () => fetch(`/api/products/nominquantity_product_types`).then(handleErrors).then(response => response.json())

export const getNoCategory = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/products/no_category_tag/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())


export const getMissingDataStats = () => fetch(`/api/products/missing_data_stats`).then(handleErrors).then(response => response.json())

export const getNoCategoryCount = () => fetch(`/api/products/no_category_tag/count`).then(handleErrors).then(response => response.json())
export const getExcludedCount = () => fetch(`/api/products/excluded/count`).then(handleErrors).then(response => response.json())
export const getPendingCount = () => fetch(`/api/products/pending/count`).then(handleErrors).then(response => response.json())
export const getShopifyTotal = () => fetch(`/api/products/shopify/total`).then(handleErrors).then(response => response.json())
export const getAllCount = () => fetch(`/api/products/all/count`).then(handleErrors).then(response => response.json())
export const getApprovedCount = () => fetch(`/api/products/approved/count`).then(handleErrors).then(response => response.json())
export const getNoMinQuantityCount = () => fetch(`/api/products/nominquantity/count`).then(handleErrors).then(response => response.json())
export const syncAllProducts = () => fetch(`/api/products/sync_all`).then(handleErrors).then(response => response.json())
export const syncAndGet = (id) => fetch(`/api/products/sync_and_get/${id}`).then(handleErrors).then(response => response.json())

export const getProduct = (id) => fetch(`/api/products/get_product/${id}`).then(handleErrors).then(response => response.json())

//returns { products_count, total_variants, variants_synced, message, shopify_orders_count, synced_orders_count }
export const getSyncProgress = () => fetch(`/api/products/sync-progress`).then(handleErrors).then(response => response.json())

export const approve = (id, data) => {
    return fetch(`/api/products/approve/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(handleErrors).then(res => res.json())
}

export const doNotTrack = (id) => {
    return fetch(`/api/products/do_not_track/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    }).then(handleErrors).then(res => res.json())
}


export const setMinInventoryQuantity = (id, data) => {
    return fetch(`/api/products/setMinInventoryQuantity/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(handleErrors).then(res => res.json())
}