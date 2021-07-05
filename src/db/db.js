import Pool from "pg";
import { config } from "dotenv";
const dbPool = new Pool.Pool({
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: "localhost",
    port: 5432
});

export {dbPool};