// src/services/email.js
const { Resend } = require("resend");

if (!process.env.RESEND_API_KEY) {
  throw new Error("❌ RESEND_API_KEY not set");
}

if (!process.env.FRONTEND_URL) {
  throw new Error("❌ FRONTEND_URL not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.EMAIL_FROM || "AIMS Nigeria <onboarding@resend.dev>";

const FRONTEND_URL = process.env.FRONTEND_URL;

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
  const link = `${FRONTEND_URL}/verify?token=${token}`;

  safeSend(async () => {
    const res = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Verify Your Email",
      html: `
        <h2>Welcome to AIMS Nigeria 👋</h2>
        <p>Please verify your email:</p>
        <a href="${link}">Verify Email</a>
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
      from: FROM_EMAIL,
      to,
      subject: "Welcome to AIMS Nigeria 🎉",
      html: `
        <h2>Welcome to AIMS Nigeria 👋</h2>
        <p>Your account has been successfully verified.</p>
        <p>You now have full access.</p>
      `,
    });

    console.log(`✅ Welcome email sent to ${to}`, res?.id);
  });
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};