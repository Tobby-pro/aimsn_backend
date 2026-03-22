// src/services/email.js
const nodemailer = require("nodemailer");

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
  throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");
}

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || `"AIMS Nigeria" <${process.env.EMAIL_USER}>`;
const FRONTEND_URL = isProduction ? "https://www.aimsn.com.ng" : "http://localhost:5173";

/**
 * Send verification email (async, non-blocking)
 * @param {string} to - recipient email
 * @param {string} token - verification token
 */
const sendVerificationEmail = (to, token) => {
  const link = `${FRONTEND_URL}/verify?token=${token}`;

  transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome to AIMS Nigeria 👋</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${link}">Verify Email</a>
      <p>After verification, you’ll be able to access all professional resources.</p>
    `,
  })
    .then(() => console.log(`✅ Verification email sent to ${to}`))
    .catch(err => console.error("❌ Failed to send verification email:", err));
};

/**
 * Send welcome email after successful verification (async)
 * @param {string} to - recipient email
 */
const sendWelcomeEmail = (to) => {
  transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject: "Welcome to AIMS Nigeria 🎉",
    html: `
      <h2>Welcome to AIMS Nigeria 👋</h2>
      <p>Congratulations! Your account has been successfully verified.</p>
      <p>You can now access all training programs, certifications, and professional resources.</p>
      <p>Enjoy your journey with AIMS!</p>
    `,
  })
    .then(() => console.log(`✅ Welcome email sent to ${to}`))
    .catch(err => console.error("❌ Failed to send welcome email:", err));
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};