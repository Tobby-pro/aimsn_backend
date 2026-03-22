// src/services/email.js
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  throw new Error("❌ RESEND_API_KEY not set");
}

// Determine frontend URL dynamically
const FRONTEND_VERIFY_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.aimsn.com.ng/verify"
    : "http://localhost:5173/verify";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Corrected FROM_EMAIL — must follow proper format
const FROM_EMAIL = process.env.EMAIL_FROM || "AIMS Nigeria <noreply@aimsn.com.ng>";

/**
 * Fire-and-forget wrapper (NON-BLOCKING)
 */
const safeSend = async (fn) => {
  fn().catch((err) => {
    console.error("❌ Email error:", err?.message || err);
  });
};

/**
 * Send verification email (NON-BLOCKING)
 */
const sendVerificationEmail = (to, token) => {
  const link = `${FRONTEND_VERIFY_URL}?token=${token}`; // 🚀 updated

  safeSend(async () => {
    const res = await resend.emails.send({
      from: FROM_EMAIL, // no extra quotes
      to,
      subject: "Verify Your Email",
      html: `
        <h2>Welcome to AIMS Nigeria 👋</h2>
        <p>Thank you for signing up! Please verify your email by clicking the link below:</p>
        <a href="${link}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
        <p>If you did not sign up, you can ignore this email.</p>
      `,
    });

    console.log(`✅ Verification email sent to ${to}`, res?.id);
  });
};

/**
 * Send welcome email (NON-BLOCKING)
 */
const sendWelcomeEmail = (to) => {
  safeSend(async () => {
    const res = await resend.emails.send({
      from: FROM_EMAIL, // no extra quotes
      to,
      subject: "Welcome to AIMS Nigeria 🎉",
      html: `
        <h2>Welcome to AIMS Nigeria 👋</h2>
        <p>Your account has been successfully verified.</p>
        <p>You now have full access to your dashboard.</p>
      `,
    });

    console.log(`✅ Welcome email sent to ${to}`, res?.id);
  });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};