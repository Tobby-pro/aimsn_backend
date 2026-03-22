// src/routes/payments.js
const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireVerified } = require("../middleware/verified");
const axios = require("axios");
const { db } = require("../db/client");
const { payments, enrolled_fees } = require("../db/schema");
const { eq, and } = require("drizzle-orm");
const { FEES } = require("../config/fees");
const crypto = require("crypto");

const router = Router();

// Apply authentication and verification for all routes except webhooks
router.use((req, res, next) => {
  if (req.path === "/webhook") return next();
  requireAuth(req, res, () => requireVerified(req, res, next));
});

/**
 * INITIATE PAYMENT
 */
router.post("/initiate", async (req, res) => {
  try {
    const user = req.user;
    const fee_type = "membership_registration";
    const amount = FEES[fee_type];

    const reference = `aimsn_${Date.now()}_${user.id}`;

    await db.insert(payments).values({
      member_id: user.id,
      fee_type,
      reference,
      amount: amount.toString(),
      status: "pending",
    });

    // Return public key from env (frontend reads it)
    return res.json({
      reference,
      email: user.email,
      amount,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
    });
  }
});

/**
 * VERIFY PAYMENT
 */
router.post("/verify", async (req, res) => {
  try {
    const { reference } = req.body;
    const user = req.user;

    if (!reference) {
      return res.status(400).json({ success: false, message: "Reference required" });
    }

    const [payment] = await db.select().from(payments).where(eq(payments.reference, reference));

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status === "success") {
      return res.json({ success: true, message: "Already verified 🎉" });
    }

    const { data } = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const transaction = data.data;

    if (!data.status || transaction.status !== "success") {
      await db.update(payments).set({ status: "failed" }).where(eq(payments.reference, reference));
      return res.status(400).json({ success: false, message: "Verification failed ❌" });
    }

    const fee_type = payment.fee_type;

    const [existingEnrollment] = await db
      .select()
      .from(enrolled_fees)
      .where(and(eq(enrolled_fees.member_id, user.id), eq(enrolled_fees.fee_type, fee_type)));

    if (!existingEnrollment) {
      await db.insert(enrolled_fees).values({ member_id: user.id, fee_type });
    }

    await db.update(payments).set({ status: "success" }).where(eq(payments.reference, reference));

    return res.json({ success: true, message: "Payment verified successfully 🎉" });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({ success: false, message: "Verification failed ❌" });
  }
});

/**
 * PAYSTACK WEBHOOK
 */
router.post("/webhook", async (req, res) => {
  try {
    const paystackSignature = req.headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_SECRET_KEY || "";

    const hash = crypto.createHmac("sha512", secret).update(JSON.stringify(req.body)).digest("hex");

    if (hash !== paystackSignature) {
      console.warn("⚠️ Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event !== "charge.success") return res.status(200).send("Event ignored");

    const reference = event.data.reference;
    const fee_type = (event.data.metadata && event.data.metadata.fee_type) || "membership_registration";

    const [payment] = await db.select().from(payments).where(eq(payments.reference, reference));

    if (!payment) return res.status(404).send("Payment not found");

    const [existingEnrollment] = await db
      .select()
      .from(enrolled_fees)
      .where(and(eq(enrolled_fees.member_id, payment.member_id), eq(enrolled_fees.fee_type, fee_type)));

    if (!existingEnrollment) {
      await db.insert(enrolled_fees).values({ member_id: payment.member_id, fee_type });
    }

    await db.update(payments).set({ status: "success" }).where(eq(payments.reference, reference));

    console.log(`✅ Webhook processed for ${reference}`);
    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Server error");
  }
});

module.exports = router;