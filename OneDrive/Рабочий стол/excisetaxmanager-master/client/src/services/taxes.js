import { handleErrors } from "../utils/errorHandling_ts"


export const getByStateAndMonth = (state, month, year) => fetch(`/api/taxesv2/state-by-month/${state}/${month}/${year}`).then(handleErrors).then(response => response.json())

