"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
async function migrate() {
    console.log("🚀 Creating tables...");
    await client_1.db.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
    console.log("✅ Tables created successfully");
}
migrate()
    .catch((err) => console.error("❌ Migration failed:", err))
    .finally(() => process.exit(0));
