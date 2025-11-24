-- Crew Scheduling System Database Schema
-- Supports regulatory compliance, roster generation, and disruption management

-- ============================================================================
-- CREW MASTER DATA & QUALIFICATIONS
-- ============================================================================

-- Crew qualifications table (extends crew_members)
CREATE TABLE IF NOT EXISTS crew_qualifications (
    qualification_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    qualification_type VARCHAR(50) NOT NULL, -- 'aircraft_type', 'equipment', 'route', 'instructor', 'examiner'
    qualification_code VARCHAR(50) NOT NULL, -- e.g., 'B737', 'B787', 'ATL-LAX', 'INSTRUCTOR'
    issued_date DATE,
    expiry_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'suspended'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_qualifications_crew ON crew_qualifications(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_qualifications_type ON crew_qualifications(qualification_type);
CREATE INDEX IF NOT EXISTS idx_crew_qualifications_status ON crew_qualifications(status);

-- Crew availability and leave
CREATE TABLE IF NOT EXISTS crew_availability (
    availability_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    availability_type VARCHAR(50) NOT NULL, -- 'available', 'leave', 'reserve', 'standby', 'training', 'medical'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_availability_crew ON crew_availability(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_availability_dates ON crew_availability(start_date, end_date);

-- Crew duty and flight time history
CREATE TABLE IF NOT EXISTS crew_duty_history (
    duty_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    duty_date DATE NOT NULL,
    duty_start_time TIMESTAMP NOT NULL,
    duty_end_time TIMESTAMP,
    flight_time_hours DECIMAL(5,2),
    duty_time_hours DECIMAL(5,2),
    rest_hours DECIMAL(5,2),
    trip_id VARCHAR(20),
    pairing_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_duty_history_crew ON crew_duty_history(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_duty_history_date ON crew_duty_history(duty_date);
CREATE INDEX IF NOT EXISTS idx_crew_duty_history_trip ON crew_duty_history(trip_id);

-- ============================================================================
-- REGULATORY RULES ENGINE
-- ============================================================================

-- Regulatory rule definitions
CREATE TABLE IF NOT EXISTS regulatory_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(200) NOT NULL,
    rule_type VARCHAR(50) NOT NULL, -- 'flight_time', 'duty_time', 'rest', 'annual', 'monthly', 'weekly'
    jurisdiction VARCHAR(50) NOT NULL, -- 'FAA_DOMESTIC', 'FAA_INTERNATIONAL', 'EASA', 'CUSTOM'
    rule_category VARCHAR(50), -- 'annual_limit', 'monthly_limit', '7day_limit', 'rest_minimum'
    limit_value DECIMAL(10,2),
    limit_unit VARCHAR(20), -- 'hours', 'days', 'flights'
    period_type VARCHAR(20), -- 'rolling', 'calendar', 'fixed'
    conditions JSONB, -- Additional conditions and exceptions
    is_active BOOLEAN DEFAULT true,
    effective_date DATE,
    expiry_date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_regulatory_rules_type ON regulatory_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_regulatory_rules_jurisdiction ON regulatory_rules(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_regulatory_rules_active ON regulatory_rules(is_active);

-- Rule evaluation audit trail
CREATE TABLE IF NOT EXISTS rule_evaluations (
    evaluation_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) REFERENCES crew_members(id),
    rule_id INTEGER REFERENCES regulatory_rules(rule_id),
    evaluation_date DATE NOT NULL,
    evaluation_type VARCHAR(50) NOT NULL, -- 'scheduling', 'disruption', 'audit', 'whatif'
    current_value DECIMAL(10,2),
    limit_value DECIMAL(10,2),
    is_compliant BOOLEAN NOT NULL,
    violation_severity VARCHAR(20), -- 'none', 'warning', 'minor', 'major', 'critical'
    violation_details JSONB,
    suggested_adjustments JSONB,
    evaluated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rule_evaluations_crew ON rule_evaluations(crew_id);
CREATE INDEX IF NOT EXISTS idx_rule_evaluations_date ON rule_evaluations(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_rule_evaluations_compliant ON rule_evaluations(is_compliant);

-- Rule overrides (with justification)
CREATE TABLE IF NOT EXISTS rule_overrides (
    override_id SERIAL PRIMARY KEY,
    evaluation_id INTEGER REFERENCES rule_evaluations(evaluation_id),
    crew_id VARCHAR(20) REFERENCES crew_members(id),
    rule_id INTEGER REFERENCES regulatory_rules(rule_id),
    override_reason TEXT NOT NULL,
    approved_by VARCHAR(100) NOT NULL,
    approval_date TIMESTAMP DEFAULT NOW(),
    expiry_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rule_overrides_crew ON rule_overrides(crew_id);
CREATE INDEX IF NOT EXISTS idx_rule_overrides_active ON rule_overrides(is_active);

-- ============================================================================
-- ROSTER GENERATION & PLANNING
-- ============================================================================

-- Pairings/Trips (sequences of flights)
CREATE TABLE IF NOT EXISTS pairings (
    pairing_id VARCHAR(50) PRIMARY KEY,
    pairing_name VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_base VARCHAR(50) NOT NULL,
    end_base VARCHAR(50) NOT NULL,
    total_flight_hours DECIMAL(5,2),
    total_credit_hours DECIMAL(5,2),
    total_duty_hours DECIMAL(5,2),
    layover_cities TEXT[],
    aircraft_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'published', 'active', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pairings_dates ON pairings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_pairings_status ON pairings(status);

-- Pairing flights (links pairings to trips/flights)
CREATE TABLE IF NOT EXISTS pairing_flights (
    pairing_flight_id SERIAL PRIMARY KEY,
    pairing_id VARCHAR(50) NOT NULL REFERENCES pairings(pairing_id),
    trip_id VARCHAR(20) REFERENCES trips(id),
    sequence_number INTEGER NOT NULL,
    flight_number VARCHAR(20),
    departure_airport VARCHAR(10),
    arrival_airport VARCHAR(10),
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pairing_flights_pairing ON pairing_flights(pairing_id);
CREATE INDEX IF NOT EXISTS idx_pairing_flights_trip ON pairing_flights(trip_id);

-- Roster assignments
CREATE TABLE IF NOT EXISTS roster_assignments (
    assignment_id SERIAL PRIMARY KEY,
    roster_period_start DATE NOT NULL,
    roster_period_end DATE NOT NULL,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    pairing_id VARCHAR(50) REFERENCES pairings(pairing_id),
    trip_id VARCHAR(20) REFERENCES trips(id),
    assignment_type VARCHAR(50) NOT NULL, -- 'pairing', 'reserve', 'standby', 'training', 'leave'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'modified'
    assignment_rank INTEGER, -- For seniority-based assignment
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roster_assignments_crew ON roster_assignments(crew_id);
CREATE INDEX IF NOT EXISTS idx_roster_assignments_period ON roster_assignments(roster_period_start, roster_period_end);
CREATE INDEX IF NOT EXISTS idx_roster_assignments_dates ON roster_assignments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_roster_assignments_status ON roster_assignments(status);

-- Roster versions (for what-if scenarios)
CREATE TABLE IF NOT EXISTS roster_versions (
    version_id SERIAL PRIMARY KEY,
    roster_period_start DATE NOT NULL,
    roster_period_end DATE NOT NULL,
    version_name VARCHAR(200),
    version_type VARCHAR(50) DEFAULT 'draft', -- 'draft', 'whatif', 'published', 'archived'
    optimization_objectives JSONB, -- e.g., {'cost': 'minimize', 'utilization': 'maximize', 'fairness': 'balance'}
    total_cost DECIMAL(12,2),
    total_violations INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_roster_versions_period ON roster_versions(roster_period_start, roster_period_end);
CREATE INDEX IF NOT EXISTS idx_roster_versions_active ON roster_versions(is_active);

-- ============================================================================
-- DISRUPTION MANAGEMENT
-- ============================================================================

-- Disruption events
CREATE TABLE IF NOT EXISTS disruptions (
    disruption_id SERIAL PRIMARY KEY,
    disruption_type VARCHAR(50) NOT NULL, -- 'delay', 'cancellation', 'crew_unavailable', 'aircraft_change', 'weather'
    severity VARCHAR(20) NOT NULL, -- 'minor', 'moderate', 'major', 'critical'
    affected_flight_id VARCHAR(20),
    affected_pairing_id VARCHAR(50),
    affected_crew_ids VARCHAR(20)[],
    disruption_start TIMESTAMP NOT NULL,
    disruption_end TIMESTAMP,
    root_cause VARCHAR(200),
    description TEXT,
    impact_assessment JSONB, -- {'affected_flights': [], 'affected_crew': [], 'cost_impact': 0}
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'assigned', 'resolved', 'escalated'
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_disruptions_type ON disruptions(disruption_type);
CREATE INDEX IF NOT EXISTS idx_disruptions_status ON disruptions(status);
CREATE INDEX IF NOT EXISTS idx_disruptions_start ON disruptions(disruption_start);

-- Disruption reassignments
CREATE TABLE IF NOT EXISTS disruption_reassignments (
    reassignment_id SERIAL PRIMARY KEY,
    disruption_id INTEGER NOT NULL REFERENCES disruptions(disruption_id),
    original_assignment_id INTEGER REFERENCES roster_assignments(assignment_id),
    new_assignment_id INTEGER REFERENCES roster_assignments(assignment_id),
    original_crew_id VARCHAR(20) REFERENCES crew_members(id),
    replacement_crew_id VARCHAR(20) REFERENCES crew_members(id),
    reassignment_reason TEXT,
    cost_impact DECIMAL(10,2),
    compliance_status VARCHAR(20), -- 'compliant', 'override', 'pending_review'
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disruption_reassignments_disruption ON disruption_reassignments(disruption_id);
CREATE INDEX IF NOT EXISTS idx_disruption_reassignments_crew ON disruption_reassignments(replacement_crew_id);

-- ============================================================================
-- CREW SELF-SERVICE
-- ============================================================================

-- Crew leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
    request_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    leave_type VARCHAR(50) NOT NULL, -- 'vacation', 'sick', 'personal', 'training'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_crew ON leave_requests(crew_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Crew swap requests
CREATE TABLE IF NOT EXISTS swap_requests (
    swap_id SERIAL PRIMARY KEY,
    requester_crew_id VARCHAR(20) NOT NULL REFERENCES crew_members(id),
    target_crew_id VARCHAR(20) REFERENCES crew_members(id),
    requester_assignment_id INTEGER REFERENCES roster_assignments(assignment_id),
    target_assignment_id INTEGER REFERENCES roster_assignments(assignment_id),
    swap_type VARCHAR(50), -- 'direct_swap', 'open_bid', 'partial'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    approval_required BOOLEAN DEFAULT true,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_swap_requests_requester ON swap_requests(requester_crew_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON swap_requests(status);

-- Crew notifications
CREATE TABLE IF NOT EXISTS crew_notifications (
    notification_id SERIAL PRIMARY KEY,
    crew_id VARCHAR(20) REFERENCES crew_members(id), -- NULL for broadcast
    notification_type VARCHAR(50) NOT NULL, -- 'roster_published', 'assignment_change', 'disruption', 'reminder', 'rule_violation'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_notifications_crew ON crew_notifications(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_notifications_read ON crew_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_crew_notifications_created ON crew_notifications(created_at DESC);

-- ============================================================================
-- REPORTING & ANALYTICS
-- ============================================================================

-- Compliance reports cache
CREATE TABLE IF NOT EXISTS compliance_reports (
    report_id SERIAL PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL, -- 'crew', 'base', 'period', 'operation_type'
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    filter_criteria JSONB, -- {'base': 'ATL', 'crew_group': 'pilots'}
    total_violations INTEGER DEFAULT 0,
    total_warnings INTEGER DEFAULT 0,
    report_data JSONB NOT NULL,
    generated_by VARCHAR(100),
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON compliance_reports(report_period_start, report_period_end);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports(report_type);

-- Utilization reports
CREATE TABLE IF NOT EXISTS utilization_reports (
    report_id SERIAL PRIMARY KEY,
    report_period_start DATE NOT NULL,
    report_period_end DATE NOT NULL,
    crew_group VARCHAR(50), -- 'pilots', 'cabin_crew', 'all'
    base VARCHAR(50),
    total_crew INTEGER,
    total_flight_hours DECIMAL(10,2),
    total_duty_hours DECIMAL(10,2),
    avg_utilization DECIMAL(5,2),
    reserve_usage DECIMAL(5,2),
    overtime_hours DECIMAL(10,2),
    report_data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utilization_reports_period ON utilization_reports(report_period_start, report_period_end);

-- Disruption analysis
CREATE TABLE IF NOT EXISTS disruption_analysis (
    analysis_id SERIAL PRIMARY KEY,
    analysis_period_start DATE NOT NULL,
    analysis_period_end DATE NOT NULL,
    total_disruptions INTEGER DEFAULT 0,
    disruptions_by_type JSONB,
    disruptions_by_severity JSONB,
    avg_resolution_time_minutes INTEGER,
    total_cost_impact DECIMAL(12,2),
    root_causes JSONB,
    analysis_data JSONB NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disruption_analysis_period ON disruption_analysis(analysis_period_start, analysis_period_end);
