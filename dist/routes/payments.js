"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/payments.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const verified_1 = require("../middleware/verified");
const axios_1 = __importDefault(require("axios"));
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const fees_1 = require("../config/fees");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// Apply authentication and verification for all routes except webhook
router.use((req, res, next) => {
    if (req.path === "/webhook")
        return next();
    (0, auth_1.requireAuth)(req, res, () => (0, verified_1.requireVerified)(req, res, next));
});
/**
 * INITIATE PAYMENT
 * POST /api/payments/initiate
 */
router.post("/initiate", async (req, res) => {
    try {
        const user = req.user;
        const fee_type = "membership_registration";
        const amount = fees_1.FEES[fee_type];
        const reference = `aimsn_${Date.now()}_${user.id}`;
        // Insert pending payment
        await client_1.db.insert(schema_1.payments).values({
            member_id: user.id,
            fee_type,
            reference,
            amount: amount.toString(),
            status: "pending",
        });
        return res.json({
            reference,
            email: user.email,
            amount,
            publicKey: process.env.PAYSTACK_PUBLIC_KEY,
        });
    }
    catch (err) {
        console.error("Payment initiation error:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to initiate membership activation fee payment",
        });
    }
});
/**
 * VERIFY PAYMENT
 * POST /api/payments/verify
 * Production-safe manual verification (optional if webhook is used)
 */
router.post("/verify", async (req, res) => {
    try {
        const { reference } = req.body;
        const user = req.user;
        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Payment reference is required",
            });
        }
        // Step 1: Fetch payment record
        const [payment] = await client_1.db
            .select()
            .from(schema_1.payments)
            .where((0, drizzle_orm_1.eq)(schema_1.payments.reference, reference));
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment record not found",
            });
        }
        if (payment.status === "success") {
            return res.json({
                success: true,
                message: "Payment already verified 🎉",
            });
        }
        // Step 2: Verify payment with Paystack API
        const { data } = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });
        const transaction = data.data;
        if (!data.status || transaction.status !== "success") {
            // Mark payment as failed
            await client_1.db.update(schema_1.payments)
                .set({ status: "failed" })
                .where((0, drizzle_orm_1.eq)(schema_1.payments.reference, reference));
            return res.status(400).json({
                success: false,
                message: "Payment verification failed ❌",
            });
        }
        const fee_type = payment.fee_type;
        // Step 3: Prevent duplicate enrollment
        const [existingEnrollment] = await client_1.db
            .select()
            .from(schema_1.enrolled_fees)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrolled_fees.member_id, user.id), (0, drizzle_orm_1.eq)(schema_1.enrolled_fees.fee_type, fee_type)));
        if (!existingEnrollment) {
            await client_1.db.insert(schema_1.enrolled_fees).values({
                member_id: user.id,
                fee_type,
            });
        }
        // Step 4: Mark payment as success
        await client_1.db.update(schema_1.payments)
            .set({ status: "success" })
            .where((0, drizzle_orm_1.eq)(schema_1.payments.reference, reference));
        return res.json({
            success: true,
            message: "Membership activation fee verified successfully 🎉",
        });
    }
    catch (err) {
        console.error("Payment verification error:", err);
        return res.status(500).json({
            success: false,
            message: "Verification failed ❌",
        });
    }
});
/**
 * PAYSTACK WEBHOOK
 * POST /api/payments/webhook
 * Automatically handles payment success from Paystack
 */
router.post("/webhook", async (req, res) => {
    try {
        // 1️⃣ Verify the request signature
        const paystackSignature = req.headers["x-paystack-signature"];
        const secret = process.env.PAYSTACK_SECRET_KEY || "";
        const hash = crypto_1.default
            .createHmac("sha512", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash !== paystackSignature) {
            console.warn("⚠️ Invalid Paystack webhook signature");
            return res.status(400).send("Invalid signature");
        }
        const event = req.body;
        // 2️⃣ Only handle successful charges
        if (event.event !== "charge.success") {
            return res.status(200).send("Event ignored");
        }
        const reference = event.data.reference;
        const userEmail = event.data.customer.email;
        const fee_type = event.data.metadata?.fee_type || "membership_registration";
        // Step 3: Fetch payment record
        const [payment] = await client_1.db
            .select()
            .from(schema_1.payments)
            .where((0, drizzle_orm_1.eq)(schema_1.payments.reference, reference));
        if (!payment) {
            console.warn("⚠️ Payment not found for reference:", reference);
            return res.status(404).send("Payment not found");
        }
        if (payment.status === "success") {
            return res.status(200).send("Payment already processed");
        }
        // Step 4: Enroll member if not already
        const [existingEnrollment] = await client_1.db
            .select()
            .from(schema_1.enrolled_fees)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrolled_fees.member_id, payment.member_id), (0, drizzle_orm_1.eq)(schema_1.enrolled_fees.fee_type, fee_type)));
        if (!existingEnrollment) {
            await client_1.db.insert(schema_1.enrolled_fees).values({
                member_id: payment.member_id,
                fee_type,
            });
        }
        // Step 5: Update payment status to success
        await client_1.db.update(schema_1.payments)
            .set({ status: "success" })
            .where((0, drizzle_orm_1.eq)(schema_1.payments.reference, reference));
        console.log(`✅ Webhook processed for ${reference} (${userEmail})`);
        res.status(200).send("Webhook received");
    }
    catch (err) {
        console.error("Webhook processing error:", err);
        res.status(500).send("Server error");
    }
});
exports.default = router;
