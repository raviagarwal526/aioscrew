-- Manual SQL cleanup script
-- Run this in Neon SQL Editor if the cleanup script doesn't work
-- This will remove ALL data from all tables

-- Disable foreign key checks temporarily (PostgreSQL doesn't support this,
-- so we use TRUNCATE CASCADE which handles dependencies)

-- Child tables first
TRUNCATE TABLE roster_assignments CASCADE;
TRUNCATE TABLE payment_items CASCADE;
TRUNCATE TABLE payment_batches CASCADE;
TRUNCATE TABLE crew_qualifications CASCADE;
TRUNCATE TABLE disruption_reassignments CASCADE;
TRUNCATE TABLE pairing_flights CASCADE;
TRUNCATE TABLE pairings CASCADE;
TRUNCATE TABLE roster_versions CASCADE;
TRUNCATE TABLE swap_requests CASCADE;
TRUNCATE TABLE leave_requests CASCADE;
TRUNCATE TABLE crew_notifications CASCADE;
TRUNCATE TABLE compliance_reports CASCADE;
TRUNCATE TABLE utilization_reports CASCADE;
TRUNCATE TABLE disruption_analysis CASCADE;
TRUNCATE TABLE claim_evidence CASCADE;
TRUNCATE TABLE admin_actions CASCADE;
TRUNCATE TABLE payment_audit CASCADE;
TRUNCATE TABLE excess_payment_reviews CASCADE;
TRUNCATE TABLE excess_payment_findings CASCADE;
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE notification_settings CASCADE;
TRUNCATE TABLE agent_activity_log CASCADE;
TRUNCATE TABLE rule_overrides CASCADE;
TRUNCATE TABLE rule_evaluations CASCADE;
TRUNCATE TABLE regulatory_rules CASCADE;
TRUNCATE TABLE crew_duty_history CASCADE;
TRUNCATE TABLE crew_availability CASCADE;
TRUNCATE TABLE disruptions CASCADE;
TRUNCATE TABLE compliance_violations CASCADE;
TRUNCATE TABLE training_records CASCADE;
TRUNCATE TABLE pay_claims CASCADE;
TRUNCATE TABLE trips CASCADE;

-- Parent tables
TRUNCATE TABLE crew_members CASCADE;
TRUNCATE TABLE admin_users CASCADE;
TRUNCATE TABLE system_config CASCADE;

-- Verify cleanup
SELECT 
  'crew_members' as table_name, COUNT(*) as remaining FROM crew_members
UNION ALL
SELECT 'trips', COUNT(*) FROM trips
UNION ALL
SELECT 'pay_claims', COUNT(*) FROM pay_claims
UNION ALL
SELECT 'training_records', COUNT(*) FROM training_records
UNION ALL
SELECT 'compliance_violations', COUNT(*) FROM compliance_violations
UNION ALL
SELECT 'disruptions', COUNT(*) FROM disruptions
UNION ALL
SELECT 'payment_batches', COUNT(*) FROM payment_batches
UNION ALL
SELECT 'payment_items', COUNT(*) FROM payment_items
UNION ALL
SELECT 'crew_qualifications', COUNT(*) FROM crew_qualifications
UNION ALL
SELECT 'roster_assignments', COUNT(*) FROM roster_assignments
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;




