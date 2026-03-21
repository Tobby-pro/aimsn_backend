// middleware/auth/auth.js
const { verifyJwt } = require("../services/jwt");

const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyJwt(token);

    req.user = decoded; // attach decoded user to request

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = { requireAuth };