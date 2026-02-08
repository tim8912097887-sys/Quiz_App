import * as z from "zod";

const EnvSchema = z.object({
    PORT: z.string("Port should be string").nonempty("Port can't be empty"),
    NODE_ENV: z.enum(["production","development","test"]),
    PGUSER: z.string("Database user should be string").nonempty("Database user can't be empty"),
    PGPASSWORD: z.string("Database password should be string").nonempty("Database password can't be empty"),
    PGHOST: z.string("Database host should be string").nonempty("Database host can't be empty"),
    PGPORT: z.string("Database port should be string").nonempty("Database port can't be empty"),
    PGDATABASE: z.string("Database name should be string").nonempty("Database name can't be empty"),
    SALT: z.string("Salt should be string").nonempty("Salt can't be empty"),
    REFRESH_TOKEN_SECRET: z.string("Refresh token secret should be string").nonempty("Refresh token secret can't be empty"),
    ACCESS_TOKEN_SECRET: z.string("Access token secret should be string").nonempty("Access token secret can't be empty"),
    REFRESH_TOKEN_EXPIRED: z.string("Refresh token expired should be string").nonempty("Refresh token expired can't be empty"),
    ACCESS_TOKEN_EXPIRED: z.string("Access token expired should be string").nonempty("Access token expired can't be empty"),
    REDIS_PASSWORD: z.string("Redis password should be string").nonempty("Redis password can't be empty"),
    REDIS_HOST: z.string("Redis host should be string").nonempty("Redis host can't be empty"),
    REDIS_PORT: z.string("Redis port should be string").nonempty("Redis port can't be empty"),
    EMAIL_SENDER_USER: z.string("Email sender user should be string").nonempty("Email sender user can't be empty"),
    RESEND_API_KEY: z.string("Api key should be string").nonempty("Api key can't be empty"),
})

const result = EnvSchema.safeParse(process.env);
// Stop the application by throw error
if(!result.success) throw new Error(result.error.issues[0].message);
// Validated data
export const env = result.data;