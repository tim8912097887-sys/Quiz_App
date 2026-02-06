import * as z from "zod";

const EnvSchema = z.object({
    PORT: z.string("Port should be string").nonempty("Port can't be empty"),
    NODE_ENV: z.string("Node env should be string").nonempty("Node env can't be empty"),
    PGUSER: z.string("Database user should be string").nonempty("Database user can't be empty"),
    PGPASSWORD: z.string("Database password should be string").nonempty("Database password can't be empty"),
    PGHOST: z.string("Database host should be string").nonempty("Database host can't be empty"),
    PGPORT: z.string("Database port should be string").nonempty("Database port can't be empty"),
    PGDATABASE: z.string("Database name should be string").nonempty("Database name can't be empty"),
})

const result = EnvSchema.safeParse(process.env);
// Stop the application by throw error
if(!result.success) throw new Error(result.error.issues[0].message);
// Validated data
export const env = result.data;