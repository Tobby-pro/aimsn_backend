// src/middleware/verified.js
const { db } = require("../db/client");
const { members } = require("../db/schema");
const { eq } = require("drizzle-orm");

const requireVerified = async (req, res, next) => {
  try {
    const user = req.user;

    const [member] = await db
      .select()
      .from(members)
      .where(eq(members.id, user.id));

    if (!member || !member.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Account not verified",
      });
    }

    next();
  } catch (err) {
    console.error("Verification middleware error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { requireVerified };