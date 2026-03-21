"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrolled_fees = exports.payments = exports.members = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// ---------------------------
// MEMBERS TABLE
// ---------------------------
exports.members = (0, pg_core_1.pgTable)("members", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    password_hash: (0, pg_core_1.text)("password_hash").notNull(),
    is_verified: (0, pg_core_1.boolean)("is_verified").notNull().default(false),
    verification_token: (0, pg_core_1.text)("verification_token"),
    verification_token_expires_at: (0, pg_core_1.timestamp)("verification_token_expires_at"),
    created_at: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
}, (table) => ({
    emailIdx: (0, pg_core_1.index)("members_email_idx").on(table.email),
}));
// ---------------------------
// PAYMENTS TABLE
// ---------------------------
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    member_id: (0, pg_core_1.serial)("member_id").notNull(),
    fee_type: (0, pg_core_1.varchar)("fee_type", { length: 50 }).notNull(), // changed from program_id
    reference: (0, pg_core_1.varchar)("reference", { length: 100 }).notNull(),
    amount: (0, pg_core_1.text)("amount").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).notNull(), // pending, success, failed
    created_at: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// ---------------------------
// ENROLLED FEES TABLE
// ---------------------------
exports.enrolled_fees = (0, pg_core_1.pgTable)("enrolled_fees", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    member_id: (0, pg_core_1.serial)("member_id").notNull(),
    fee_type: (0, pg_core_1.varchar)("fee_type", { length: 50 }).notNull(), // changed from program_id
    enrolled_at: (0, pg_core_1.timestamp)("enrolled_at").defaultNow(),
});
