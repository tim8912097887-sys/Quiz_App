import { ApiError, ERROR_CODE, ERROR_TYPE } from "@custom/error/api.js";

export class UnauthorizedError extends ApiError {
    constructor(message: string) {
        super(ERROR_CODE.UNAUTHORIZED,ERROR_TYPE.UNAUTHORIZED,message,true);
    }
}