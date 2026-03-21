// src/db/schema.js
const {
  pgTable,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  index,
} = require("drizzle-orm/pg-core");

// ---------------------------
// MEMBERS TABLE
// ---------------------------
const members = pgTable(
  "members",
  {
    id: integer("id").primaryKey({ autoincrement: true }),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password_hash: text("password_hash").notNull(),
    is_verified: boolean("is_verified").notNull().default(false),
    verification_token: text("verification_token"),
    verification_token_expires_at: timestamp("verification_token_expires_at"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    emailIdx: index("members_email_idx").on(table.email),
  })
);

// ---------------------------
// PAYMENTS TABLE
// ---------------------------
const payments = pgTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoincrement: true }),
    member_id: integer("member_id").notNull(),
    fee_type: varchar("fee_type", { length: 50 }).notNull(),
    reference: varchar("reference", { length: 100 }).notNull(),
    amount: text("amount").notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
  }
);

// ---------------------------
// ENROLLED FEES TABLE
// ---------------------------
const enrolled_fees = pgTable(
  "enrolled_fees",
  {
    id: integer("id").primaryKey({ autoincrement: true }),
    member_id: integer("member_id").notNull(),
    fee_type: varchar("fee_type", { length: 50 }).notNull(),
    enrolled_at: timestamp("enrolled_at").notNull().defaultNow(),
  }
);

module.exports = { members, payments, enrolled_fees };