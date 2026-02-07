import { createClient } from "redis";
import { env } from "@configs/env.js";
import { ServerError } from "@/custom/error/server.js";
import { logger } from "@/utilities/logger.js";

const url = `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`;

export const cacheClient = createClient({
    url,
    socket: {
        reconnectStrategy: (retries) => {
             if(retries > 5) {
                throw new ServerError("Redis connection failed after 5 attempts");
             }
             return 500;

        }
    }
});

// Handle event
cacheClient.on("connect",() => logger.info("Cache Database: Redis is connecting"));
cacheClient.on("ready",() => logger.info("Cache Database: Redis connected"));
cacheClient.on("end",() => logger.warn("Cache Database: Redis disconnected"));
cacheClient.on("reconnecting",() => logger.info("Cache Database: Redis is reconnecting"));
cacheClient.on("error",(error) => logger.error(`Cache Database: ${error}`));

export const cachDbConnection = async() => {
    try {
        await cacheClient.connect();
    } catch (error) {
        logger.error(`Cache Database Disconnection: ${error}`);
        throw error;
    }
}

export const cachDbDisConnection = async() => {

    try {
        await cacheClient.close();
    } catch (error) {
        logger.error(`Cache Database Disconnection: ${error}`);
        throw error;
    }
}