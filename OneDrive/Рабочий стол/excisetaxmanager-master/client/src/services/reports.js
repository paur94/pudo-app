import { handleErrors } from "../utils/errorHandling_ts"

export const getLastMonthPDF = (state) => fetch(`/api/reporting/last_month_pdf/${state}`).then(handleErrors).then(response => response.blob())