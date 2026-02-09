import { ServerConflictError } from "@custom/error/serverConflict.js";
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
     } catch (error: any) {
        const end = Date.now();
        const duration = end-start;
        logger.error(`Query: ${queryType} ${duration}ms ${error}`);
        // 23505 is the Postgres code for unique_violation
        if (error.code === '23505') {
            throw new ServerConflictError("User already exist");
        }
        throw error
     }
}

export const dbInitialization = async() => {
    await createDatabaseIfNotExist(env.PGDATABASE);
}

export const createUniqueUser = async(username: string,email: string,password: string) => {
    const client = await pool.connect();
    try {
        // Start the transaction
        await client.query('BEGIN');
        const findResult = await client.query("SELECT 1 FROM users WHERE email = $1",[email]);
        if(findResult.rowCount) {
            throw new ServerConflictError("User already exist");
        }
        const insertText = `
            INSERT INTO users (username,email,password)
            VALUES ($1,$2,$3)
            RETURNING id, username, email
        `;
        // It will wait for first one to insert,and fail with second with same unique column
        const result = await client.query(insertText,[username,email,password]);
        // Commit the transaction
        await client.query('COMMIT');
        return result.rows[0];
    } catch (error: any) {
        // Rollback the error
        await client.query('ROLLBACK');
        // 23505 is the Postgres code for unique_violation
        if (error.code === '23505') {
            throw new ServerConflictError("User already exist");
        }
        throw error
    } finally {
        // Release prevent run out of client
        client.release();
    }
}