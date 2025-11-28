-- ============================================================================
-- MINIMAL AIRLINE STANDARD ENHANCEMENTS
-- Only essential tables for real-world airline payroll and operations
-- ============================================================================
-- Run this AFTER base_schema.sql, admin_schema.sql, and crew_scheduling_schema.sql
-- ============================================================================

-- ============================================================================
-- PART 1: PAY RATES (Essential for payroll calculations)
-- ============================================================================

-- Pay rates by role and seniority (simplified - no aircraft-specific rates)
CREATE TABLE IF NOT EXISTS pay_rates (
    rate_id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL, -- 'Captain', 'First Officer', 'Flight Attendant'
    seniority_min INTEGER NOT NULL,
    seniority_max INTEGER, -- NULL for open-ended
    hourly_rate DECIMAL(10,2) NOT NULL,
    monthly_guarantee DECIMAL(10,2), -- Minimum monthly pay
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pay_rates_role ON pay_rates(role);
CREATE INDEX IF NOT EXISTS idx_pay_rates_active ON pay_rates(is_active);

-- ============================================================================
-- PART 2: TAX PROFILES (Essential for payroll tax calculations)
-- ============================================================================

-- Tax withholding profiles
CREATE TABLE IF NOT EXISTS tax_profiles (
    profile_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    tax_year INTEGER NOT NULL,
    filing_status VARCHAR(20) NOT NULL, -- 'single', 'married_joint', 'married_separate', 'head_of_household'
    federal_allowances INTEGER DEFAULT 0,
    state_code VARCHAR(2), -- US state code
    state_allowances INTEGER DEFAULT 0,
    additional_withholding DECIMAL(10,2) DEFAULT 0,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(crew_id, tax_year)
);

CREATE INDEX IF NOT EXISTS idx_tax_profiles_crew ON tax_profiles(crew_id);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_year ON tax_profiles(tax_year);

-- ============================================================================
-- PART 3: PAYROLL RECORDS (Essential - what was actually paid)
-- ============================================================================

-- Pay periods
CREATE TABLE IF NOT EXISTS pay_periods (
    period_id SERIAL PRIMARY KEY,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    pay_date DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'biweekly', -- 'biweekly', 'monthly'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'processing', 'closed', 'paid'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(period_start_date, period_end_date)
);

CREATE INDEX IF NOT EXISTS idx_pay_periods_dates ON pay_periods(period_start_date, period_end_date);
CREATE INDEX IF NOT EXISTS idx_pay_periods_status ON pay_periods(status);

-- Payroll records (what was paid to each crew member)
CREATE TABLE IF NOT EXISTS payroll_records (
    payroll_id SERIAL PRIMARY KEY,
    period_id INTEGER NOT NULL REFERENCES pay_periods(period_id),
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    -- Earnings
    gross_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    -- Taxes (from tax_profiles)
    federal_tax DECIMAL(10,2) DEFAULT 0,
    state_tax DECIMAL(10,2) DEFAULT 0,
    local_tax DECIMAL(10,2) DEFAULT 0,
    social_security DECIMAL(10,2) DEFAULT 0,
    medicare DECIMAL(10,2) DEFAULT 0,
    -- Deductions (simplified - just totals)
    other_deductions DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    -- Net
    net_pay DECIMAL(10,2) NOT NULL DEFAULT 0,
    -- Metadata
    flight_hours DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'finalized', 'paid'
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_records_period ON payroll_records(period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_crew ON payroll_records(crew_id);
CREATE INDEX IF NOT EXISTS idx_payroll_records_status ON payroll_records(status);

-- ============================================================================
-- PART 4: PER DIEM RATES (Essential - currently hardcoded)
-- ============================================================================

-- Per diem rates by location
CREATE TABLE IF NOT EXISTS per_diem_rates (
    rate_id SERIAL PRIMARY KEY,
    location_code VARCHAR(10) NOT NULL, -- Airport code
    location_name VARCHAR(200) NOT NULL,
    location_type VARCHAR(20) NOT NULL, -- 'domestic', 'international'
    rate_per_day DECIMAL(10,2) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_per_diem_rates_location ON per_diem_rates(location_code);
CREATE INDEX IF NOT EXISTS idx_per_diem_rates_active ON per_diem_rates(is_active);

-- ============================================================================
-- PART 5: BANK ACCOUNTS (Essential for direct deposit)
-- ============================================================================

-- Bank accounts for direct deposit
CREATE TABLE IF NOT EXISTS bank_accounts (
    account_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    account_type VARCHAR(20) NOT NULL DEFAULT 'checking', -- 'checking', 'savings'
    bank_name VARCHAR(200) NOT NULL,
    bank_routing_number VARCHAR(20) NOT NULL,
    account_number_encrypted VARCHAR(500) NOT NULL, -- Encrypted
    is_primary BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_crew ON bank_accounts(crew_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);

-- ============================================================================
-- PART 6: ACTUAL FLIGHT TIMES (Essential for accurate payroll)
-- ============================================================================

-- Flight logs (actual vs scheduled times)
CREATE TABLE IF NOT EXISTS flight_logs (
    log_id SERIAL PRIMARY KEY,
    trip_id VARCHAR(20) REFERENCES trips(id),
    flight_number VARCHAR(20) NOT NULL,
    scheduled_departure_time TIMESTAMP NOT NULL,
    scheduled_arrival_time TIMESTAMP NOT NULL,
    actual_departure_time TIMESTAMP,
    actual_arrival_time TIMESTAMP,
    actual_flight_time_minutes INTEGER,
    delay_minutes INTEGER DEFAULT 0,
    delay_code VARCHAR(20), -- 'weather', 'maintenance', 'crew', 'ATC'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flight_logs_trip ON flight_logs(trip_id);
CREATE INDEX IF NOT EXISTS idx_flight_logs_flight_number ON flight_logs(flight_number);

-- ============================================================================
-- PART 7: LEAVE BALANCES (Basic HR requirement)
-- ============================================================================

-- Leave balances (simplified - just vacation and sick)
CREATE TABLE IF NOT EXISTS leave_balances (
    balance_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    leave_type VARCHAR(20) NOT NULL, -- 'vacation', 'sick', 'personal'
    accrued_hours DECIMAL(10,2) DEFAULT 0,
    used_hours DECIMAL(10,2) DEFAULT 0,
    available_hours DECIMAL(10,2) DEFAULT 0,
    balance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(crew_id, leave_type, balance_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_balances_crew ON leave_balances(crew_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_type ON leave_balances(leave_type);

-- ============================================================================
-- PART 8: BIDDING SYSTEM (Essential for crew scheduling)
-- ============================================================================

-- Bid periods (bidding windows)
CREATE TABLE IF NOT EXISTS bid_periods (
    bid_period_id SERIAL PRIMARY KEY,
    period_name VARCHAR(200) NOT NULL,
    period_start_date DATE NOT NULL,
    period_end_date DATE NOT NULL,
    bid_open_date TIMESTAMP NOT NULL,
    bid_close_date TIMESTAMP NOT NULL,
    award_date DATE, -- When bids are awarded
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'open', 'closed', 'awarded'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bid_periods_dates ON bid_periods(period_start_date, period_end_date);
CREATE INDEX IF NOT EXISTS idx_bid_periods_status ON bid_periods(status);

-- Bid lines (available lines to bid on)
CREATE TABLE IF NOT EXISTS bid_lines (
    line_id SERIAL PRIMARY KEY,
    bid_period_id INTEGER NOT NULL REFERENCES bid_periods(bid_period_id),
    line_number VARCHAR(50) NOT NULL,
    line_value DECIMAL(10,2), -- Monthly line value (credit hours)
    base VARCHAR(10) NOT NULL,
    aircraft_type VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bid_period_id, line_number)
);

CREATE INDEX IF NOT EXISTS idx_bid_lines_period ON bid_lines(bid_period_id);
CREATE INDEX IF NOT EXISTS idx_bid_lines_base ON bid_lines(base);

-- Bid submissions (crew member bids)
CREATE TABLE IF NOT EXISTS bid_submissions (
    submission_id SERIAL PRIMARY KEY,
    bid_period_id INTEGER NOT NULL REFERENCES bid_periods(bid_period_id),
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    bid_rank INTEGER NOT NULL, -- 1 = first choice, 2 = second choice, etc.
    line_id INTEGER REFERENCES bid_lines(line_id),
    submitted_at TIMESTAMP DEFAULT NOW(),
    is_withdrawn BOOLEAN DEFAULT false,
    UNIQUE(bid_period_id, crew_id, bid_rank)
);

CREATE INDEX IF NOT EXISTS idx_bid_submissions_period ON bid_submissions(bid_period_id);
CREATE INDEX IF NOT EXISTS idx_bid_submissions_crew ON bid_submissions(crew_id);
CREATE INDEX IF NOT EXISTS idx_bid_submissions_line ON bid_submissions(line_id);

-- Bid awards (final award results)
CREATE TABLE IF NOT EXISTS bid_awards (
    award_id SERIAL PRIMARY KEY,
    bid_period_id INTEGER NOT NULL REFERENCES bid_periods(bid_period_id),
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    line_id INTEGER NOT NULL REFERENCES bid_lines(line_id),
    award_rank INTEGER, -- Seniority rank used for award
    awarded_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(bid_period_id, crew_id)
);

CREATE INDEX IF NOT EXISTS idx_bid_awards_period ON bid_awards(bid_period_id);
CREATE INDEX IF NOT EXISTS idx_bid_awards_crew ON bid_awards(crew_id);
CREATE INDEX IF NOT EXISTS idx_bid_awards_line ON bid_awards(line_id);

-- ============================================================================
-- PART 9: ENHANCED CREW MEMBER FIELDS (Essential fields only)
-- ============================================================================

DO $$ 
BEGIN
    -- Employee number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crew_members' AND column_name='employee_number') THEN
        ALTER TABLE crew_members ADD COLUMN employee_number VARCHAR(50) UNIQUE;
    END IF;
    
    -- Pay rate reference (which pay rate applies)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crew_members' AND column_name='pay_rate_id') THEN
        ALTER TABLE crew_members ADD COLUMN pay_rate_id INTEGER;
    END IF;
    
    -- Union membership (simple boolean + code)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crew_members' AND column_name='union_member') THEN
        ALTER TABLE crew_members ADD COLUMN union_member BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crew_members' AND column_name='union_code') THEN
        ALTER TABLE crew_members ADD COLUMN union_code VARCHAR(20);
    END IF;
    
    -- Pay frequency
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='crew_members' AND column_name='pay_frequency') THEN
        ALTER TABLE crew_members ADD COLUMN pay_frequency VARCHAR(20) DEFAULT 'biweekly';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_crew_members_employee_number ON crew_members(employee_number);
CREATE INDEX IF NOT EXISTS idx_crew_members_pay_rate ON crew_members(pay_rate_id);

-- ============================================================================
-- PART 10: ENHANCED TRIP FIELDS (Essential for accurate payroll)
-- ============================================================================

DO $$ 
BEGIN
    -- Actual times
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='actual_departure_time') THEN
        ALTER TABLE trips ADD COLUMN actual_departure_time TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='actual_arrival_time') THEN
        ALTER TABLE trips ADD COLUMN actual_arrival_time TIMESTAMP;
    END IF;
    
    -- Actual flight time
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='actual_flight_time_hours') THEN
        ALTER TABLE trips ADD COLUMN actual_flight_time_hours DECIMAL(5,2);
    END IF;
    
    -- Delay information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='delay_minutes') THEN
        ALTER TABLE trips ADD COLUMN delay_minutes INTEGER DEFAULT 0;
    END IF;
    
    -- Aircraft registration (tail number)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='trips' AND column_name='aircraft_registration') THEN
        ALTER TABLE trips ADD COLUMN aircraft_registration VARCHAR(20);
    END IF;
END $$;

-- ============================================================================
-- PART 11: LINK PAY CLAIMS TO PAYROLL (Essential mapping)
-- ============================================================================

DO $$ 
BEGIN
    -- Link claims to payroll records
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='payroll_id') THEN
        ALTER TABLE pay_claims ADD COLUMN payroll_id INTEGER REFERENCES payroll_records(payroll_id);
    END IF;
    
    -- Link payment items to payroll records
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_items' AND column_name='payroll_id') THEN
        ALTER TABLE payment_items ADD COLUMN payroll_id INTEGER REFERENCES payroll_records(payroll_id);
    END IF;
END $$;

-- ============================================================================
-- PART 12: FOREIGN KEY CONSTRAINTS (Data integrity)
-- ============================================================================

DO $$ 
BEGIN
    -- Ensure pay_claims has proper foreign keys
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pay_claims_crew_id_fkey' 
        AND table_name = 'pay_claims'
    ) THEN
        ALTER TABLE pay_claims 
        ADD CONSTRAINT pay_claims_crew_id_fkey 
        FOREIGN KEY (crew_id) REFERENCES crew_members(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'pay_claims_trip_id_fkey' 
        AND table_name = 'pay_claims'
    ) THEN
        ALTER TABLE pay_claims 
        ADD CONSTRAINT pay_claims_trip_id_fkey 
        FOREIGN KEY (trip_id) REFERENCES trips(id);
    END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This minimal migration adds only essential tables:
-- 1. pay_rates - What to pay crew
-- 2. tax_profiles - Tax withholding information
-- 3. pay_periods & payroll_records - What was actually paid (with taxes)
-- 4. per_diem_rates - Per diem by location (currently hardcoded)
-- 5. bank_accounts - Direct deposit info
-- 6. flight_logs - Actual flight times
-- 7. leave_balances - Basic leave tracking
-- 8. bid_periods, bid_lines, bid_submissions, bid_awards - Bidding system
-- 9. Enhanced crew_members fields - Essential fields only
-- 10. Enhanced trips fields - Actual times and delays
-- 11. Links between claims and payroll
-- ============================================================================
