"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/db/test-select.ts
const client_1 = require("./client");
const schema_1 = require("./schema");
async function testSelect() {
    try {
        const categories = await client_1.db
            .select()
            .from(schema_1.membership_categories);
        console.log("📦 Membership Categories:");
        console.table(categories);
    }
    catch (error) {
        console.error("❌ Select test failed:", error);
    }
    finally {
        process.exit(0);
    }
}
testSelect();
