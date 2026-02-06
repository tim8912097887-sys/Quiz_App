import { app } from "@/app.js";
import { logger } from "@utilities/logger.js";
import { handleShutdown } from "@utilities/shutdown.js";
import { env } from "@configs/env.js";
import { dbInitialization } from "./db/db.js";

(
    async() => {
        try {
            // Connect to database first
            await dbInitialization();
            const server = app.listen(env.PORT,() => logger.info(`Server Listen: server is running on port ${env.PORT}`));
            handleShutdown(server);
        } catch (error) {
            // Handle initial db connection error
            logger.error(`Application Start Error: ${error}`);
            process.exit(1);
        }
    }
)()