const dotenv = require("dotenv");
dotenv.config();

const { neon } = require("@neondatabase/serverless");

// ✅ MUST be string (NOT object)
const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    // ✅ IMPORTANT: use tagged template, NOT .execute()
    const result = await sql`SELECT 1`;
    console.log("✅ Neon works:", result);
  } catch (err) {
    console.error("❌ Neon failed:", err);
  }
})();