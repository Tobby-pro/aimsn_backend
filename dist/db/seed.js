"use strict";
// // src/db/seed.ts
// import { db } from "./client";
// // import { membership_categories } from "./schema";
// async function seed() {
//   // Insert membership categories
//   await db.insert(membership_categories).values([
//     { name: "ASSOCIATE", description: "Entry level membership" },
//     { name: "GRADUATE", description: "Graduates from recognized institutions" },
//     { name: "STUDENT", description: "Currently enrolled students" },
//     { name: "FULL_MEMBER", description: "Full membership for professionals" },
//     { name: "FELLOW", description: "Recognized fellows" },
//     { name: "CORPORATE_MEMBER", description: "Membership for companies" },
//     { name: "CORPORATE_FELLOW", description: "Fellowship for corporate organizations" },
//   ]);
//   console.log("✅ Membership categories seeded successfully");
// }
// seed()
//   .catch((err) => {
//     console.error("❌ Seed failed:", err);
//   })
//   .finally(() => {
//     process.exit(0);
//   });
