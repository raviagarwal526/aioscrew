/**
 * Industry-Standard Test Data Generator
 *
 * This script generates realistic test data and actually inserts it into the database.
 *
 * Usage:
 *   npm run generate-data
 *   OR
 *   tsx scripts/generate-industry-data.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { Client } from "pg";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { aviationDataService } from "../services/aviation-data-service.js";

// Load environment variables
config({ path: join(dirname(fileURLToPath(import.meta.url)), "../.env") });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL is not set in environment variables");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// Create a direct PostgreSQL client for bulk inserts (more reliable than serverless)
let pgClient: Client | null = null;

async function getPgClient(): Promise<Client> {
  if (!pgClient) {
    pgClient = new Client({ connectionString: DATABASE_URL });
    await pgClient.connect();
  }
  return pgClient;
}

// Configuration for industry-standard data
interface GenerationConfig {
  totalCrewMembers: number;
  captains: number;
  firstOfficers: number;
  seniorFA: number;
  juniorFA: number;
  yearsOfHistory: number;
  averageTripsPerMonth: number;
  internationalRatio: number;
  claimFrequency: number;
  violationRate: number;
  disruptionRate: number;
  useSeasonalPatterns: boolean;
  useRealAviationData: boolean; // NEW: Switch between real and random data
}

const DEFAULT_CONFIG: GenerationConfig = {
  totalCrewMembers: 5000,
  captains: 750,
  firstOfficers: 1250,
  seniorFA: 1000,
  juniorFA: 2000,
  yearsOfHistory: 1,
  averageTripsPerMonth: 15,
  internationalRatio: 0.3,
  claimFrequency: 4,
  violationRate: 2,
  disruptionRate: 5,
  useSeasonalPatterns: true,
  useRealAviationData: false, // Default to random data (set to true to use OpenFlights data)
};

// Name pools for realistic data
const FIRST_NAMES = [
  "John",
  "Michael",
  "David",
  "James",
  "Robert",
  "Carlos",
  "Juan",
  "Luis",
  "Miguel",
  "Jose",
  "Alexander",
  "Daniel",
  "Christopher",
  "Matthew",
  "Andrew",
  "Ricardo",
  "Fernando",
  "Antonio",
  "Sarah",
  "Maria",
  "Jennifer",
  "Emily",
  "Linda",
  "Ana",
  "Carmen",
  "Sofia",
  "Isabella",
  "Valentina",
  "Patricia",
  "Jessica",
  "Michelle",
  "Amanda",
  "Laura",
  "Gabriela",
  "Daniela",
  "Andrea",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Martinez",
  "Rodriguez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Walker",
  "Perez",
  "Sanchez",
  "Torres",
  "Rivera",
  "Gomez",
  "Diaz",
  "Cruz",
  "Morales",
];

const BASES = ["PTY", "BUR", "LAX", "MIA", "GUA", "SJO", "BOG", "LIM"];
const ROUTES = [
  "PTY → BUR",
  "PTY → LAX",
  "PTY → MIA",
  "PTY → GUA",
  "PTY → SJO",
  "BUR → PTY",
  "LAX → PTY",
  "MIA → PTY",
  "GUA → PTY",
  "SJO → PTY",
  "PTY → BOG",
  "PTY → LIM",
  "BOG → PTY",
  "LIM → PTY",
];

const AIRCRAFT_TYPES = ["737-800", "737-MAX", "787-9"];

// CBA-based claim amounts - All common airline claim types
const CBA_RATES = {
  "International Premium": { base: 125, perLeg: true },
  "Night Premium": { hourly: 5, minHours: 1 }, // Per hour for flights 2200-0600
  "Holiday Premium": { major: 75, minor: 50 },
  "Weekend Premium": { base: 50 }, // Work on Saturday/Sunday
  "Reserve Call-Out": { minimum: 200, hours: 4 }, // Minimum 4 hours pay
  "Training Premium": { base: 200 },
  "Per Diem": { domestic: 75, international: 100 },
  Overtime: { tier1: 50, tier2: 75, tier3: 100 },
  "Layover Premium": { short: 50, long: 100 },
  "Lead Premium": { base: 100 }, // Lead flight attendant
  Deadhead: { base: 150 }, // Traveling as passenger
  "Minimum Day Guarantee": { base: 300 }, // Minimum pay guarantee
  "Standby Pay": { hourly: 25, minHours: 2 }, // Standby assignments
  "Trip Rig": { base: 250 }, // Minimum pay for trip
  "Duty Rig": { base: 200 }, // Minimum pay for duty period
  "Cancellation Pay": { base: 150 }, // Trip cancelled
  "Diversion Pay": { base: 100 }, // Flight diverted
  "Delay Pay": { hourly: 30, minHours: 2 }, // Extended delays
};

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Generate crew member
function generateCrewMember(
  id: string,
  role: string,
  base: string,
  seniority: number
) {
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  // Make email unique by including crew member ID (remove CM/FA prefix and use numeric part)
  const idNumber = id.replace(/^[A-Z]+/, ""); // Remove CM or FA prefix
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${idNumber}@copa.com`;
  const phone = `+507-${randomInt(6000, 7999)}-${randomInt(1000, 9999)}`;

  // Calculate hire date based on seniority
  const hireDate = new Date();
  hireDate.setFullYear(hireDate.getFullYear() - seniority);
  hireDate.setMonth(randomInt(0, 11));
  hireDate.setDate(randomInt(1, 28));

  // Calculate YTD earnings based on role and seniority
  const basePay =
    {
      Captain: 8000,
      "First Officer": 5000,
      "Senior FA": 3500,
      "Junior FA": 2500,
    }[role] || 3000;

  const ytdEarnings = Math.round(
    basePay * 12 * (1 + seniority * 0.02) * randomFloat(0.8, 1.2)
  );

  const qualification =
    role === "Captain" || role === "First Officer"
      ? randomChoice(["737-800", "737-MAX", "787-9"])
      : "International";

  return {
    id,
    name: `${firstName} ${lastName}`,
    role,
    base,
    seniority,
    qualification,
    email,
    phone,
    hire_date: hireDate.toISOString().split("T")[0],
    ytd_earnings: ytdEarnings,
    status: "active",
  };
}

// Generate trip (with real data support)
function generateTrip(
  tripId: string,
  tripDate: Date,
  crewMembers: any[],
  isInternational: boolean,
  useRealData: boolean = false
) {
  let route: string;
  let flightTimeHours: number;
  let actualIsInternational: boolean;
  let aircraftType: string;

  if (useRealData && aviationDataService.isDataAvailable()) {
    // Use real Copa Airlines routes from OpenFlights.org
    const realRoute = aviationDataService.getRandomCopaRoute();

    if (realRoute) {
      route = `${realRoute.sourceAirport} → ${realRoute.destinationAirport}`;
      flightTimeHours = aviationDataService.calculateFlightTime(
        realRoute.sourceAirport,
        realRoute.destinationAirport
      );
      actualIsInternational = aviationDataService.isInternationalRoute(
        realRoute.sourceAirport,
        realRoute.destinationAirport
      );
      aircraftType = aviationDataService.getAircraftTypeFromRoute(realRoute);
    } else {
      // Fallback to synthetic if no Copa routes found
      route = randomChoice(ROUTES);
      flightTimeHours = randomFloat(3.5, 8.5);
      actualIsInternational = isInternational;
      aircraftType = randomChoice(AIRCRAFT_TYPES);
    }
  } else {
    // Use synthetic/random data
    route = randomChoice(ROUTES);
    flightTimeHours = randomFloat(3.5, 8.5);
    actualIsInternational = isInternational;
    aircraftType = randomChoice(AIRCRAFT_TYPES);
  }

  // Credit hours calculation
  const creditHours = flightTimeHours * randomFloat(1.1, 1.3);

  // Generate flight number
  const flightNumber = `CM${randomInt(100, 999)}`;

  // Select crew based on role
  const captains = crewMembers.filter((c) => c.role === "Captain");
  const firstOfficers = crewMembers.filter((c) => c.role === "First Officer");
  const seniorFAs = crewMembers.filter((c) => c.role === "Senior FA");
  const juniorFAs = crewMembers.filter((c) => c.role === "Junior FA");

  const captain = captains.length > 0 ? randomChoice(captains) : null;
  const firstOfficer =
    firstOfficers.length > 0 ? randomChoice(firstOfficers) : null;
  const seniorFA = seniorFAs.length > 0 ? randomChoice(seniorFAs) : null;
  const juniorFA = juniorFAs.length > 0 ? randomChoice(juniorFAs) : null;

  const statuses = ["scheduled", "completed", "cancelled", "delayed"];
  const weights = [0.85, 0.1, 0.03, 0.02];
  let rand = Math.random();
  let status = "scheduled";
  for (let i = 0; i < statuses.length; i++) {
    if (rand < weights[i]) {
      status = statuses[i];
      break;
    }
    rand -= weights[i];
  }

  return {
    id: tripId,
    trip_date: tripDate.toISOString().split("T")[0],
    route,
    flight_numbers: flightNumber,
    departure_time: `${randomInt(6, 22)
      .toString()
      .padStart(2, "0")}:${randomInt(0, 59).toString().padStart(2, "0")}`,
    arrival_time: `${randomInt(6, 22).toString().padStart(2, "0")}:${randomInt(
      0,
      59
    )
      .toString()
      .padStart(2, "0")}`,
    flight_time_hours: Math.round(flightTimeHours * 100) / 100,
    credit_hours: Math.round(creditHours * 100) / 100,
    layover_city: actualIsInternational
      ? randomChoice(["MIA", "LAX", "BOG", "LIM"])
      : null,
    is_international: actualIsInternational,
    aircraft_type: aircraftType,
    status,
    captain_id: captain?.id || null,
    first_officer_id: firstOfficer?.id || null,
    senior_fa_id: seniorFA?.id || null,
    junior_fa_id: juniorFA?.id || null,
  };
}

// Generate claim with CBA-based amounts - All common airline claim types
function generateClaim(crewMember: any, trip: any, claimDate: Date) {
  const claimTypes = [
    { type: "International Premium", weight: 0.25 },
    { type: "Per Diem", weight: 0.20 },
    { type: "Night Premium", weight: 0.15 },
    { type: "Holiday Premium", weight: 0.08 },
    { type: "Weekend Premium", weight: 0.06 },
    { type: "Overtime", weight: 0.05 },
    { type: "Layover Premium", weight: 0.04 },
    { type: "Reserve Call-Out", weight: 0.04 },
    { type: "Training Premium", weight: 0.03 },
    { type: "Lead Premium", weight: 0.02 },
    { type: "Deadhead", weight: 0.02 },
    { type: "Minimum Day Guarantee", weight: 0.02 },
    { type: "Standby Pay", weight: 0.015 },
    { type: "Trip Rig", weight: 0.015 },
    { type: "Duty Rig", weight: 0.01 },
    { type: "Cancellation Pay", weight: 0.01 },
    { type: "Diversion Pay", weight: 0.005 },
    { type: "Delay Pay", weight: 0.005 },
  ];

  let rand = Math.random();
  let claimType = claimTypes[0].type;
  for (const ct of claimTypes) {
    if (rand < ct.weight) {
      claimType = ct.type;
      break;
    }
    rand -= ct.weight;
  }

  // Calculate amount based on CBA rates
  let amount = 0;
  switch (claimType) {
    case "International Premium":
      amount =
        CBA_RATES["International Premium"].base *
        (trip.is_international ? 1 : 0);
      break;
    case "Night Premium":
      // Night flights (2200-0600) - calculate based on flight time
      const nightHours = Math.max(1, Math.floor(trip.flight_time_hours || 3));
      amount = CBA_RATES["Night Premium"].hourly * nightHours;
      break;
    case "Holiday Premium":
      amount =
        Math.random() > 0.5
          ? CBA_RATES["Holiday Premium"].major
          : CBA_RATES["Holiday Premium"].minor;
      break;
    case "Weekend Premium":
      amount = CBA_RATES["Weekend Premium"].base;
      break;
    case "Reserve Call-Out":
      amount = CBA_RATES["Reserve Call-Out"].minimum;
      break;
    case "Training Premium":
      amount = CBA_RATES["Training Premium"].base;
      break;
    case "Per Diem":
      const nights = randomInt(1, 4);
      amount =
        (trip.is_international
          ? CBA_RATES["Per Diem"].international
          : CBA_RATES["Per Diem"].domestic) * nights;
      break;
    case "Overtime":
      const hours = randomInt(5, 20);
      amount =
        hours *
        (hours > 15
          ? CBA_RATES["Overtime"].tier3
          : hours > 10
          ? CBA_RATES["Overtime"].tier2
          : CBA_RATES["Overtime"].tier1);
      break;
    case "Layover Premium":
      amount =
        Math.random() > 0.5
          ? CBA_RATES["Layover Premium"].long
          : CBA_RATES["Layover Premium"].short;
      break;
    case "Lead Premium":
      amount = CBA_RATES["Lead Premium"].base;
      break;
    case "Deadhead":
      amount = CBA_RATES["Deadhead"].base;
      break;
    case "Minimum Day Guarantee":
      amount = CBA_RATES["Minimum Day Guarantee"].base;
      break;
    case "Standby Pay":
      const standbyHours = randomInt(2, 8);
      amount = CBA_RATES["Standby Pay"].hourly * standbyHours;
      break;
    case "Trip Rig":
      amount = CBA_RATES["Trip Rig"].base;
      break;
    case "Duty Rig":
      amount = CBA_RATES["Duty Rig"].base;
      break;
    case "Cancellation Pay":
      amount = CBA_RATES["Cancellation Pay"].base;
      break;
    case "Diversion Pay":
      amount = CBA_RATES["Diversion Pay"].base;
      break;
    case "Delay Pay":
      const delayHours = randomInt(2, 6);
      amount = CBA_RATES["Delay Pay"].hourly * delayHours;
      break;
  }

  const statuses = ["pending", "approved", "rejected"];
  const weights = [0.25, 0.7, 0.05];
  rand = Math.random();
  let status = "pending";
  for (let i = 0; i < statuses.length; i++) {
    if (rand < weights[i]) {
      status = statuses[i];
      break;
    }
    rand -= weights[i];
  }

  const claimId = `CLM-${claimDate.getFullYear()}-${randomInt(1000, 9999)}`;

  return {
    id: claimId,
    crew_id: crewMember.id,
    claim_type: claimType,
    trip_id: trip.id,
    claim_date: claimDate.toISOString().split("T")[0],
    amount: Math.round(amount * 100) / 100,
    status,
    ai_validated: status === "approved" && Math.random() > 0.3,
    ai_explanation: `Validated per CBA Section ${randomInt(10, 20)}.${randomInt(
      1,
      5
    )}`,
    contract_reference: `CBA Section ${randomInt(10, 20)}.${randomInt(1, 5)}`,
  };
}

// Helper function to escape SQL values
function escapeSQLValue(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "string") {
    // Escape single quotes and wrap in quotes
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (Array.isArray(value)) {
    // For arrays, convert to PostgreSQL array format
    // Escape each element and wrap in quotes
    const escaped = value
      .map((v) => {
        const str = String(v);
        // Escape single quotes and wrap in quotes
        return `'${str.replace(/'/g, "''")}'`;
      })
      .join(",");
    return `ARRAY[${escaped}]::VARCHAR(20)[]`;
  }
  if (typeof value === "object") {
    // For JSON objects
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  }
  return String(value);
}

// True bulk insert function using multi-VALUES statements
async function batchInsert(table: string, records: any[], batchSize = 500) {
  console.log(`  Inserting ${records.length} records into ${table}...`);

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    try {
      // Verify connection before inserting
      if (i === 0) {
        try {
          await sql`SELECT 1`;
        } catch (connError: any) {
          throw new Error(`Database connection failed: ${connError.message}`);
        }
      }
      if (table === "crew_members") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.id)}, ${escapeSQLValue(
                r.name
              )}, ${escapeSQLValue(r.role)}, ${escapeSQLValue(
                r.base
              )}, ${escapeSQLValue(r.seniority)}, ${escapeSQLValue(
                r.qualification
              )}, ${escapeSQLValue(r.email)}, ${escapeSQLValue(
                r.phone
              )}, ${escapeSQLValue(r.hire_date)}, ${escapeSQLValue(
                r.ytd_earnings
              )}, ${escapeSQLValue(r.status)})`
          )
          .join(", ");
        // Use direct PostgreSQL client for more reliable bulk inserts
        const client = await getPgClient();
        const insertSQL = `
          INSERT INTO crew_members (id, name, role, base, seniority, qualification, email, phone, hire_date, ytd_earnings, status)
          VALUES ${values}
          ON CONFLICT (id) DO NOTHING
        `;
        await client.query(insertSQL);
      } else if (table === "trips") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.id)}, ${escapeSQLValue(
                r.trip_date
              )}, ${escapeSQLValue(r.route)}, ${escapeSQLValue(
                r.flight_numbers
              )}, ${escapeSQLValue(r.departure_time)}, ${escapeSQLValue(
                r.arrival_time
              )}, ${escapeSQLValue(r.flight_time_hours)}, ${escapeSQLValue(
                r.credit_hours
              )}, ${escapeSQLValue(r.layover_city)}, ${escapeSQLValue(
                r.is_international
              )}, ${escapeSQLValue(r.aircraft_type)}, ${escapeSQLValue(
                r.status
              )}, ${escapeSQLValue(r.captain_id)}, ${escapeSQLValue(
                r.first_officer_id
              )}, ${escapeSQLValue(r.senior_fa_id)}, ${escapeSQLValue(
                r.junior_fa_id
              )})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO trips (id, trip_date, route, flight_numbers, departure_time, arrival_time, flight_time_hours, credit_hours, layover_city, is_international, aircraft_type, status, captain_id, first_officer_id, senior_fa_id, junior_fa_id)
          VALUES ${values}
          ON CONFLICT (id) DO NOTHING
        `);
      } else if (table === "pay_claims") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.id)}, ${escapeSQLValue(
                r.crew_id
              )}, ${escapeSQLValue(r.claim_type)}, ${escapeSQLValue(
                r.trip_id
              )}, ${escapeSQLValue(r.claim_date)}, ${escapeSQLValue(
                r.amount
              )}, ${escapeSQLValue(r.status)}, ${escapeSQLValue(
                r.ai_validated
              )}, ${escapeSQLValue(r.ai_explanation)}, ${escapeSQLValue(
                r.contract_reference
              )})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO pay_claims (id, crew_id, claim_type, trip_id, claim_date, amount, status, ai_validated, ai_explanation, contract_reference)
          VALUES ${values}
          ON CONFLICT (id) DO NOTHING
        `);
      } else if (table === "training_records") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.crew_id)}, ${escapeSQLValue(
                r.training_type
              )}, ${escapeSQLValue(r.qualification)}, ${escapeSQLValue(
                r.completed_date
              )}, ${escapeSQLValue(r.expiry_date)}, ${escapeSQLValue(
                r.next_due_date
              )}, ${escapeSQLValue(r.status)}, ${escapeSQLValue(
                r.instructor
              )}, ${escapeSQLValue(r.score)}, ${escapeSQLValue(r.notes)})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO training_records (crew_id, training_type, qualification, completed_date, expiry_date, next_due_date, status, instructor, score, notes)
          VALUES ${values}
        `);
      } else if (table === "compliance_violations") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.violation_type)}, ${escapeSQLValue(
                r.crew_id
              )}, ${escapeSQLValue(r.trip_id)}, ${escapeSQLValue(
                r.severity
              )}, ${escapeSQLValue(r.description)}, ${escapeSQLValue(
                r.contract_section
              )}, ${escapeSQLValue(r.status)}, ${escapeSQLValue(
                r.detected_at
              )}, ${escapeSQLValue(r.resolved_at)})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO compliance_violations (violation_type, crew_id, trip_id, severity, description, contract_section, status, detected_at, resolved_at)
          VALUES ${values}
        `);
      } else if (table === "disruptions") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.disruption_type)}, ${escapeSQLValue(
                r.severity
              )}, ${escapeSQLValue(r.affected_flight_id)}, ${escapeSQLValue(
                r.affected_crew_ids
              )}, ${escapeSQLValue(r.disruption_start)}, ${escapeSQLValue(
                r.disruption_end
              )}, ${escapeSQLValue(r.root_cause)}, ${escapeSQLValue(
                r.description
              )}, ${escapeSQLValue(r.status)}, ${escapeSQLValue(
                r.resolved_at
              )}, ${escapeSQLValue(r.resolved_by)})`
          )
          .join(", ");
        const client = await getPgClient();
        // For disruptions, affected_crew_ids is already formatted as array in escapeSQLValue
        await client.query(`
          INSERT INTO disruptions (disruption_type, severity, affected_flight_id, affected_crew_ids, disruption_start, disruption_end, root_cause, description, status, resolved_at, resolved_by)
          VALUES ${values}
        `);
      } else if (table === "admin_users") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.admin_id)}, ${escapeSQLValue(
                r.email
              )}, ${escapeSQLValue(r.full_name)}, ${escapeSQLValue(
                r.role
              )}, ${escapeSQLValue(
                JSON.stringify(r.permissions)
              )}::jsonb, ${escapeSQLValue(r.active)}, ${escapeSQLValue(
                r.last_login
              )})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO admin_users (admin_id, email, full_name, role, permissions, active, last_login)
          VALUES ${values}
          ON CONFLICT (admin_id) DO NOTHING
        `);
      } else if (table === "payment_batches") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.batch_id)}, ${escapeSQLValue(
                r.batch_date
              )}, ${escapeSQLValue(r.total_amount)}, ${escapeSQLValue(
                r.total_claims
              )}, ${escapeSQLValue(r.status)}, ${escapeSQLValue(
                r.processed_by
              )}, ${escapeSQLValue(r.processed_at)}, ${escapeSQLValue(
                r.export_file_path
              )}, ${escapeSQLValue(r.payroll_system_id)})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO payment_batches (batch_id, batch_date, total_amount, total_claims, status, processed_by, processed_at, export_file_path, payroll_system_id)
          VALUES ${values}
          ON CONFLICT (batch_id) DO NOTHING
        `);
      } else if (table === "payment_items") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.batch_id)}, ${escapeSQLValue(
                r.claim_id
              )}, ${escapeSQLValue(r.crew_member_id)}, ${escapeSQLValue(
                r.amount
              )}, ${escapeSQLValue(r.payment_method)}, ${escapeSQLValue(
                r.status
              )}, ${escapeSQLValue(r.paid_at)}, ${escapeSQLValue(
                r.confirmation_number
              )})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO payment_items (batch_id, claim_id, crew_member_id, amount, payment_method, status, paid_at, confirmation_number)
          VALUES ${values}
        `);
      } else if (table === "crew_qualifications") {
        const validRecords = batch.filter((r) => r !== null && r !== undefined);
        if (validRecords.length > 0) {
          const values = validRecords
            .map(
              (r) =>
                `(${escapeSQLValue(r.crew_id)}, ${escapeSQLValue(
                  r.qualification_type
                )}, ${escapeSQLValue(r.qualification_code)}, ${escapeSQLValue(
                  r.issued_date
                )}, ${escapeSQLValue(r.expiry_date)}, ${escapeSQLValue(
                  r.status
                )}, ${escapeSQLValue(r.notes)})`
            )
            .join(", ");
          const client = await getPgClient();
          await client.query(`
            INSERT INTO crew_qualifications (crew_id, qualification_type, qualification_code, issued_date, expiry_date, status, notes)
            VALUES ${values}
          `);
        }
      } else if (table === "roster_assignments") {
        const values = batch
          .map(
            (r) =>
              `(${escapeSQLValue(r.roster_period_start)}, ${escapeSQLValue(
                r.roster_period_end
              )}, ${escapeSQLValue(r.crew_id)}, ${escapeSQLValue(
                r.trip_id
              )}, ${escapeSQLValue(r.assignment_type)}, ${escapeSQLValue(
                r.start_date
              )}, ${escapeSQLValue(r.end_date)}, ${escapeSQLValue(
                r.start_time
              )}, ${escapeSQLValue(r.end_time)}, ${escapeSQLValue(
                r.status
              )}, ${escapeSQLValue(r.assignment_rank)}, ${escapeSQLValue(
                r.created_by
              )})`
          )
          .join(", ");
        const client = await getPgClient();
        await client.query(`
          INSERT INTO roster_assignments (roster_period_start, roster_period_end, crew_id, trip_id, assignment_type, start_date, end_date, start_time, end_time, status, assignment_rank, created_by)
          VALUES ${values}
        `);
      }
    } catch (error: any) {
      console.error(`\n❌ Error inserting batch into ${table}:`, error.message);
      console.error(`   Batch size: ${batch.length}, Start index: ${i}`);
      if (error.stack) {
        console.error(`   Stack: ${error.stack.substring(0, 300)}`);
      }
      throw error;
    }

    process.stdout.write(
      `    Progress: ${Math.min(i + batchSize, records.length)}/${
        records.length
      }\r`
    );
  }
  console.log(`    ✅ Completed ${records.length} records`);
}

// Generate training record
function generateTrainingRecord(crewMember: any, index: number) {
  const trainingTypes = [
    "Recurrent",
    "Initial",
    "Line Check",
    "Emergency Equipment",
    "Security Training",
  ];
  const trainingType = randomChoice(trainingTypes);

  const completedDate = new Date(crewMember.hire_date);
  completedDate.setDate(completedDate.getDate() + randomInt(30, 365));

  const expiryDate = new Date(completedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);

  const nextDueDate = new Date(expiryDate);
  nextDueDate.setDate(nextDueDate.getDate() - 60);

  const statuses = ["current", "expiring-soon", "expired"];
  const weights = [0.7, 0.15, 0.15];
  let rand = Math.random();
  let status = "current";
  for (let i = 0; i < statuses.length; i++) {
    if (rand < weights[i]) {
      status = statuses[i];
      break;
    }
    rand -= weights[i];
  }

  return {
    crew_id: crewMember.id,
    training_type: trainingType,
    qualification: crewMember.qualification,
    completed_date: completedDate.toISOString().split("T")[0],
    expiry_date: expiryDate.toISOString().split("T")[0],
    next_due_date: nextDueDate.toISOString().split("T")[0],
    status,
    instructor: `Instructor ${randomChoice(FIRST_NAMES)} ${randomChoice(
      LAST_NAMES
    )}`,
    score: randomInt(85, 100),
    notes: `Completed ${trainingType} training`,
  };
}

// Generate compliance violation
function generateViolation(crewMember: any, trip: any, violationType: string) {
  const severities = ["warning", "minor", "moderate", "major"];
  const weights = [0.4, 0.3, 0.2, 0.1];
  let rand = Math.random();
  let severity = "warning";
  for (let i = 0; i < severities.length; i++) {
    if (rand < weights[i]) {
      severity = severities[i];
      break;
    }
    rand -= weights[i];
  }

  const descriptions: Record<string, string> = {
    "Duty Time Exceeded": `Crew exceeded ${randomFloat(12, 14).toFixed(
      1
    )}hr duty day due to delay`,
    "Rest Period Violation": `Reserve crew called with less than ${randomInt(
      8,
      10
    )}hrs rest`,
    "Flight Time Limit": `Monthly flight time limit exceeded by ${randomInt(
      5,
      20
    )} hours`,
    "Qualification Issue": "Crew member operating without valid qualification",
  };

  const statuses = ["open", "acknowledged", "resolved"];
  const status = randomChoice(statuses);

  return {
    violation_type: violationType,
    crew_id: crewMember.id,
    trip_id: trip?.id || null,
    severity,
    description:
      descriptions[violationType] || "Regulatory compliance violation",
    contract_section: `CBA Section ${randomInt(15, 20)}.${randomInt(1, 5)}`,
    status,
    detected_at: trip
      ? new Date(trip.trip_date).toISOString()
      : new Date().toISOString(),
    resolved_at: status === "resolved" ? new Date().toISOString() : null,
  };
}

// Generate disruption
function generateDisruption(trip: any, disruptionType: string) {
  const severities = ["minor", "moderate", "major", "critical"];
  const weights = [0.6, 0.3, 0.08, 0.02];
  let rand = Math.random();
  let severity = "minor";
  for (let i = 0; i < severities.length; i++) {
    if (rand < weights[i]) {
      severity = severities[i];
      break;
    }
    rand -= weights[i];
  }

  const descriptions: Record<string, string> = {
    weather: `Weather delay at ${
      trip.route.split("→")[1]?.trim() || "destination"
    } - ${randomInt(1, 4)} hour delay`,
    mechanical: "Mechanical issue - aircraft unserviceable",
    crew_unavailable: "Crew member unavailable due to illness",
    atc_delay: `ATC delay - ${randomInt(30, 120)} minute delay`,
    other: "Operational disruption",
  };

  const disruptionStart = new Date(trip.trip_date);
  disruptionStart.setHours(randomInt(6, 22));
  disruptionStart.setMinutes(randomInt(0, 59));

  const statuses = ["open", "assigned", "resolved"];
  const status = randomChoice(statuses);

  return {
    disruption_type: disruptionType,
    severity,
    affected_flight_id: trip.id,
    affected_pairing_id: null,
    affected_crew_ids: [trip.captain_id, trip.first_officer_id].filter(Boolean),
    disruption_start: disruptionStart.toISOString(),
    disruption_end:
      status === "resolved"
        ? new Date(
            disruptionStart.getTime() + randomInt(1, 4) * 3600000
          ).toISOString()
        : null,
    root_cause: disruptionType.replace("_", " "),
    description: descriptions[disruptionType] || descriptions["other"],
    status,
    resolved_at: status === "resolved" ? new Date().toISOString() : null,
    resolved_by: status === "resolved" ? "System" : null,
  };
}

// Generate admin user
function generateAdminUser(id: string, index: number) {
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  const roles = ["payroll_admin", "payroll_manager", "super_admin"];
  const role = index === 0 ? "super_admin" : randomChoice(roles);

  return {
    admin_id: id,
    email: `admin${index + 1}@copa.com`,
    full_name: `${firstName} ${lastName}`,
    role,
    permissions:
      role === "super_admin"
        ? { all: true }
        : { claims: ["read", "write"], payments: ["read"] },
    active: true,
    last_login: new Date(
      Date.now() - randomInt(1, 30) * 24 * 3600000
    ).toISOString(),
  };
}

// Generate payment batch
function generatePaymentBatch(
  batchId: string,
  batchDate: Date,
  approvedClaims: any[]
) {
  const totalAmount = approvedClaims.reduce((sum, c) => sum + c.amount, 0);
  const statuses = ["pending", "processing", "completed"];
  const status = randomChoice(statuses);

  return {
    batch_id: batchId,
    batch_date: batchDate.toISOString().split("T")[0],
    total_amount: Math.round(totalAmount * 100) / 100,
    total_claims: approvedClaims.length,
    status,
    processed_by: status === "completed" ? "ADMIN001" : null,
    processed_at: status === "completed" ? batchDate.toISOString() : null,
    export_file_path:
      status === "completed" ? `/exports/batch_${batchId}.csv` : null,
    payroll_system_id: status === "completed" ? `PAY-${batchId}` : null,
  };
}

// Generate payment item
function generatePaymentItem(claim: any, batchId: string) {
  const statuses = ["pending", "processing", "completed", "failed"];
  const weights = [0.1, 0.05, 0.8, 0.05];
  let rand = Math.random();
  let status = "pending";
  for (let i = 0; i < statuses.length; i++) {
    if (rand < weights[i]) {
      status = statuses[i];
      break;
    }
    rand -= weights[i];
  }

  return {
    batch_id: batchId,
    claim_id: claim.id,
    crew_member_id: claim.crew_id,
    amount: claim.amount,
    payment_method: randomChoice(["direct_deposit", "payroll_system"]),
    status,
    paid_at: status === "completed" ? new Date().toISOString() : null,
    confirmation_number:
      status === "completed" ? `PAY-${randomInt(100000, 999999)}` : null,
  };
}

// Generate crew qualification
function generateQualification(crewMember: any) {
  if (crewMember.role === "Captain" || crewMember.role === "First Officer") {
    const qualificationTypes = ["aircraft_type", "route", "instructor"];
    const qualificationType = randomChoice(qualificationTypes);

    let qualificationCode = crewMember.qualification;
    if (qualificationType === "route") {
      qualificationCode = randomChoice(["PTY-MIA", "PTY-LAX", "PTY-BOG"]);
    } else if (qualificationType === "instructor") {
      qualificationCode = "INSTRUCTOR";
    }

    const issuedDate = new Date(crewMember.hire_date);
    issuedDate.setDate(issuedDate.getDate() + randomInt(90, 365));

    const expiryDate = new Date(issuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    return {
      crew_id: crewMember.id,
      qualification_type: qualificationType,
      qualification_code: qualificationCode,
      issued_date: issuedDate.toISOString().split("T")[0],
      expiry_date: expiryDate.toISOString().split("T")[0],
      status: expiryDate > new Date() ? "active" : "expired",
      notes: `${qualificationType} qualification`,
    };
  }
  return null;
}

// Generate roster assignment
function generateRosterAssignment(
  crewMember: any,
  trip: any,
  periodStart: Date,
  periodEnd: Date
) {
  return {
    roster_period_start: periodStart.toISOString().split("T")[0],
    roster_period_end: periodEnd.toISOString().split("T")[0],
    crew_id: crewMember.id,
    pairing_id: null,
    trip_id: trip.id,
    assignment_type: "pairing",
    start_date: trip.trip_date,
    end_date: trip.trip_date,
    start_time: new Date(
      `${trip.trip_date}T${trip.departure_time}`
    ).toISOString(),
    end_time: new Date(`${trip.trip_date}T${trip.arrival_time}`).toISOString(),
    status:
      trip.status === "scheduled"
        ? "scheduled"
        : trip.status === "completed"
        ? "completed"
        : "cancelled",
    assignment_rank: crewMember.seniority,
    created_by: "System",
  };
}

// Main generation function
async function generateIndustryData(cfg: GenerationConfig = DEFAULT_CONFIG) {
  console.log("🚀 Starting Industry-Standard Test Data Generation");
  console.log("================================================\n");
  console.log("Configuration:");
  console.log(`  Crew Members: ${cfg.totalCrewMembers}`);
  console.log(`  Years of History: ${cfg.yearsOfHistory}`);
  console.log(`  Average Trips/Month: ${cfg.averageTripsPerMonth}`);
  console.log(`  Claim Frequency: ${cfg.claimFrequency}/year per crew`);
  console.log(`  Violation Rate: ${cfg.violationRate} per 1000 trips`);
  console.log(`  Disruption Rate: ${cfg.disruptionRate} per 1000 trips`);
  console.log(
    `  Data Source: ${
      cfg.useRealAviationData
        ? "🌍 Real Data (OpenFlights.org)"
        : "🎲 Random/Synthetic Data"
    }\n`
  );

  // Load real aviation data if requested
  if (cfg.useRealAviationData) {
    console.log("📥 Loading real aviation data from OpenFlights.org...");
    const loaded = aviationDataService.loadOpenFlightsData();
    if (loaded) {
      const stats = aviationDataService.getStatistics();
      console.log(
        `  ✅ Loaded ${stats.airports} airports, ${stats.routes} routes`
      );
      console.log(`  ✅ Found ${stats.copaRoutes} Copa Airlines routes\n`);
    } else {
      console.log(
        "  ⚠️  Real data not available, falling back to synthetic data\n"
      );
      cfg.useRealAviationData = false; // Disable real data mode
    }
  }

  try {
    // Step 1: Generate Crew Members
    console.log("📦 Step 1: Generating Crew Members...");
    const crewMembers: any[] = [];
    let crewCounter = 1;

    // Generate captains
    for (let i = 0; i < cfg.captains; i++) {
      const id = `CM${crewCounter.toString().padStart(4, "0")}`;
      const base = randomChoice(BASES);
      const seniority = randomInt(5, 25);
      crewMembers.push(generateCrewMember(id, "Captain", base, seniority));
      crewCounter++;
    }

    // Generate first officers
    for (let i = 0; i < cfg.firstOfficers; i++) {
      const id = `CM${crewCounter.toString().padStart(4, "0")}`;
      const base = randomChoice(BASES);
      const seniority = randomInt(1, 15);
      crewMembers.push(
        generateCrewMember(id, "First Officer", base, seniority)
      );
      crewCounter++;
    }

    // Generate senior FAs
    for (let i = 0; i < cfg.seniorFA; i++) {
      const id = `FA${crewCounter.toString().padStart(4, "0")}`;
      const base = randomChoice(BASES);
      const seniority = randomInt(3, 20);
      crewMembers.push(generateCrewMember(id, "Senior FA", base, seniority));
      crewCounter++;
    }

    // Generate junior FAs
    for (let i = 0; i < cfg.juniorFA; i++) {
      const id = `FA${crewCounter.toString().padStart(4, "0")}`;
      const base = randomChoice(BASES);
      const seniority = randomInt(1, 5);
      crewMembers.push(generateCrewMember(id, "Junior FA", base, seniority));
      crewCounter++;
    }

    console.log(`  ✅ Generated ${crewMembers.length} crew members`);
    await batchInsert("crew_members", crewMembers);
    console.log("");

    // Step 2: Generate Trips
    console.log("📦 Step 2: Generating Trips...");
    const trips: any[] = [];
    let tripCounter = 100;
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - cfg.yearsOfHistory);
    const totalMonths = cfg.yearsOfHistory * 12;

    for (let month = 0; month < totalMonths; month++) {
      const monthDate = addMonths(startDate, month);

      // Apply seasonal variation
      let monthlyMultiplier = 1;
      if (cfg.useSeasonalPatterns) {
        const monthNum = monthDate.getMonth();
        if (monthNum >= 5 && monthNum <= 7) monthlyMultiplier = 1.3; // Summer
        else if (monthNum === 11) monthlyMultiplier = 1.4; // December
        else if (monthNum <= 1 || monthNum === 8) monthlyMultiplier = 0.8; // Low season
      }

      const tripsThisMonth = Math.round(
        (cfg.totalCrewMembers * cfg.averageTripsPerMonth * monthlyMultiplier) /
          4
      );

      for (let t = 0; t < tripsThisMonth; t++) {
        const dayOfMonth = randomInt(1, 28);
        const tripDate = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          dayOfMonth
        );
        const isInternational = Math.random() < cfg.internationalRatio;

        const tripId = `CM${tripCounter++}`;
        trips.push(
          generateTrip(
            tripId,
            tripDate,
            crewMembers,
            isInternational,
            cfg.useRealAviationData
          )
        );
      }
    }

    console.log(`  ✅ Generated ${trips.length} trips`);
    await batchInsert("trips", trips);
    console.log("");

    // Step 3: Generate Claims
    console.log("📦 Step 3: Generating Pay Claims...");
    const claims: any[] = [];

    for (const member of crewMembers) {
      const memberTrips = trips.filter(
        (t) =>
          t.captain_id === member.id ||
          t.first_officer_id === member.id ||
          t.senior_fa_id === member.id ||
          t.junior_fa_id === member.id
      );

      const numClaims = Math.round(
        cfg.claimFrequency * cfg.yearsOfHistory * randomFloat(0.8, 1.2)
      );

      for (let c = 0; c < numClaims && c < memberTrips.length; c++) {
        const trip = randomChoice(memberTrips);
        const claimDate = addDays(new Date(trip.trip_date), randomInt(1, 30));
        claims.push(generateClaim(member, trip, claimDate));
      }
    }

    console.log(`  ✅ Generated ${claims.length} claims`);
    await batchInsert("pay_claims", claims);
    console.log("");

    // Step 4: Generate Training Records
    console.log("📦 Step 4: Generating Training Records...");
    const trainingRecords: any[] = [];
    for (const member of crewMembers) {
      // Generate 1-3 training records per crew member
      const numRecords = randomInt(1, 3);
      for (let i = 0; i < numRecords; i++) {
        trainingRecords.push(generateTrainingRecord(member, i));
      }
    }
    console.log(`  ✅ Generated ${trainingRecords.length} training records`);
    await batchInsert("training_records", trainingRecords);
    console.log("");

    // Step 5: Generate Compliance Violations
    console.log("📦 Step 5: Generating Compliance Violations...");
    const violations: any[] = [];
    const violationTypes = [
      "Duty Time Exceeded",
      "Rest Period Violation",
      "Flight Time Limit",
      "Qualification Issue",
    ];
    const totalViolations = Math.floor(
      (trips.length / 1000) * cfg.violationRate
    );

    for (let i = 0; i < totalViolations && i < trips.length; i++) {
      const trip = randomChoice(trips);
      const crewOnTrip = crewMembers.find(
        (c) =>
          c.id === trip.captain_id ||
          c.id === trip.first_officer_id ||
          c.id === trip.senior_fa_id ||
          c.id === trip.junior_fa_id
      );
      if (crewOnTrip) {
        violations.push(
          generateViolation(crewOnTrip, trip, randomChoice(violationTypes))
        );
      }
    }
    console.log(`  ✅ Generated ${violations.length} compliance violations`);
    await batchInsert("compliance_violations", violations);
    console.log("");

    // Step 6: Generate Disruptions
    console.log("📦 Step 6: Generating Disruptions...");
    const disruptions: any[] = [];
    const disruptionTypes = [
      "weather",
      "mechanical",
      "crew_unavailable",
      "atc_delay",
      "other",
    ];
    const totalDisruptions = Math.floor(
      (trips.length / 1000) * cfg.disruptionRate
    );

    for (let i = 0; i < totalDisruptions && i < trips.length; i++) {
      const trip = randomChoice(trips);
      disruptions.push(generateDisruption(trip, randomChoice(disruptionTypes)));
    }
    console.log(`  ✅ Generated ${disruptions.length} disruptions`);
    await batchInsert("disruptions", disruptions);
    console.log("");

    // Step 7: Generate Admin Users
    console.log("📦 Step 7: Generating Admin Users...");
    const adminUsers: any[] = [];
    for (let i = 0; i < 5; i++) {
      adminUsers.push(
        generateAdminUser(`ADMIN${(i + 1).toString().padStart(3, "0")}`, i)
      );
    }
    console.log(`  ✅ Generated ${adminUsers.length} admin users`);
    await batchInsert("admin_users", adminUsers);
    console.log("");

    // Step 8: Generate Payment Batches and Items
    console.log("📦 Step 8: Generating Payment Batches...");
    const approvedClaims = claims.filter((c) => c.status === "approved");
    const paymentBatches: any[] = [];
    const paymentItems: any[] = [];

    // Group claims by month for batch processing
    const claimsByMonth = new Map<string, any[]>();
    for (const claim of approvedClaims) {
      const monthKey = claim.claim_date.substring(0, 7); // YYYY-MM
      if (!claimsByMonth.has(monthKey)) {
        claimsByMonth.set(monthKey, []);
      }
      claimsByMonth.get(monthKey)!.push(claim);
    }

    let batchCounter = 1;
    for (const [monthKey, monthClaims] of claimsByMonth.entries()) {
      if (monthClaims.length > 0) {
        const batchDate = new Date(`${monthKey}-01`);
        const batchId = `BATCH-${batchDate.getFullYear()}-${
          batchDate.getMonth() + 1
        }`;
        const batch = generatePaymentBatch(batchId, batchDate, monthClaims);
        paymentBatches.push(batch);

        // Generate payment items for this batch
        for (const claim of monthClaims.slice(0, 100)) {
          // Limit to 100 per batch for performance
          paymentItems.push(generatePaymentItem(claim, batchId));
        }
        batchCounter++;
      }
    }

    console.log(`  ✅ Generated ${paymentBatches.length} payment batches`);
    await batchInsert("payment_batches", paymentBatches);
    console.log(`  ✅ Generated ${paymentItems.length} payment items`);
    await batchInsert("payment_items", paymentItems);
    console.log("");

    // Step 9: Generate Crew Qualifications
    console.log("📦 Step 9: Generating Crew Qualifications...");
    const qualifications: any[] = [];
    for (const member of crewMembers) {
      if (member.role === "Captain" || member.role === "First Officer") {
        const qual = generateQualification(member);
        if (qual) {
          qualifications.push(qual);
        }
      }
    }
    console.log(`  ✅ Generated ${qualifications.length} crew qualifications`);
    await batchInsert("crew_qualifications", qualifications);
    console.log("");

    // Step 10: Generate Roster Assignments
    console.log("📦 Step 10: Generating Roster Assignments...");
    const rosterAssignments: any[] = [];
    const periodStart = new Date();
    periodStart.setMonth(periodStart.getMonth() - 1);
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Generate roster assignments for recent trips
    const recentTrips = trips
      .filter((t) => {
        const tripDate = new Date(t.trip_date);
        return tripDate >= periodStart && tripDate <= periodEnd;
      })
      .slice(0, 10000); // Limit to 10k for performance

    for (const trip of recentTrips) {
      const crewOnTrip = crewMembers.find(
        (c) =>
          c.id === trip.captain_id ||
          c.id === trip.first_officer_id ||
          c.id === trip.senior_fa_id ||
          c.id === trip.junior_fa_id
      );
      if (crewOnTrip) {
        rosterAssignments.push(
          generateRosterAssignment(crewOnTrip, trip, periodStart, periodEnd)
        );
      }
    }
    console.log(
      `  ✅ Generated ${rosterAssignments.length} roster assignments`
    );
    await batchInsert("roster_assignments", rosterAssignments);
    console.log("");

    // Summary
    console.log("================================================");
    console.log("✅ Data Generation Complete!");
    console.log("================================================");
    console.log(`👥 Crew Members: ${crewMembers.length}`);
    console.log(`✈️  Trips: ${trips.length}`);
    console.log(`💰 Pay Claims: ${claims.length}`);
    console.log(`📚 Training Records: ${trainingRecords.length}`);
    console.log(`🚨 Compliance Violations: ${violations.length}`);
    console.log(`⚠️  Disruptions: ${disruptions.length}`);
    console.log(`👤 Admin Users: ${adminUsers.length}`);
    console.log(`💳 Payment Batches: ${paymentBatches.length}`);
    console.log(`💵 Payment Items: ${paymentItems.length}`);
    console.log(`🎓 Crew Qualifications: ${qualifications.length}`);
    console.log(`📅 Roster Assignments: ${rosterAssignments.length}`);

    // Verify data was actually inserted
    console.log("\n🔍 Verifying data in database...");
    try {
      const verifyCrew = await sql`SELECT COUNT(*) as count FROM crew_members`;
      const verifyTrips = await sql`SELECT COUNT(*) as count FROM trips`;
      const verifyClaims = await sql`SELECT COUNT(*) as count FROM pay_claims`;

      const crewCount = parseInt(verifyCrew[0]?.count || "0");
      const tripsCount = parseInt(verifyTrips[0]?.count || "0");
      const claimsCount = parseInt(verifyClaims[0]?.count || "0");

      console.log(`  ✅ Verified in database:`);
      console.log(`     Crew Members: ${crewCount.toLocaleString()}`);
      console.log(`     Trips: ${tripsCount.toLocaleString()}`);
      console.log(`     Claims: ${claimsCount.toLocaleString()}`);

      if (crewCount === 0 && tripsCount === 0) {
        console.log("\n⚠️  WARNING: Data appears to not be in database!");
        console.log("   This might indicate:");
        console.log("   1. DATABASE_URL points to a different database/branch");
        console.log("   2. Connection issue with Neon");
        console.log("   3. Transaction not committed");
        console.log(
          `\n   Current DATABASE_URL: ${
            DATABASE_URL
              ? DATABASE_URL.replace(/:[^:@]+@/, ":****@")
              : "NOT SET"
          }`
        );
      }
    } catch (verifyError: any) {
      console.error(`  ⚠️  Verification failed: ${verifyError.message}`);
    }

    console.log(
      "\n🎉 Your database is now ready for comprehensive industry-level stress testing!"
    );

    // Close PostgreSQL client connection
    if (pgClient) {
      await pgClient.end();
      pgClient = null;
    }
  } catch (error: any) {
    // Close PostgreSQL client connection on error
    if (pgClient) {
      await pgClient.end().catch(() => {});
      pgClient = null;
    }
    console.error("\n❌ Generation failed:", error.message);
    if (error.message.length > 200) {
      console.error(`   Error: ${error.message.substring(0, 200)}...`);
    }
    process.exit(1);
  }
}

// Run if called directly
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("generate-industry-data.ts") ||
  process.argv[1]?.endsWith("generate-industry-data.js");

if (isMainModule) {
  // Allow config override via command line
  const args = process.argv.slice(2);
  let customConfig = DEFAULT_CONFIG;

  if (args.includes("--small")) {
    customConfig = {
      ...DEFAULT_CONFIG,
      totalCrewMembers: 1000,
      captains: 150,
      firstOfficers: 250,
      seniorFA: 200,
      juniorFA: 400,
      yearsOfHistory: 0.5,
    };
  } else if (args.includes("--large")) {
    customConfig = {
      ...DEFAULT_CONFIG,
      totalCrewMembers: 10000,
      captains: 1500,
      firstOfficers: 2500,
      seniorFA: 2000,
      juniorFA: 4000,
      yearsOfHistory: 2,
    };
  }

  // Check for real data flag
  if (args.includes("--real-data") || args.includes("--use-real")) {
    customConfig.useRealAviationData = true;
  } else if (args.includes("--random-data") || args.includes("--synthetic")) {
    customConfig.useRealAviationData = false;
  }

  generateIndustryData(customConfig).catch(console.error);
}

export { generateIndustryData, DEFAULT_CONFIG };
