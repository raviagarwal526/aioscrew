/**
 * Verify Data in Database
 *
 * Quick script to check what data is actually in the database
 *
 * Usage:
 *   tsx scripts/verify-data.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in environment variables");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function verifyData() {
  console.log("🔍 Verifying Data in Database");
  console.log("================================================\n");
  console.log(`📡 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}\n`);

  const tables = [
    "crew_members",
    "trips",
    "pay_claims",
    "training_records",
    "compliance_violations",
    "disruptions",
    "admin_users",
    "payment_batches",
    "payment_items",
    "crew_qualifications",
    "roster_assignments",
  ];

  try {
    let totalRecords = 0;
    const results: { table: string; count: number }[] = [];

    for (const table of tables) {
      try {
        const result = await sql.unsafe(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        const count = parseInt(result[0]?.count || "0");
        results.push({ table, count });
        totalRecords += count;

        if (count > 0) {
          console.log(
            `  ✅ ${table.padEnd(25)} ${count
              .toLocaleString()
              .padStart(10)} records`
          );
        } else {
          console.log(
            `  ⚪ ${table.padEnd(25)} ${count
              .toLocaleString()
              .padStart(10)} records (empty)`
          );
        }
      } catch (error: any) {
        console.log(`  ❌ ${table.padEnd(25)} Error: ${error.message}`);
      }
    }

    console.log("\n================================================");
    console.log(`📊 Total Records: ${totalRecords.toLocaleString()}`);
    console.log("================================================\n");

    if (totalRecords === 0) {
      console.log("⚠️  WARNING: No data found in database!");
      console.log("\nPossible causes:");
      console.log("  1. Data was inserted into a different database/branch");
      console.log("  2. Connection issue during insertion");
      console.log("  3. Transaction not committed");
      console.log("\n💡 Try running the generation script again:");
      console.log("   npm run generate-data:real-small");
    } else {
      console.log("✅ Data is present in the database!");
      console.log("\n💡 If you don't see data in Neon Console:");
      console.log(
        "   1. Check you're viewing the correct branch (development/production)"
      );
      console.log("   2. Refresh the page");
      console.log("   3. Check the database name matches your DATABASE_URL");
    }

    // Show sample data from crew_members
    if (results.find((r) => r.table === "crew_members")?.count > 0) {
      console.log("\n📋 Sample data from crew_members:");
      const sample =
        await sql`SELECT id, name, role, base FROM crew_members LIMIT 5`;
      sample.forEach((row: any) => {
        console.log(`   ${row.id} | ${row.name} | ${row.role} | ${row.base}`);
      });
    }
  } catch (error: any) {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  }
}

verifyData();



