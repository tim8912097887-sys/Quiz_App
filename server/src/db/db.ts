import { env } from "@configs/env.js";
import { logger } from "@utilities/logger.js";
import { Client, Pool } from "pg";

const createDatabaseIfNotExist = async(dbName: string) => {

    let client;
    try {
        // Connect to default database
        client = new Client({
            user: env.PGUSER,
            password: env.PGPASSWORD,
            port: Number(env.PGPORT),
            host: env.PGHOST,
            database: "postgres"
        });   
        await client.connect();
        // Check database existense
        const result = await client.query(`
          SELECT 1 FROM pg_database WHERE datname = $1   
        `,[dbName]);
        // Create if not exist
        if(!result.rowCount) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            logger.info(`Database Creation: Database ${dbName} created`);
        } else {
            logger.info(`Database Creation: Already created`);
        }
    } catch (error) {
        logger.error(`Database Creation: ${error}`);
        process.exit(1);
    } finally {
       await client?.end();
    }
}

const pool = new Pool({
    // Database info
    user: env.PGUSER,
    password: env.PGPASSWORD,
    port: Number(env.PGPORT),
    host: env.PGHOST,
    database: env.PGDATABASE,
    // Fail fast to reconnect
    connectionTimeoutMillis: 5000,
    // Set lower statement timeout for data consistency
    statement_timeout: 10000,
    query_timeout: 12000,
    max: 15,
    // Prevent delay after idle
    min: 2,
    // Keep the client fresh
    idleTimeoutMillis: 5000
});

// Handle event
pool.on("connect",(client) => {
    logger.info(`Database Connection: Success`);
    // Create database if not created
    client.query("")
})
pool.on("error",(error) => {
    logger.error(`Database Error: ${error}`);
})
pool.on("acquire",() => {
    logger.info(`Database Pool: Client acquire`);
})
pool.on("release",() => {
    logger.info(`Database Pool: Client Release`);
})
pool.on("remove",() => {
    logger.info(`Database Pool: Client Remove`);
})

//Handle Disconnection
export const dbDisconnection = async() => {
      await pool.end();
}
// Handle Query
export const dbQuery = async<T>(queryType: string,queryString: string,value: T[]) => {
     const start = Date.now();
     try {
        const result = await pool.query(queryString,value);
        const end = Date.now();
        const duration = end-start;
        logger.info(`Query: ${queryType} ${duration}ms Success`);
        return result;  
     } catch (error) {
        const end = Date.now();
        const duration = end-start;
        logger.error(`Query: ${queryType} ${duration}ms ${error}`);
        throw error
     }
}

export const dbInitialization = async() => {
    await createDatabaseIfNotExist(env.PGDATABASE);
}