import { app } from "@/app.js";
import { logger } from "@utilities/logger.js";
import { handleShutdown } from "@utilities/shutdown.js";

(
    async() => {
        try {
            const server = app.listen(3001,() => logger.info(`Server Listen: server is running on port 3000`));
            handleShutdown(server);
        } catch (error) {
            // Handle initial db connection error
            logger.error(`Application Start Error: ${error}`);
            process.exit(1);
        }
    }
)()