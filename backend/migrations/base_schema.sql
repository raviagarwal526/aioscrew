-- Base Database Schema Migration
-- Core tables required before other migrations
-- Run this FIRST before admin_schema.sql and crew_scheduling_schema.sql

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Crew members table
CREATE TABLE IF NOT EXISTS crew_members (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    base VARCHAR(10) NOT NULL,
    seniority INTEGER NOT NULL,
    qualification VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hire_date DATE NOT NULL,
    ytd_earnings DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crew_members_email ON crew_members(email);
CREATE INDEX IF NOT EXISTS idx_crew_members_role ON crew_members(role);
CREATE INDEX IF NOT EXISTS idx_crew_members_base ON crew_members(base);
CREATE INDEX IF NOT EXISTS idx_crew_members_status ON crew_members(status);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(20) PRIMARY KEY,
    trip_date DATE NOT NULL,
    route VARCHAR(100) NOT NULL,
    flight_numbers VARCHAR(100),
    departure_time TIME,
    arrival_time TIME,
    flight_time_hours DECIMAL(5,2),
    credit_hours DECIMAL(5,2),
    layover_city VARCHAR(50),
    is_international BOOLEAN DEFAULT false,
    aircraft_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'scheduled',
    captain_id VARCHAR(20),
    first_officer_id VARCHAR(20),
    senior_fa_id VARCHAR(20),
    junior_fa_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(trip_date);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_captain ON trips(captain_id);
CREATE INDEX IF NOT EXISTS idx_trips_first_officer ON trips(first_officer_id);

-- Pay claims table (base structure)
CREATE TABLE IF NOT EXISTS pay_claims (
    id VARCHAR(20) PRIMARY KEY,
    crew_id VARCHAR(20),
    claim_type VARCHAR(50) NOT NULL,
    trip_id VARCHAR(20),
    claim_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    ai_validated BOOLEAN DEFAULT false,
    ai_explanation TEXT,
    contract_reference VARCHAR(100),
    submitted_by VARCHAR(100),
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pay_claims_crew ON pay_claims(crew_id);
CREATE INDEX IF NOT EXISTS idx_pay_claims_trip ON pay_claims(trip_id);
CREATE INDEX IF NOT EXISTS idx_pay_claims_date ON pay_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_pay_claims_status ON pay_claims(status);
CREATE INDEX IF NOT EXISTS idx_pay_claims_type ON pay_claims(claim_type);

-- Training records table
CREATE TABLE IF NOT EXISTS training_records (
    id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20),
    training_type VARCHAR(100) NOT NULL,
    qualification VARCHAR(50),
    completed_date DATE,
    expiry_date DATE,
    next_due_date DATE,
    status VARCHAR(20) DEFAULT 'current',
    instructor VARCHAR(100),
    score INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_records_crew ON training_records(crew_id);
CREATE INDEX IF NOT EXISTS idx_training_records_status ON training_records(status);
CREATE INDEX IF NOT EXISTS idx_training_records_expiry ON training_records(expiry_date);

-- Note: disruptions table is created in crew_scheduling_schema.sql with a more complete structure

-- Compliance violations table
CREATE TABLE IF NOT EXISTS compliance_violations (
    id SERIAL PRIMARY KEY,
    violation_type VARCHAR(100) NOT NULL,
    crew_id VARCHAR(20),
    trip_id VARCHAR(20),
    severity VARCHAR(20),
    description TEXT,
    contract_section VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_violations_crew ON compliance_violations(crew_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_trip ON compliance_violations(trip_id);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_status ON compliance_violations(status);

