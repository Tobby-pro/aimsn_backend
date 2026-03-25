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
const coursesRouter = require("./routes/courses"); // for enrolled courses
const adminRouter = require("./routes/admin"); // ✅ NEW ADMIN ROUTE

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// ⚠️ IMPORTANT: RAW BODY FOR WEBHOOK (MUST COME BEFORE express.json)
// ---------------------------
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);

// ---------------------------
// ✅ Middlewares
// ---------------------------
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser());

// ---------------------------
// ✅ CORS Setup for Dev + Production
// ---------------------------
const allowedOrigins = [
  "http://localhost:5173",       // dev
  "https://www.aimsn.com.ng",    // production
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
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
app.use("/api/courses", coursesRouter);
app.use("/api/admin", adminRouter); // ✅ Admin route wired

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

/*
💡 Notes for production cookies:
If you are sending cookies with 'withCredentials: true' from your frontend,
make sure you set cookies like this in your auth routes:

res.cookie("session", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
*/