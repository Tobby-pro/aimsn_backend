// src/index.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// ---------------------------
// ✅ Routes
// ---------------------------
const membersRouter = require("./routes/members");
const paymentsRouter = require("./routes/payments");
const coursesRouter = require("./routes/courses"); // NEW: for enrolled courses

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// ✅ Middlewares
// ---------------------------
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());

// ---------------------------
// ✅ CORS Setup
// ---------------------------
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // allow cookies
  })
);

// ---------------------------
// ✅ Global Logging Middleware
// ---------------------------
app.use((req, res, next) => {
  console.log(`[GLOBAL] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ---------------------------
// ✅ Routes
// ---------------------------
app.use("/api/members", membersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/courses", coursesRouter); // NEW

// ---------------------------
// ✅ Test Route for POST Debugging
// ---------------------------
app.post("/api/members/test", (req, res) => {
  console.log("✅ /api/members/test hit with body:", req.body);
  res.json({ success: true, message: "Test POST route working" });
});

// ---------------------------
// ✅ Health Check
// ---------------------------
app.get("/", (req, res) => {
  res.send("🚀 AIMSN Backend is running");
});

// ---------------------------
// ✅ Start Server
// ---------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});