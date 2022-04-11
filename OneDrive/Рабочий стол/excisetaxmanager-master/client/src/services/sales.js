import { handleErrors } from "../utils/errorHandling_ts"

export const getAll = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/sales/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())

export const syncOrders = () => fetch(`/api/sales/sync`).then(handleErrors).then(response => response.json())

export const getLastMonth = () => fetch(`/api/sales/last_month`).then(handleErrors).then(response => response.json())

export const getByStateAndMonth = (state, month, year) => fetch(`/api/sales/state-by-month/${state}/${month}/${year}`).then(handleErrors).then(response => response.json())

export const getMarginsByMonth = (month, year) => fetch(`/api/sales/margins/state-by-month/${month}/${year}`).then(handleErrors).then(response => response.json())
