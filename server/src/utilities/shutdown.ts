import { Server } from "http";
import { logger } from "@utilities/logger.js";
import { dbDisconnection } from "@/db/db.js";

export const handleShutdown = (server: Server) => {
       // Flag prevent mutiple shutdown
       let isShutdown = false;
       const gracefullyShutdown = async(signal: string) => {
            if(isShutdown) return;
            logger.info(`Shutdown Start: ${signal} signal recieved,shutdown process start...`)
            isShutdown = true;
            // Prevent shutdown too long
            // 20 to 30 second for exist request finish task
            const forceExitTimout = setTimeout(() => {
                logger.warn(`ForceShutdown: exceed time limit,forcefully shutdown`)
                process.exit(1);
            },20000)
            try {
               // Stop accepting new request  
               await new Promise((resolve,reject) => {
                  server.close((error) => {
                    if(error) return reject(error.message);
                    return resolve("success");
                  });
               })
               await dbDisconnection();
               clearTimeout(forceExitTimout);
               process.exit(0);
            } catch (error) {
                logger.error(`Shutdown Error: ${error}`);
                process.exit(1);
            }
       }
    

    // Event register
    process.on("SIGINT",gracefullyShutdown);
    process.on("SIGTERM",gracefullyShutdown);
    // Log the unhandle exception and error before shutdown
    process.on("uncaughtException",(error) => {
        logger.error(`UncaughtException: ${error}`)
        gracefullyShutdown("uncaughtException");
    })
    process.on("unhandledRejection",(error) => {
        logger.error(`UncaughtError: ${error}`);
        gracefullyShutdown("unhandledRejection");
    })
}