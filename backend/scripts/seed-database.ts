/**
 * Database Seed Script for Neon PostgreSQL
 * 
 * This script populates the database with sample data for development/testing.
 * 
 * Usage:
 *   npm run seed
 *   OR
 *   tsx scripts/seed-database.ts
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

const { Client } = pg;
const client = new Client({ connectionString: DATABASE_URL });

async function seedDatabase() {
  console.log('🌱 Starting Database Seeding');
  console.log('================================\n');

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Database connection successful\n');

    // Check if data already exists
    const crewCheck = await client.query('SELECT COUNT(*) as count FROM crew_members');
    if (parseInt(crewCheck.rows[0].count) > 0) {
      console.log('⚠️  Database already contains data.');
      console.log('   To reseed, delete existing data first.\n');
      console.log('   Would you like to continue anyway? (This will skip existing records)');
      // For now, we'll skip if data exists
      return;
    }

    console.log('📦 Seeding crew members...');
    await client.query(`
      INSERT INTO crew_members (id, name, role, base, seniority, qualification, email, phone, hire_date, ytd_earnings, status)
      VALUES
        ('CM001', 'Sarah Martinez', 'Captain', 'BUR', 8, '737-800', 's.martinez@copa.com', '555-0101', '2016-11-22', 87450.00, 'active'),
        ('CM002', 'John Smith', 'First Officer', 'PTY', 3, '737-MAX', 'j.smith@copa.com', '555-0102', '2021-11-22', 72300.00, 'active'),
        ('CM003', 'Michael Chen', 'First Officer', 'BUR', 5, '737-800', 'm.chen@copa.com', '555-0103', '2019-11-22', 78900.00, 'active'),
        ('CM004', 'Emily Rodriguez', 'Captain', 'PTY', 12, '737-MAX', 'e.rodriguez@copa.com', '555-0104', '2012-11-22', 95200.00, 'active'),
        ('CM006', 'David Park', 'First Officer', 'PTY', 2, '737-800', 'd.park@copa.com', '555-0106', '2022-11-22', 68500.00, 'active'),
        ('FA012', 'Jessica Taylor', 'Flight Attendant', 'BUR', 6, 'International', 'j.taylor@copa.com', '555-0112', '2018-11-22', 52300.00, 'active'),
        ('FA015', 'Marcus Johnson', 'Flight Attendant', 'BUR', 4, 'International', 'm.johnson@copa.com', '555-0115', '2020-11-22', 48900.00, 'active'),
        ('FA020', 'Ana Silva', 'Flight Attendant', 'PTY', 7, 'International', 'a.silva@copa.com', '555-0120', '2017-11-22', 54200.00, 'active'),
        ('FA021', 'Robert Lee', 'Flight Attendant', 'PTY', 3, 'Domestic', 'r.lee@copa.com', '555-0121', '2021-11-22', 46800.00, 'active')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('   ✅ Seeded 9 crew members\n');

    console.log('📦 Seeding trips...');
    await client.query(`
      INSERT INTO trips (id, trip_date, route, flight_numbers, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id)
      VALUES
        ('CM100', '2024-11-23', 'BUR → PTY', 'CM100', 5.2, 6.5, 'PTY', true, '737-800', 'scheduled', 'CM001', 'CM003', 'FA012', 'FA015'),
        ('CM450', '2024-11-22', 'PTY → LAX → PTY', 'CM450, CM451', 8.4, 10.2, 'LAX', true, '737-MAX', 'cancelled', 'CM004', 'CM006', 'FA020', 'FA021'),
        ('CM230', '2024-11-22', 'PTY → MIA → PTY', 'CM230, CM231', 6.8, 8.5, 'MIA', true, '737-800', 'delayed', 'CM002', 'CM003', 'FA012', 'FA020'),
        ('CM105', '2024-11-25', 'BUR → PTY', 'CM105', 5.2, 6.5, 'PTY', true, '737-800', 'scheduled', 'CM001', 'CM003', 'FA015', 'FA021'),
        ('CM777', '2024-12-25', 'PTY → LAX', 'CM777', 5.8, 7.2, 'LAX', true, '737-MAX', 'scheduled', null, null, null, null),
        ('CM460', '2024-11-22', 'PTY → SFO', 'CM460', 6.2, 7.8, 'SFO', true, '737-MAX', 'scheduled', 'CM004', 'CM002', 'FA020', 'FA012')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('   ✅ Seeded 6 trips\n');

    console.log('📦 Seeding pay claims...');
    await client.query(`
      INSERT INTO pay_claims (id, crew_id, claim_type, trip_id, claim_date, amount, status, ai_validated, ai_explanation, contract_reference)
      VALUES
        ('CLM-2024-1156', 'CM001', 'International Premium', 'CM450', '2024-11-18', 125.00, 'approved', true, 'Flight CM450 to GUA (Guatemala) qualifies for international premium per CBA Section 12.4', 'CBA Section 12.4'),
        ('CLM-2024-1157', 'CM002', 'Per Diem', 'CM230', '2024-11-19', 75.00, 'approved', true, 'Portland overnight qualifies for domestic per diem rate: 1 night × $75', 'CBA Section 13.2'),
        ('CLM-2024-1158', 'CM001', 'International Premium', 'CM100', '2024-11-20', 125.00, 'pending', true, 'Panama City international destination per CBA Section 12.4', 'CBA Section 12.4'),
        ('CLM-2024-1159', 'CM004', 'Holiday Pay', 'CM450', '2024-11-28', 75.00, 'approved', true, 'Thanksgiving Day premium per CBA Section 15.2', 'CBA Section 15.2'),
        ('CLM-2024-1160', 'CM002', 'International Premium', 'CM460', '2024-11-21', 125.00, 'pending', true, 'Costa Rica international destination per CBA Section 12.4', 'CBA Section 12.4')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('   ✅ Seeded 5 pay claims\n');

    console.log('📦 Seeding training records...');
    await client.query(`
      INSERT INTO training_records (crew_id, training_type, qualification, completed_date, expiry_date, next_due_date, status)
      VALUES
        ('CM001', 'Recurrent', '737-800', '2023-12-01', '2025-12-01', '2025-11-08', 'expiring-soon'),
        ('CM002', 'Initial', '737-MAX', '2021-10-15', '2025-10-15', '2025-09-01', 'current'),
        ('CM004', 'Line Check', '737-MAX', '2024-06-15', '2025-06-15', '2025-05-01', 'current'),
        ('FA012', 'Emergency Equipment', 'International', '2024-03-10', '2025-03-10', '2025-02-01', 'current')
      ON CONFLICT DO NOTHING;
    `);
    console.log('   ✅ Seeded 4 training records\n');

    console.log('📦 Seeding disruptions...');
    await client.query(`
      INSERT INTO disruptions (disruption_type, severity, affected_flight_id, disruption_start, description, status)
      VALUES
        ('cancellation', 'critical', 'CM450', '2024-11-22 08:00:00', 'Mechanical issue - aircraft unserviceable', 'open'),
        ('delay', 'moderate', 'CM230', '2024-11-22 14:30:00', 'Weather delay at PTY - 2 hour delay', 'open');
    `);
    console.log('   ✅ Seeded 2 disruptions\n');

    console.log('📦 Seeding compliance violations...');
    await client.query(`
      INSERT INTO compliance_violations (violation_type, crew_id, trip_id, severity, description, contract_section, status)
      VALUES
        ('Duty Time Exceeded', 'CM002', 'CM230', 'warning', 'Crew exceeded 12hr duty day (12.3hrs) due to delay', 'CBA Section 15.3', 'open'),
        ('Rest Period Violation', 'CM006', NULL, 'moderate', 'Reserve crew called with less than 10hrs rest', 'CBA Section 18.2', 'acknowledged')
      ON CONFLICT DO NOTHING;
    `);
    console.log('   ✅ Seeded 2 compliance violations\n');

    // Summary
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM crew_members'),
      client.query('SELECT COUNT(*) as count FROM trips'),
      client.query('SELECT COUNT(*) as count FROM pay_claims'),
      client.query('SELECT COUNT(*) as count FROM training_records'),
      client.query('SELECT COUNT(*) as count FROM disruptions'),
      client.query('SELECT COUNT(*) as count FROM compliance_violations')
    ]);

    console.log('================================');
    console.log('📊 Seeding Summary');
    console.log('================================');
    console.log(`👥 Crew Members: ${counts[0].rows[0].count}`);
    console.log(`✈️  Trips: ${counts[1].rows[0].count}`);
    console.log(`💰 Pay Claims: ${counts[2].rows[0].count}`);
    console.log(`📚 Training Records: ${counts[3].rows[0].count}`);
    console.log(`⚠️  Disruptions: ${counts[4].rows[0].count}`);
    console.log(`🚨 Compliance Violations: ${counts[5].rows[0].count}`);
    console.log('\n🎉 Database seeding completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.message.length > 200) {
      console.error(`   Error: ${error.message.substring(0, 200)}...`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedDatabase().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

