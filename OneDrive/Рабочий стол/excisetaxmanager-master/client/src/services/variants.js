import { handleErrors } from "../utils/errorHandling_ts"

export const getAll = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/variants/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getNoBarcode = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/variants/no_barcode/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getNoCost = (page = 0, page_size = 10, sort = 'created') => fetch(`/api/variants/no_cost/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getLowQuantity = (product_type, page = 0, page_size = 10, sort = 'created', term="" ) => fetch(`/api/variants/low_quantity/${page}/${page_size}/${sort}/${product_type}/${term}`).then(handleErrors).then(response => response.json())
export const getLowQuantityProductTypes = () => fetch(`/api/variants/low_quantity_product_types`).then(handleErrors).then(response => response.json())

export const getNoBarcodeCount = () => fetch(`/api/variants/no_barcode/count`).then(handleErrors).then(response => response.json())
export const getNoCostCount = () => fetch(`/api/variants/no_cost/count`).then(handleErrors).then(response => response.json())
export const getLowQuantityCount = () => fetch(`/api/variants/low_quantity/count`).then(handleErrors).then(response => response.json())