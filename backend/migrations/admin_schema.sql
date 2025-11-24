-- Payroll Admin Database Schema Migration
-- Run this on Neon PostgreSQL database

-- ============================================================================
-- PART 1: CLAIMS REVIEW TABLES
-- ============================================================================

-- Enhanced claims table (extends existing pay_claims table)
-- Note: This assumes pay_claims table already exists
-- We'll add columns if they don't exist

DO $$ 
BEGIN
    -- Add admin-specific columns to claims if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='status') THEN
        ALTER TABLE pay_claims ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='priority') THEN
        ALTER TABLE pay_claims ADD COLUMN priority VARCHAR(10) DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='reviewed_at') THEN
        ALTER TABLE pay_claims ADD COLUMN reviewed_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='reviewed_by') THEN
        ALTER TABLE pay_claims ADD COLUMN reviewed_by VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='resolution_time_hours') THEN
        ALTER TABLE pay_claims ADD COLUMN resolution_time_hours DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='ai_confidence') THEN
        ALTER TABLE pay_claims ADD COLUMN ai_confidence DECIMAL(3,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='ai_recommendation') THEN
        ALTER TABLE pay_claims ADD COLUMN ai_recommendation VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='ai_reasoning') THEN
        ALTER TABLE pay_claims ADD COLUMN ai_reasoning TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='contract_references') THEN
        ALTER TABLE pay_claims ADD COLUMN contract_references TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pay_claims' AND column_name='amount_approved') THEN
        ALTER TABLE pay_claims ADD COLUMN amount_approved DECIMAL(10,2);
    END IF;
END $$;

-- Agent activity log
CREATE TABLE IF NOT EXISTS agent_activity_log (
    activity_id SERIAL PRIMARY KEY,
    claim_id VARCHAR(20) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL, -- 'started', 'completed', 'failed', 'escalated'
    processing_time_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    confidence_score DECIMAL(3,2),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_claim ON agent_activity_log(claim_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created ON agent_activity_log(created_at DESC);

-- Claim evidence
CREATE TABLE IF NOT EXISTS claim_evidence (
    evidence_id SERIAL PRIMARY KEY,
    claim_id VARCHAR(20) NOT NULL,
    evidence_type VARCHAR(50) NOT NULL, -- 'flight_data', 'schedule', 'acars', 'contract_rule', 'calculation'
    source VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim ON claim_evidence(claim_id);

-- Admin actions
CREATE TABLE IF NOT EXISTS admin_actions (
    action_id SERIAL PRIMARY KEY,
    claim_id VARCHAR(20) NOT NULL,
    admin_id VARCHAR(20) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'override', 'comment', 'escalate'
    reason TEXT,
    override_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_claim ON admin_actions(claim_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);

-- ============================================================================
-- PART 2: PAYMENTS TABLES
-- ============================================================================

-- Payment batches
CREATE TABLE IF NOT EXISTS payment_batches (
    batch_id VARCHAR(20) PRIMARY KEY,
    batch_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    total_claims INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    processed_by VARCHAR(100),
    processed_at TIMESTAMP,
    export_file_path VARCHAR(500),
    payroll_system_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_batches_date ON payment_batches(batch_date DESC);
CREATE INDEX IF NOT EXISTS idx_payment_batches_status ON payment_batches(status);

-- Payment items
CREATE TABLE IF NOT EXISTS payment_items (
    payment_id SERIAL PRIMARY KEY,
    batch_id VARCHAR(20) REFERENCES payment_batches(batch_id),
    claim_id VARCHAR(20) NOT NULL,
    crew_member_id VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- 'direct_deposit', 'check', 'payroll_system'
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP,
    confirmation_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_items_batch ON payment_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_payment_items_claim ON payment_items(claim_id);
CREATE INDEX IF NOT EXISTS idx_payment_items_status ON payment_items(status);

-- Payment audit trail
CREATE TABLE IF NOT EXISTS payment_audit (
    audit_id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payment_items(payment_id),
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_audit_payment ON payment_audit(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_audit_created ON payment_audit(created_at DESC);

-- ============================================================================
-- PART 3: ADMIN USERS & SETTINGS TABLES
-- ============================================================================

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
    admin_id VARCHAR(20) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'payroll_admin', 'payroll_manager', 'super_admin'
    permissions JSONB NOT NULL DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(active);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by VARCHAR(20),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Notification settings
CREATE TABLE IF NOT EXISTS notification_settings (
    setting_id SERIAL PRIMARY KEY,
    admin_id VARCHAR(20) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    channels TEXT[], -- ['email', 'sms', 'in_app']
    threshold_config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_settings_admin ON notification_settings(admin_id);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'claim', 'payment', 'user', 'config'
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    changes JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log(performed_by);

-- ============================================================================
-- PART 4: ANALYTICS VIEWS
-- ============================================================================

-- Claims analytics view
CREATE OR REPLACE VIEW claims_analytics AS
SELECT 
    DATE(claim_date) as claim_date,
    claim_type,
    COALESCE(status, 'pending') as status,
    COUNT(*) as claim_count,
    AVG(resolution_time_hours) as avg_resolution_hours,
    AVG(ai_confidence) as avg_confidence,
    SUM(amount) as total_claimed,
    SUM(COALESCE(amount_approved, amount)) as total_approved,
    COUNT(CASE WHEN status = 'auto_approved' OR status = 'ai-validated' THEN 1 END) as auto_approved_count,
    COUNT(CASE WHEN status = 'manual_review' OR status = 'needs-review' THEN 1 END) as manual_review_count
FROM pay_claims
GROUP BY DATE(claim_date), claim_type, COALESCE(status, 'pending');

-- Agent performance view
CREATE OR REPLACE VIEW agent_performance AS
SELECT 
    agent_name,
    DATE(created_at) as activity_date,
    COUNT(*) as activities_count,
    AVG(processing_time_ms) as avg_processing_time_ms,
    AVG(confidence_score) as avg_confidence,
    COUNT(CASE WHEN activity_type = 'completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN activity_type = 'failed' THEN 1 END) as failed_count
FROM agent_activity_log
GROUP BY agent_name, DATE(created_at);

-- Financial impact view
CREATE OR REPLACE VIEW financial_impact AS
SELECT 
    DATE(claim_date) as report_date,
    SUM(amount) as total_claimed,
    SUM(COALESCE(amount_approved, amount)) as total_approved,
    SUM(amount - COALESCE(amount_approved, 0)) as total_savings,
    COUNT(*) as claims_processed,
    AVG(resolution_time_hours) as avg_resolution_hours
FROM pay_claims
WHERE status IN ('approved', 'rejected', 'auto_approved', 'ai-validated')
GROUP BY DATE(claim_date);

-- ============================================================================
-- PART 5: EXCESS PAYMENT TRACKING TABLES
-- ============================================================================

-- Excess payment findings
CREATE TABLE IF NOT EXISTS excess_payment_findings (
    finding_id SERIAL PRIMARY KEY,
    claim_id VARCHAR(20) NOT NULL,
    payment_id INTEGER REFERENCES payment_items(payment_id),
    finding_type VARCHAR(50) NOT NULL, -- 'duplicate', 'overpayment', 'contract_violation', 'ineligible', 'anomaly', 'calculation_error'
    severity VARCHAR(10) NOT NULL, -- 'high', 'medium', 'low'
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    excess_amount DECIMAL(10,2) NOT NULL,
    expected_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL,
    evidence JSONB NOT NULL,
    contract_references TEXT[],
    suggested_action TEXT,
    agent_confidence DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_excess_findings_claim ON excess_payment_findings(claim_id);
CREATE INDEX IF NOT EXISTS idx_excess_findings_payment ON excess_payment_findings(payment_id);
CREATE INDEX IF NOT EXISTS idx_excess_findings_status ON excess_payment_findings(status);
CREATE INDEX IF NOT EXISTS idx_excess_findings_severity ON excess_payment_findings(severity);
CREATE INDEX IF NOT EXISTS idx_excess_findings_created ON excess_payment_findings(created_at DESC);

-- Excess payment reviews (aggregated review sessions)
CREATE TABLE IF NOT EXISTS excess_payment_reviews (
    review_id SERIAL PRIMARY KEY,
    review_date DATE NOT NULL,
    reviewed_by VARCHAR(100) NOT NULL,
    total_findings INTEGER NOT NULL,
    total_excess_amount DECIMAL(12,2) NOT NULL,
    findings_resolved INTEGER DEFAULT 0,
    findings_dismissed INTEGER DEFAULT 0,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_excess_reviews_date ON excess_payment_reviews(review_date DESC);

-- Link findings to reviews
ALTER TABLE excess_payment_findings 
ADD COLUMN IF NOT EXISTS review_id INTEGER REFERENCES excess_payment_reviews(review_id);

CREATE INDEX IF NOT EXISTS idx_excess_findings_review ON excess_payment_findings(review_id);

-- ============================================================================
-- PART 6: INITIAL DATA
-- ============================================================================

-- Insert default admin user (password should be hashed in production)
-- For now, we'll use a simple ID system
INSERT INTO admin_users (admin_id, email, full_name, role, permissions)
VALUES 
    ('ADMIN001', 'admin@copa.com', 'System Administrator', 'super_admin', '{"all": true}'::jsonb)
ON CONFLICT (admin_id) DO NOTHING;

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description)
VALUES 
    ('auto_approval_threshold', '0.85'::jsonb, 'Minimum AI confidence for auto-approval'),
    ('max_auto_approval_amount', '1000'::jsonb, 'Maximum amount for auto-approval'),
    ('agent_timeout_seconds', '30'::jsonb, 'Agent processing timeout'),
    ('max_retry_attempts', '3'::jsonb, 'Maximum retry attempts for failed agents'),
    ('sla_resolution_hours', '48'::jsonb, 'SLA target for claim resolution'),
    ('sla_payment_hours', '24'::jsonb, 'SLA target for payment processing'),
    ('sla_urgent_hours', '4'::jsonb, 'SLA target for urgent claims')
ON CONFLICT (config_key) DO NOTHING;
