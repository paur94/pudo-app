import { handleErrors } from "../utils/errorHandling_ts"

export const getShopData = () => fetch(`/api/shops/details`).then(handleErrors).then(response => response.json())

export const getTagsSet = () => fetch(`/api/shops/tags-set`).then(handleErrors).then(response => response.json())

export const startSync = () => fetch(`/api/shops/start-product-order-sync`).then(handleErrors).then(response => response.json())

export const saveDetails = (data) => {
    return fetch(`/api/shops/details/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(handleErrors).then(res => res.json())
}