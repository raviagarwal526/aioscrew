/**
 * Cleanup Test Data Script
 *
 * Removes all test data from the database while preserving schema.
 *
 * Usage:
 *   npm run cleanup-data
 *   OR
 *   tsx scripts/cleanup-test-data.ts
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

// Tables to clean up (in order to respect foreign key constraints)
const TABLES_TO_CLEAN = [
  // Child tables first (depend on other tables)
  "roster_assignments",
  "payment_items",
  "payment_batches",
  "crew_qualifications",
  "disruption_reassignments",
  "pairing_flights",
  "pairings",
  "roster_versions",
  "swap_requests",
  "leave_requests",
  "crew_notifications",
  "compliance_reports",
  "utilization_reports",
  "disruption_analysis",
  "claim_evidence",
  "admin_actions",
  "payment_audit",
  "excess_payment_reviews",
  "excess_payment_findings",
  "audit_log",
  "notification_settings",
  "agent_activity_log",
  "rule_overrides",
  "rule_evaluations",
  "regulatory_rules",
  "crew_duty_history",
  "crew_availability",
  "disruptions",
  "compliance_violations",
  "training_records",
  "pay_claims",
  "trips",

  // Parent tables (referenced by others)
  "crew_members",
  "admin_users",
  "system_config",
];

async function cleanupTestData() {
  console.log("🧹 Starting Database Cleanup");
  console.log("================================================\n");

  try {
    let totalDeleted = 0;

    // First, disable foreign key checks temporarily (PostgreSQL doesn't support this directly,
    // so we'll use TRUNCATE CASCADE which handles dependencies automatically)
    console.log("📋 Checking tables and preparing cleanup...\n");

    for (const table of TABLES_TO_CLEAN) {
      try {
        // Check if table exists
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `;

        if (!tableExists[0]?.exists) {
          console.log(`  ⏭️  Table ${table} does not exist, skipping...`);
          continue;
        }

        // Get count before deletion
        const countResult = await sql.unsafe(`
          SELECT COUNT(*) as count FROM ${table}
        `);
        const count = parseInt(countResult[0]?.count || "0");

        if (count === 0) {
          console.log(`  ✓ ${table}: 0 records (already empty)`);
          continue;
        }

        // Use TRUNCATE for faster deletion (resets auto-increment, handles CASCADE)
        // If TRUNCATE fails due to foreign keys, fall back to DELETE
        try {
          await sql.unsafe(`TRUNCATE TABLE ${table} CASCADE`);
          totalDeleted += count;
          console.log(
            `  ✅ ${table}: Deleted ${count.toLocaleString()} records (TRUNCATE)`
          );
        } catch (truncateError: any) {
          // Fall back to DELETE if TRUNCATE fails
          await sql.unsafe(`DELETE FROM ${table}`);
          totalDeleted += count;
          console.log(
            `  ✅ ${table}: Deleted ${count.toLocaleString()} records (DELETE)`
          );
        }
      } catch (error: any) {
        console.error(`  ❌ Error cleaning ${table}: ${error.message}`);
        // Continue with other tables
      }
    }

    console.log("\n================================================");
    console.log("✅ Cleanup Complete!");
    console.log("================================================");
    console.log(`📊 Total records deleted: ${totalDeleted.toLocaleString()}`);
    console.log("\n💡 Note: Database schema and structure are preserved.");
    console.log(
      "   Only data was removed. Tables are ready for new data generation."
    );
  } catch (error: any) {
    console.error("\n❌ Cleanup failed:", error.message);
    if (error.message.length > 200) {
      console.error(`   Error: ${error.message.substring(0, 200)}...`);
    }
    process.exit(1);
  }
}

// Run if called directly
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("cleanup-test-data.ts") ||
  process.argv[1]?.endsWith("cleanup-test-data.js");

if (isMainModule) {
  cleanupTestData();
}

export { cleanupTestData };
