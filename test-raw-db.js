const { db } = require("./src/db/client");

(async () => {
  try {
    // raw query to check Neon connection
    const result = await db.execute('SELECT 1');
    console.log("✅ Raw query works:", result);
    process.exit(0);
  } catch (err) {
    console.error("❌ Raw query failed:", err);
    process.exit(1);
  }
})();