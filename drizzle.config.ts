import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "aimsn_user",
    password: process.env.DB_PASSWORD || "aimsn_password",
    database: process.env.DB_NAME || "aimsn_db",
    ssl: false, // 👈 THIS FIXES YOUR ERROR
  },
} satisfies Config;