"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// ---------------------------
// ✅ Routes
// ---------------------------
const members_1 = __importDefault(require("./routes/members"));
const payments_1 = __importDefault(require("./routes/payments"));
const courses_1 = __importDefault(require("./routes/courses")); // NEW: for enrolled courses
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// ---------------------------
// ✅ Middlewares
// ---------------------------
app.use(express_1.default.json()); // Parse JSON bodies
app.use((0, cookie_parser_1.default)());
// ---------------------------
// ✅ CORS Setup
// ---------------------------
app.use((0, cors_1.default)({
    origin: "http://localhost:5173", // frontend URL
    credentials: true, // allow cookies
}));
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
app.use("/api/members", members_1.default);
app.use("/api/payments", payments_1.default); // NEW
app.use("/api/courses", courses_1.default); // NEW
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
