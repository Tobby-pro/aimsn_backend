// src/routes/courses.js
const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireVerified } = require("../middleware/verified");
const { db } = require("../db/client");
const { enrolled_fees } = require("../db/schema"); // updated
const { eq } = require("drizzle-orm");

const router = Router();

// Get enrolled fees (or membership activations) for logged-in member
router.get("/my-fees", requireAuth, requireVerified, async (req, res) => {
  try {
    const user = req.user;

    const fees = await db
      .select()
      .from(enrolled_fees)
      .where(eq(enrolled_fees.member_id, user.id));

    res.json({
      success: true,
      data: fees,
    });
  } catch (err) {
    console.error("Failed to fetch enrolled fees", err);
    res.status(500).json({ success: false, message: "Failed to fetch enrolled fees" });
  }
});

module.exports = router;