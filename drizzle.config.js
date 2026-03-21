// drizzle.config.js
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  schema: "./src/db/schema.js", // ✅ changed from .ts → .js
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER || "aimsn_user",
    password: process.env.DB_PASSWORD || "aimsn_password",
    database: process.env.DB_NAME || "aimsn_db",
    ssl: false,
  },
};