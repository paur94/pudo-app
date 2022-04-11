import { handleErrors } from "../utils/errorHandling_ts"

export const getAll = (page = 0, page_size = 5, sort = 'created') => fetch(`/api/taxrates/${page}/${page_size}/${sort}`).then(handleErrors).then(response => response.json())
export const getItem = (id: string) => fetch(`/api/taxrates/${id}`).then(handleErrors).then(response => response.json())

export const getByState = () => fetch(`/api/taxrates/by_states`).then(handleErrors).then(response => response.json())

export const create = (data: any) => {
    return fetch("/api/taxrates", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(handleErrors).then(res => res.json())
}

export const deleteItem = (id: string) => {
    return fetch(`/api/taxrates/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(handleErrors).then(res => res.json())
}

export const update = (data: any, id: string) => {
    return fetch(`/api/taxrates/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(handleErrors).then(res => res.json())
}
