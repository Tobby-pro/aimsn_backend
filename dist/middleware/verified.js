"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireVerified = void 0;
const client_1 = require("../db/client");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const requireVerified = async (req, res, next) => {
    const user = req.user;
    const [member] = await client_1.db
        .select()
        .from(schema_1.members)
        .where((0, drizzle_orm_1.eq)(schema_1.members.id, user.id));
    if (!member || !member.is_verified) {
        return res.status(403).json({
            success: false,
            message: "Account not verified",
        });
    }
    next();
};
exports.requireVerified = requireVerified;
