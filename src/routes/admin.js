// src/routes/admin.js
const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { db } = require("../db/client");
const { payments, members } = require("../db/schema"); // import your tables
const { eq } = require("drizzle-orm");

const router = Router();

// 🔐 GET all payments (admin only)
router.get("/payments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await db
      .select({
        id: payments.id,
        member_id: payments.member_id,
        email: members.email,
        fee_type: payments.fee_type,
        reference: payments.reference,
        amount: payments.amount,
        status: payments.status,
        created_at: payments.created_at,
      })
      .from(payments)
      .leftJoin(members, eq(payments.member_id, members.id));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Admin payments error:", err);
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
});

module.exports = router;