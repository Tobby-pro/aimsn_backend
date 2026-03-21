"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendVerificationEmail = void 0;
// src/services/email.ts
const nodemailer_1 = __importDefault(require("nodemailer"));
const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS not set in .env");
    }
}
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
    },
});
const FROM_EMAIL = process.env.EMAIL_FROM || `"AIMS Nigeria" <${process.env.EMAIL_USER}>`;
/**
 * Send email verification
 */
const sendVerificationEmail = async (to, token) => {
    const link = `http://localhost:3000/api/members/verify?token=${token}`;
    const info = await transporter.sendMail({
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
};
exports.sendVerificationEmail = sendVerificationEmail;
/**
 * Send welcome email after successful verification
 */
const sendWelcomeEmail = async (to) => {
    const info = await transporter.sendMail({
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
};
exports.sendWelcomeEmail = sendWelcomeEmail;
