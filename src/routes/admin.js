const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { db } = require("../db/client");
const { payments } = require("../db/schema");

const router = Router();

// 🔐 Admin: Get all payments
router.get("/payments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await db.select().from(payments);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching payments" });
  }
});

module.exports = router;