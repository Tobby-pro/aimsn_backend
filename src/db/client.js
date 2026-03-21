// src/db/client.js
const dotenv = require("dotenv");
dotenv.config();

const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { members, payments, enrolled_fees } = require("./schema");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

// ✅ Use pg instead of neon serverless
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Neon
  },
});

const db = drizzle(pool, {
  schema: { members, payments, enrolled_fees },
});

console.log("✅ Drizzle + PG client ready");

module.exports = { db };