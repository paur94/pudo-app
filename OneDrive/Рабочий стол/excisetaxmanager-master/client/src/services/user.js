import { handleErrors } from "../utils/errorHandling_ts"

export const login = (username, password)=>{
    return fetch("/api/user/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
    }).then(handleErrors).then(res => res.json())

}

export const register = (data)=>{
    return fetch("/api/user/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(handleErrors).then(res => res.json())
}

export const gethi = (data)=>{
    return fetch("/api/user/hi").then(handleErrors).then(res => res.json())
}