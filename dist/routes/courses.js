"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/courses.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const verified_1 = require("../middleware/verified");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema"); // updated
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// ✅ Get enrolled fees (or membership activations) for logged-in member
router.get("/my-fees", auth_1.requireAuth, verified_1.requireVerified, async (req, res) => {
    try {
        const user = req.user;
        const fees = await client_1.db
            .select()
            .from(schema_1.enrolled_fees)
            .where((0, drizzle_orm_1.eq)(schema_1.enrolled_fees.member_id, user.id));
        res.json({
            success: true,
            data: fees,
        });
    }
    catch (err) {
        console.error("Failed to fetch enrolled fees", err);
        res.status(500).json({ success: false, message: "Failed to fetch enrolled fees" });
    }
});
exports.default = router;
