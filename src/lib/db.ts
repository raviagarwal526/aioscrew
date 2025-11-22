import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || '');

export { sql };

export async function initializeDatabase() {
  try {
    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
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
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS disruptions (
        id SERIAL PRIMARY KEY,
        trip_id VARCHAR(20),
        disruption_type VARCHAR(50) NOT NULL,
        description TEXT,
        severity VARCHAR(20),
        crew_affected INTEGER DEFAULT 0,
        resolution_status VARCHAR(20) DEFAULT 'open',
        recovery_plan TEXT,
        cost_impact DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      );
    `;

    await sql`
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
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

export async function seedDatabase() {
  try {
    const crewExists = await sql`SELECT COUNT(*) as count FROM crew_members`;
    if (crewExists[0].count > 0) {
      console.log('Database already seeded');
      return;
    }

    await sql`
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
        ('FA021', 'Robert Lee', 'Flight Attendant', 'PTY', 3, 'Domestic', 'r.lee@copa.com', '555-0121', '2021-11-22', 46800.00, 'active');
    `;

    await sql`
      INSERT INTO trips (id, trip_date, route, flight_numbers, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id)
      VALUES
        ('CM100', '2024-11-23', 'BUR → PTY', 'CM100', 5.2, 6.5, 'PTY', true, '737-800', 'scheduled', 'CM001', 'CM003', 'FA012', 'FA015'),
        ('CM450', '2024-11-22', 'PTY → LAX → PTY', 'CM450, CM451', 8.4, 10.2, 'LAX', true, '737-MAX', 'cancelled', 'CM004', 'CM006', 'FA020', 'FA021'),
        ('CM230', '2024-11-22', 'PTY → MIA → PTY', 'CM230, CM231', 6.8, 8.5, 'MIA', true, '737-800', 'delayed', 'CM002', 'CM003', 'FA012', 'FA020'),
        ('CM105', '2024-11-25', 'BUR → PTY', 'CM105', 5.2, 6.5, 'PTY', true, '737-800', 'scheduled', 'CM001', 'CM003', 'FA015', 'FA021'),
        ('CM777', '2024-12-25', 'PTY → LAX', 'CM777', 5.8, 7.2, 'LAX', true, '737-MAX', 'scheduled', null, null, null, null),
        ('CM460', '2024-11-22', 'PTY → SFO', 'CM460', 6.2, 7.8, 'SFO', true, '737-MAX', 'scheduled', 'CM004', 'CM002', 'FA020', 'FA012');
    `;

    await sql`
      INSERT INTO pay_claims (id, crew_id, claim_type, trip_id, claim_date, amount, status, ai_validated, ai_explanation, contract_reference)
      VALUES
        ('CLM-2024-1156', 'CM001', 'International Premium', 'CM450', '2024-11-18', 125.00, 'approved', true, 'Flight CM450 to GUA (Guatemala) qualifies for international premium per CBA Section 12.4', 'CBA Section 12.4'),
        ('CLM-2024-1157', 'CM002', 'Per Diem', 'CM230', '2024-11-19', 75.00, 'approved', true, 'Portland overnight qualifies for domestic per diem rate: 1 night × $75', 'CBA Section 13.2'),
        ('CLM-2024-1158', 'CM001', 'International Premium', 'CM100', '2024-11-20', 125.00, 'pending', true, 'Panama City international destination per CBA Section 12.4', 'CBA Section 12.4'),
        ('CLM-2024-1159', 'CM004', 'Holiday Pay', 'CM450', '2024-11-28', 75.00, 'approved', true, 'Thanksgiving Day premium per CBA Section 15.2', 'CBA Section 15.2'),
        ('CLM-2024-1160', 'CM002', 'International Premium', 'CM460', '2024-11-21', 125.00, 'pending', true, 'Costa Rica international destination per CBA Section 12.4', 'CBA Section 12.4');
    `;

    await sql`
      INSERT INTO training_records (crew_id, training_type, qualification, completed_date, expiry_date, next_due_date, status)
      VALUES
        ('CM001', 'Recurrent', '737-800', '2023-12-01', '2025-12-01', '2025-11-08', 'expiring-soon'),
        ('CM002', 'Initial', '737-MAX', '2021-10-15', '2025-10-15', '2025-09-01', 'current'),
        ('CM004', 'Line Check', '737-MAX', '2024-06-15', '2025-06-15', '2025-05-01', 'current'),
        ('FA012', 'Emergency Equipment', 'International', '2024-03-10', '2025-03-10', '2025-02-01', 'current');
    `;

    await sql`
      INSERT INTO disruptions (trip_id, disruption_type, description, severity, crew_affected, resolution_status, recovery_plan, cost_impact)
      VALUES
        ('CM450', 'cancellation', 'Mechanical issue - aircraft unserviceable', 'critical', 4, 'open', 'Reassign crew to CM460 departing 3hrs later', 8500.00),
        ('CM230', 'delay', 'Weather delay at PTY - 2 hour delay', 'medium', 4, 'open', 'Monitor crew duty time limits', 2400.00);
    `;

    await sql`
      INSERT INTO compliance_violations (violation_type, crew_id, trip_id, severity, description, contract_section, status)
      VALUES
        ('Duty Time Exceeded', 'CM002', 'CM230', 'warning', 'Crew exceeded 12hr duty day (12.3hrs) due to delay', 'CBA Section 15.3', 'open'),
        ('Rest Period Violation', 'CM006', NULL, 'moderate', 'Reserve crew called with less than 10hrs rest', 'CBA Section 18.2', 'acknowledged');
    `;

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Database seeding error:', error);
  }
}
