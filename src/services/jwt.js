// src/services/jwt.js
const jwt = require("jsonwebtoken");

// ✅ Ensure JWT_SECRET exists
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined in your environment variables. Please add it to your .env file."
  );
}

/**
 * Sign a JSON Web Token with a payload.
 * @param payload - The data to include in the token (e.g., user id and email)
 * @returns A signed JWT string
 */
const signJwt = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d", // token expires in 7 days
  });
};

/**
 * Verify a JSON Web Token.
 * @param token - JWT string to verify
 * @returns The decoded payload if valid
 */
const verifyJwt = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signJwt,
  verifyJwt,
};