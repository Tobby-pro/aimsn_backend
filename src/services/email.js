// src/services/email.js
const nodemailer = require("nodemailer");

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const FROM_EMAIL =
  process.env.EMAIL_FROM || `"AIMS Nigeria" <${process.env.EMAIL_USER}>`;

/**
 * Send email verification
 */
const sendVerificationEmail = async (to, token) => {
  const link = `http://localhost:3000/api/members/verify?token=${token}`;

  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "Verify Your Email",
      html: `
        <h2>Welcome to AIMS Nigeria 👋</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${link}">Verify Email</a>
        <p>After verification, you’ll be able to access all professional resources.</p>
      `,
    });

    console.log(`✅ Verification email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
  }
};

/**
 * Send welcome email after successful verification
 */
const sendWelcomeEmail = async (to) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to AIMS Nigeria 🎉",
      html: `
        <h2>Welcome to AIMS Nigeria 👋</h2>
        <p>Congratulations! Your account has been successfully verified.</p>
        <p>You can now access all training programs, certifications, and professional resources.</p>
        <p>Enjoy your journey with AIMS!</p>
      `,
    });

    console.log(`✅ Welcome email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send welcome email:", err);
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
};