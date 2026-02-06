import { ERROR_CODE, ERROR_TYPE } from "@custom/error/api.js"

type State = "success" | "error" | "redirect"

export type ErrorObject = {
      status: ERROR_TYPE
      code: ERROR_CODE
      detail: string
}
type Data = null | object

type Params = {
    state: State
    data?: Data
    error?: ErrorObject
}
type ResponseStructure = {
    state: State
    error: ErrorObject | null
    data: Data
    meta: {
        timestamp: string
    }
}

export const responseEnvelope = (params: Params): ResponseStructure => {
    const timestamp = new Date().toISOString();
    const response = {
        error: null,
        data: null,
        meta: {
            timestamp
        }
    }
    const finalResponse = { ...response,...params };
    return finalResponse;
}