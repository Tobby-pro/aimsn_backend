// src/routes/members.js
const { Router } = require("express");
const { db } = require("../db/client");
const { members, enrolled_fees } = require("../db/schema");
const { signJwt } = require("../services/jwt");
const { sendVerificationEmail, sendWelcomeEmail } = require("../services/email");
const { generateToken } = require("../utils/token");
const { requireAuth } = require("../middleware/auth");
const { requireVerified } = require("../middleware/verified");
const { eq } = require("drizzle-orm");
const bcrypt = require("bcrypt");

const router = Router();

// Global logging for this router
router.use((req, res, next) => {
  console.log(`[MEMBERS ROUTER] ${req.method} ${req.url}`);
  next();
});

// Determine frontend URL dynamically
const FRONTEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.aimsn.com.ng"
    : "http://localhost:5173";

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain letters and numbers for strength",
      });
    }

    const existing = await db
      .select()
      .from(members)
      .where(eq(members.email, email));
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    // ✅ Reduced bcrypt cost for faster hashing
    const password_hash = await bcrypt.hash(password, 9);
    const verification_token = generateToken();

    await db.insert(members).values({
      email,
      password_hash,
      verification_token,
      is_verified: false,
    });

    // ✅ Fire-and-forget email using IIFE
    (async () => {
      try {
        await sendVerificationEmail(email, verification_token);
      } catch (err) {
        console.error("❌ Verification email failed (ignored):", err);
      }
    })();

    // Respond instantly to user
    res.status(201).json({
      success: true,
      message:
        "✅ Registration successful! Check your email to verify your account.",
    });
  } catch (error) {
    console.error("❌ Registration failed:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

/**
 * VERIFY EMAIL
 */
router.get("/verify", async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ success: false, message: "Verification token missing" });

    const [member] = await db.select().from(members).where(eq(members.verification_token, token));
    if (!member) return res.status(400).json({ success: false, message: "Invalid or expired verification token" });

    await db.update(members).set({
      is_verified: true,
      verification_token: null,
    }).where(eq(members.id, member.id));

    // ✅ Fire-and-forget welcome email using IIFE
    (async () => {
      try {
        await sendWelcomeEmail(member.email);
      } catch (err) {
        console.error("❌ Welcome email failed (ignored):", err);
      }
    })();

    const jwt = signJwt({ id: member.id, email: member.email });

    res.cookie("token", jwt, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

/**
 * LOGIN
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 DEBUG: log every login attempt immediately
    console.log("🔹 /login attempt:", { email });

    const [user] = await db.select().from(members).where(eq(members.email, email));
    if (!user) {
      console.log("🔹 /login result: no user found for email", email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (!user.is_verified) {
      console.log("🔹 /login result: user not verified", email);
      return res.status(403).json({ success: false, message: "Please verify your email first" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      console.log("🔹 /login result: wrong password for", email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signJwt({ id: user.id, email: user.email });

    // ✅ Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    // 🔹 DEBUG: log successful login and admin flag
    console.log("🔹 /login success:", { email: user.email, is_admin: user.is_admin });

    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("❌ /login failed:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});
/**
 * CURRENT USER
 */
router.get("/me", requireAuth, requireVerified, async (req, res) => {
  try {
    const user = req.user;

    // 🔹 DEBUG: log every /me call and the user object
    console.log("🔹 /me called, req.user:", user);

    const [member] = await db
      .select({ id: members.id, email: members.email, is_admin: members.is_admin })
      .from(members)
      .where(eq(members.id, user.id));

    const membership = await db.query.enrolled_fees.findFirst({
      where: eq(enrolled_fees.member_id, user.id),
    });

    // 🔹 DEBUG: log what will be returned
    console.log("🔹 /me response data:", { ...member, is_member: !!membership });

    res.json({ success: true, data: { ...member, is_member: !!membership } });
  } catch (error) {
    console.error("❌ Failed to fetch /me:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user info" });
  }
});
/**
 * LOGOUT
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({ success: true, message: "Logged out successfully" });
});

/**
 * TEMP TEST ROUTE
 */
router.get("/test-email", async (req, res) => {
  try {
    const TEST_EMAIL = "tobbywomiloju@gmail.com";
    const TEST_TOKEN = "testtoken123";

    (async () => {
      try { await sendVerificationEmail(TEST_EMAIL, TEST_TOKEN); } 
      catch (err) { console.error("❌ Test verification email failed (ignored):", err); }
    })();

    (async () => {
      try { await sendWelcomeEmail(TEST_EMAIL); } 
      catch (err) { console.error("❌ Test welcome email failed (ignored):", err); }
    })();

    res.json({ success: true, message: "Test emails sent (check inbox)" });
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.status(500).json({ success: false, message: "Test email failed" });
  }
});

module.exports = router;