import { ErrorRequestHandler } from "express";
import { ApiError, ERROR_CODE, ERROR_TYPE } from "@/custom/error/api.js";
import { logger } from "@utilities/logger.js";
import { responseEnvelope } from "@utilities/responseEnvelope.js";

export const errorHandler: ErrorRequestHandler = (err,_,res,__) => {

    const error = {
        status: ERROR_TYPE.SERVER_ERROR,
        code: ERROR_CODE.SERVER_ERROR,
        detail: "Unexpected Error"
    }

    if(err instanceof ApiError) {
        error.status = err.type;
        error.code = err.statusCode;
        error.detail = err.message;
        if(!err.isOperational) {
            // Log Error stack for debug
            logger.error(`Critical Error: ${err}`);
            // Hide internal details from the user for security
            error.detail = "Internal Server Error";
        } else {
            logger.error(`ApiError: ${err.message}`);
        }
    } else {
        logger.error(`UnExpected Error: ${err}`);
    }
    const responseInfo = {
        state: "error" as const,
        error
    }
    res.status(error.code).json(responseEnvelope(responseInfo));
}