const { db } = require("./src/db/client");
const { members } = require("./src/db/schema");

(async () => {
  try {
    // Test raw query first
    const rawResult = await db.execute("SELECT 1");
    console.log("✅ Raw query works:", rawResult);

    // Test table query
    const [user] = await db.select().from(members).limit(1);
    console.log("DB Connection OK, first user:", user || "No users yet");

    process.exit(0);
  } catch (err) {
    console.error("DB Connection Failed:", err);
    process.exit(1);
  }
})();