"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/members.ts
const express_1 = require("express");
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const jwt_1 = require("../services/jwt");
const email_1 = require("../services/email");
const token_1 = require("../utils/token");
const auth_1 = require("../middleware/auth");
const verified_1 = require("../middleware/verified");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
router.use((req, res, next) => {
    console.log(`[MEMBERS ROUTER] ${req.method} ${req.url}`);
    next();
});
/**
 * REGISTER
 * POST /api/members/register
 */
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required",
            });
        }
        const existing = await client_1.db
            .select()
            .from(schema_1.members)
            .where((0, drizzle_orm_1.eq)(schema_1.members.email, email));
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already registered",
            });
        }
        const password_hash = await bcrypt_1.default.hash(password, 10);
        const verification_token = (0, token_1.generateToken)();
        await client_1.db.insert(schema_1.members).values({
            email,
            password_hash,
            verification_token,
            is_verified: false,
        });
        // ✅ Send verification email
        await (0, email_1.sendVerificationEmail)(email, verification_token);
        res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
        });
    }
    catch (error) {
        console.error("❌ Registration failed:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
});
/**
 * VERIFY EMAIL
 * GET /api/members/verify?token=...
 */
router.get("/verify", async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token missing",
            });
        }
        const [member] = await client_1.db
            .select()
            .from(schema_1.members)
            .where((0, drizzle_orm_1.eq)(schema_1.members.verification_token, token));
        if (!member) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token",
            });
        }
        // ✅ Mark as verified
        await client_1.db
            .update(schema_1.members)
            .set({
            is_verified: true,
            verification_token: null,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.members.id, member.id));
        // ✅ Send welcome email
        await (0, email_1.sendWelcomeEmail)(member.email);
        // ✅ Generate JWT
        const jwt = (0, jwt_1.signJwt)({
            id: member.id,
            email: member.email,
        });
        // ✅ Set auth cookie
        res.cookie("token", jwt, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        // ✅ REDIRECT TO FRONTEND (BEST UX)
        return res.redirect("http://localhost:5173/dashboard?verified=true");
    }
    catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({
            success: false,
            message: "Verification failed",
        });
    }
});
/**
 * LOGIN
 * POST /api/members/login
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const [user] = await client_1.db
            .select()
            .from(schema_1.members)
            .where((0, drizzle_orm_1.eq)(schema_1.members.email, email));
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        if (!user.is_verified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email first",
            });
        }
        const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const token = (0, jwt_1.signJwt)({
            id: user.id,
            email: user.email,
        });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        res.json({
            success: true,
            message: "Login successful",
        });
    }
    catch (error) {
        console.error("❌ Login failed:", error);
        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
});
/**
 * CURRENT USER
 * GET /api/members/me
 */
router.get("/me", auth_1.requireAuth, verified_1.requireVerified, async (req, res) => {
    try {
        const user = req.user;
        const [member] = await client_1.db
            .select({
            id: schema_1.members.id,
            email: schema_1.members.email,
        })
            .from(schema_1.members)
            .where((0, drizzle_orm_1.eq)(schema_1.members.id, user.id));
        const membership = await client_1.db.query.enrolled_fees.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.enrolled_fees.member_id, user.id),
        });
        res.json({
            success: true,
            data: {
                ...member,
                is_member: !!membership,
            },
        });
    }
    catch (error) {
        console.error("Failed to fetch /me:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user info",
        });
    }
});
/**
 * LOGOUT
 * POST /api/members/logout
 */
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "lax",
    });
    res.json({
        success: true,
        message: "Logged out successfully",
    });
});
exports.default = router;
