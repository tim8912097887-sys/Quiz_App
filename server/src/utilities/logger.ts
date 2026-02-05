import { createLogger, format, transports } from "winston";

const { combine,printf,timestamp } = format;

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
}

const customFormat = printf(({ level,message,timestamp }) => {
     return `${level}: ${message} ${timestamp}`;
})
export const logger = createLogger({
    levels,
    format: combine(
        timestamp(),
        customFormat
    ),
    transports: [
        new transports.Console({ level: "info" }),
        new transports.File({
            filename: "errorLog",
            level: "error"
        })
    ]
})