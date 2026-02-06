import { ApiError, ERROR_CODE, ERROR_TYPE } from "@custom/error/api.js";

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.BAD_REQUEST,ERROR_TYPE.BAD_REQUEST,message,true);
    }
}