import { app } from "./app";
import { handleShutdown } from "./utilities/shutdown";

(
    async() => {
        try {
            const server = app.listen(3001,() => console.log("Server is listen on port 3001"));
            handleShutdown(server);
        } catch (error) {
            // Handle initial db connection error
            console.error(`Fail to start the application: ${error}`);
            process.exit(1);
        }
    }
)()