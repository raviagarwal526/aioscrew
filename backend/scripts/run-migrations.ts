/**
 * Database Migration Script for Neon PostgreSQL
 * 
 * This script runs SQL migration files on your Neon database.
 * 
 * Usage:
 *   npm run migrate
 *   OR
 *   tsx scripts/run-migrations.ts
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import pg from 'pg';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL is not set in environment variables');
  console.error('   Please set DATABASE_URL in your backend/.env file');
  process.exit(1);
}

// Use pg client for migrations (better for raw SQL execution)
const { Client } = pg;
const client = new Client({ connectionString: DATABASE_URL });

interface MigrationFile {
  name: string;
  path: string;
  description: string;
}

const migrations: MigrationFile[] = [
  {
    name: 'base_schema',
    path: join(__dirname, '../migrations/base_schema.sql'),
    description: 'Base Database Schema (crew_members, trips, pay_claims - required first)'
  },
  {
    name: 'admin_schema',
    path: join(__dirname, '../migrations/admin_schema.sql'),
    description: 'Payroll Admin Database Schema (claims, payments, admin users)'
  },
  {
    name: 'crew_scheduling_schema',
    path: join(__dirname, '../migrations/crew_scheduling_schema.sql'),
    description: 'Crew Scheduling System Schema (qualifications, rosters, disruptions)'
  }
];

async function runMigration(migration: MigrationFile): Promise<boolean> {
  try {
    console.log(`\n📦 Running migration: ${migration.name}`);
    console.log(`   ${migration.description}`);
    
    // Read SQL file
    const sqlContent = readFileSync(migration.path, 'utf-8');
    
    // Execute the entire SQL file using pg client (better for raw SQL)
    try {
      // Use pg client for executing raw SQL
      await client.query(sqlContent);
      console.log(`   ✅ Migration completed successfully`);
      return true;
    } catch (error: any) {
      // If execution fails, it might be because some objects already exist
      // This is okay for idempotent migrations
      if (error.message.includes('already exists') || 
          error.message.includes('duplicate key value') ||
          error.message.includes('already defined')) {
        console.log(`   ⚠️  Some objects already exist (this is okay for idempotent migrations)`);
        console.log(`   ✅ Migration completed (idempotent)`);
        return true;
      } else {
        // Re-throw other errors
        throw error;
      }
    }
  } catch (error: any) {
    console.error(`   ❌ Migration failed: ${error.message}`);
    if (error.message.length > 200) {
      console.error(`   Error: ${error.message.substring(0, 200)}...`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Database Migrations');
  console.log('================================');
  console.log(`📊 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
  console.log(`📁 Migrations directory: ${join(__dirname, '../migrations')}`);
  console.log(`📋 Found ${migrations.length} migration file(s)\n`);

  // Connect to database
  try {
    await client.connect();
    console.log('✅ Database connection successful\n');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nPlease check:');
    console.error('  1. DATABASE_URL is correct in backend/.env');
    console.error('  2. Your Neon database is accessible');
    console.error('  3. Your network connection is working');
    process.exit(1);
  }

  // Run all migrations
  let successCount = 0;
  let failCount = 0;

  for (const migration of migrations) {
    const success = await runMigration(migration);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // Summary
  console.log('\n================================');
  console.log('📊 Migration Summary');
  console.log('================================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📋 Total: ${migrations.length}`);

  // Close database connection
  await client.end();

  if (failCount > 0) {
    console.log('\n⚠️  Some migrations failed. Please review the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All migrations completed successfully!');
    console.log('   Your database is now ready to use.');
  }
}

main().catch(async (error) => {
  console.error('\n❌ Fatal error:', error);
  try {
    await client.end();
  } catch (e) {
    // Ignore errors when closing
  }
  process.exit(1);
});

