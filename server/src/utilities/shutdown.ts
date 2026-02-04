import { Server } from "http";

export const handleShutdown = (server: Server) => {
       // Flag prevent mutiple shutdown
       let isShutdown = false;
       const gracefullyShutdown = async(signal: string) => {
            if(isShutdown) return;
            console.log(`${signal} signal recieved: Shutdown process start...`);
            isShutdown = true;
            // Prevent shutdown too long
            // 20 to 30 second for exist request finish task
            const forceExitTimout = setTimeout(() => {
                console.log(`Exceed time limit,Forcefully shutdown`);
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
               clearTimeout(forceExitTimout);
               process.exit(0);
            } catch (error) {
                console.error(`Shutdown Error: ${error}`);
                console.log("Forcefully Shutdown");
                process.exit(1);
            }
       }
    

    // Event register
    process.on("SIGINT",gracefullyShutdown);
    process.on("SIGTERM",gracefullyShutdown);
    // Log the unhandle exception and error before shutdown
    process.on("uncaughtException",(error) => {
        console.error(`UncaughtException: ${error}`);
        gracefullyShutdown("uncaughtException");
    })
    process.on("unhandledRejection",(error) => {
        console.error(`UncaughtError: ${error}`);
        gracefullyShutdown("unhandledRejection");
    })
}