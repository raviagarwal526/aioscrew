/**
 * Neo4j Seed Script
 * Populates Neo4j with CBA contract data (sections, rules, relationships)
 */

import 'dotenv/config';
import { initNeo4jDriver, executeWriteQuery, closeNeo4jDriver } from '../services/neo4j-service.js';

/**
 * Clear existing data (optional - use with caution)
 */
async function clearDatabase(): Promise<void> {
  console.log('🗑️  Clearing existing Neo4j data...');
  await executeWriteQuery('MATCH (n) DETACH DELETE n');
  console.log('✅ Database cleared');
}

/**
 * Create indexes for better query performance
 */
async function createIndexes(): Promise<void> {
  console.log('📇 Creating indexes...');
  
  const indexes = [
    'CREATE INDEX contract_section_reference IF NOT EXISTS FOR (s:ContractSection) ON (s.reference)',
    'CREATE INDEX contract_section_type IF NOT EXISTS FOR (s:ContractSection) ON (s.type)',
    'CREATE INDEX claim_type_type IF NOT EXISTS FOR (c:ClaimType) ON (c.type)',
    'CREATE INDEX compliance_rule_type IF NOT EXISTS FOR (r:ComplianceRule) ON (r.type)',
    'CREATE INDEX premium_pay_rate_type IF NOT EXISTS FOR (r:PremiumPayRate) ON (r.type)',
  ];

  for (const indexQuery of indexes) {
    try {
      await executeWriteQuery(indexQuery);
    } catch (error) {
      // Index might already exist, that's okay
      console.log(`Index creation skipped (may already exist): ${indexQuery.substring(0, 50)}...`);
    }
  }
  
  console.log('✅ Indexes created');
}

/**
 * Seed Contract Sections
 */
async function seedContractSections(): Promise<void> {
  console.log('📄 Seeding contract sections...');

  const sections = [
    {
      reference: 'CBA Section 12.4',
      title: 'International Premium Pay',
      type: 'premium-pay',
      text: 'Crew members shall receive $125 per flight segment to destinations outside the continental United States. This includes Central America, South America, and Caribbean destinations. Examples include Guatemala (GUA), Panama (PTY), Costa Rica (SJO), Colombia (BOG), and Ecuador (GYE).',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 14.3',
      title: 'Night Premium',
      type: 'premium-pay',
      text: 'Crew members shall receive $5 per hour for flights operating between 2200 and 0600 local time. This premium applies to all flight time during these hours.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 15.2',
      title: 'Holiday Premium',
      type: 'premium-pay',
      text: 'Crew members shall receive 1.5x their hourly rate for work performed on major holidays. Major holidays include New Year\'s Day, Memorial Day, Independence Day, Thanksgiving Day, and Christmas Day.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 18.5',
      title: 'Reserve Call-Out',
      type: 'premium-pay',
      text: 'When a reserve crew member is called out, they shall receive a minimum of 4 hours pay at their regular rate, regardless of actual flight time.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 20.2',
      title: 'Training Premium',
      type: 'premium-pay',
      text: 'Crew members shall receive $75 per day for recurrent training days. This applies to all mandatory recurrent training sessions.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 11.3',
      title: 'Filing Deadline',
      type: 'compliance',
      text: 'All claims must be submitted within 7 days of trip completion. Claims filed after this deadline may be denied unless extenuating circumstances are documented.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 11.4',
      title: 'Duplicate Prevention',
      type: 'compliance',
      text: 'Only one claim per trip per crew member per pay type shall be accepted. Duplicate claims for the same trip and pay type will be rejected.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 11.5',
      title: 'Qualification Requirements',
      type: 'compliance',
      text: 'Crew members must have valid qualification for the work claimed. For example, international premium requires international route qualification. Claims without proper qualification will be denied.',
      relevance: 1.0,
    },
    {
      reference: 'CBA Section 11.6',
      title: 'Documentation Requirements',
      type: 'compliance',
      text: 'Claims over $100 must include supporting documentation such as receipts, flight records, or other relevant documents. Missing documentation may result in claim denial or request for additional information.',
      relevance: 1.0,
    },
  ];

  for (const section of sections) {
    await executeWriteQuery(`
      MERGE (s:ContractSection {reference: $reference})
      SET s.title = $title,
          s.type = $type,
          s.text = $text,
          s.relevance = $relevance
    `, section);
  }

  console.log(`✅ Seeded ${sections.length} contract sections`);
}

/**
 * Seed Claim Types
 */
async function seedClaimTypes(): Promise<void> {
  console.log('🏷️  Seeding claim types...');

  const claimTypes = [
    { type: 'International Premium', description: 'Premium pay for international flights' },
    { type: 'Holiday Premium', description: 'Premium pay for work on holidays' },
    { type: 'Night Premium', description: 'Premium pay for night flights' },
    { type: 'Reserve Call-Out', description: 'Minimum pay for reserve call-outs' },
    { type: 'Training Premium', description: 'Premium pay for training days' },
    { type: 'Per Diem', description: 'Overnight per diem allowance' },
  ];

  for (const claimType of claimTypes) {
    await executeWriteQuery(`
      MERGE (c:ClaimType {type: $type})
      SET c.description = $description
    `, claimType);
  }

  console.log(`✅ Seeded ${claimTypes.length} claim types`);
}

/**
 * Seed Compliance Rules
 */
async function seedComplianceRules(): Promise<void> {
  console.log('✅ Seeding compliance rules...');

  const rules = [
    {
      type: 'filing_deadline',
      description: 'Claims must be submitted within 7 days of trip completion',
      deadlineDays: 7,
      requiredDocumentation: null,
      qualificationRequired: false,
      redFlags: ['Filed after deadline', 'No extenuating circumstances documented'],
    },
    {
      type: 'duplicate_prevention',
      description: 'Only one claim per trip per crew member per pay type',
      deadlineDays: null,
      requiredDocumentation: null,
      qualificationRequired: false,
      redFlags: ['Multiple claims for same trip', 'Same pay type claimed twice'],
    },
    {
      type: 'qualification_requirement',
      description: 'Crew must have valid qualification for claimed work',
      deadlineDays: null,
      requiredDocumentation: null,
      qualificationRequired: true,
      redFlags: ['International premium without international qualification', 'Training claim without training record'],
    },
    {
      type: 'documentation_requirement',
      description: 'Claims over $100 require supporting documentation',
      deadlineDays: null,
      requiredDocumentation: 'Receipts, flight records, or relevant documents',
      qualificationRequired: false,
      redFlags: ['High-value claim without documentation', 'Missing receipts for per diem'],
    },
  ];

  for (const rule of rules) {
    await executeWriteQuery(`
      MERGE (r:ComplianceRule {type: $type})
      SET r.description = $description,
          r.deadlineDays = $deadlineDays,
          r.requiredDocumentation = $requiredDocumentation,
          r.qualificationRequired = $qualificationRequired,
          r.redFlags = $redFlags
    `, rule);
  }

  console.log(`✅ Seeded ${rules.length} compliance rules`);
}

/**
 * Seed Premium Pay Rates
 */
async function seedPremiumPayRates(): Promise<void> {
  console.log('💰 Seeding premium pay rates...');

  const rates = [
    {
      type: 'International Premium',
      amount: 125.00,
      formula: '$125 per flight segment',
      conditions: 'Destinations outside continental US (Central America, South America, Caribbean)',
      applicableDestinations: ['GUA', 'PTY', 'SJO', 'BOG', 'GYE', 'LIM', 'SCL', 'MEX', 'CUN'],
    },
    {
      type: 'Holiday Premium',
      amount: null, // Multiplier-based
      formula: '1.5x hourly rate',
      conditions: 'Work performed on major holidays (New Year\'s, Memorial Day, Independence Day, Thanksgiving, Christmas)',
      applicableDestinations: null,
    },
    {
      type: 'Night Premium',
      amount: 5.00,
      formula: '$5 per hour',
      conditions: 'Flights operating between 2200-0600 local time',
      applicableDestinations: null,
    },
    {
      type: 'Reserve Call-Out',
      amount: null, // Minimum hours-based
      formula: 'Minimum 4 hours at regular rate',
      conditions: 'When reserve crew member is called out',
      applicableDestinations: null,
    },
    {
      type: 'Training Premium',
      amount: 75.00,
      formula: '$75 per day',
      conditions: 'Recurrent training days',
      applicableDestinations: null,
    },
  ];

  for (const rate of rates) {
    await executeWriteQuery(`
      MERGE (r:PremiumPayRate {type: $type})
      SET r.amount = $amount,
          r.formula = $formula,
          r.conditions = $conditions,
          r.applicableDestinations = $applicableDestinations
    `, rate);
  }

  console.log(`✅ Seeded ${rates.length} premium pay rates`);
}

/**
 * Create relationships between nodes
 */
async function createRelationships(): Promise<void> {
  console.log('🔗 Creating relationships...');

  // Link contract sections to claim types
  const sectionToClaimType = [
    { section: 'CBA Section 12.4', claimType: 'International Premium' },
    { section: 'CBA Section 14.3', claimType: 'Night Premium' },
    { section: 'CBA Section 15.2', claimType: 'Holiday Premium' },
    { section: 'CBA Section 18.5', claimType: 'Reserve Call-Out' },
    { section: 'CBA Section 20.2', claimType: 'Training Premium' },
  ];

  for (const link of sectionToClaimType) {
    await executeWriteQuery(`
      MATCH (s:ContractSection {reference: $section})
      MATCH (c:ClaimType {type: $claimType})
      MERGE (s)-[:APPLIES_TO]->(c)
    `, link);
  }

  // Link compliance rules to contract sections
  const ruleToSection = [
    { rule: 'filing_deadline', section: 'CBA Section 11.3' },
    { rule: 'duplicate_prevention', section: 'CBA Section 11.4' },
    { rule: 'qualification_requirement', section: 'CBA Section 11.5' },
    { rule: 'documentation_requirement', section: 'CBA Section 11.6' },
  ];

  for (const link of ruleToSection) {
    await executeWriteQuery(`
      MATCH (r:ComplianceRule {type: $rule})
      MATCH (s:ContractSection {reference: $section})
      MERGE (r)-[:DEFINED_IN]->(s)
    `, link);
  }

  // Link premium pay rates to contract sections
  const rateToSection = [
    { rate: 'International Premium', section: 'CBA Section 12.4' },
    { rate: 'Night Premium', section: 'CBA Section 14.3' },
    { rate: 'Holiday Premium', section: 'CBA Section 15.2' },
    { rate: 'Reserve Call-Out', section: 'CBA Section 18.5' },
    { rate: 'Training Premium', section: 'CBA Section 20.2' },
  ];

  for (const link of rateToSection) {
    await executeWriteQuery(`
      MATCH (r:PremiumPayRate {type: $rate})
      MATCH (s:ContractSection {reference: $section})
      MERGE (r)-[:DEFINED_IN]->(s)
    `, link);
  }

  // Link related contract sections
  const relatedSections = [
    { section1: 'CBA Section 12.4', section2: 'CBA Section 11.5' }, // International Premium related to Qualification
    { section1: 'CBA Section 15.2', section2: 'CBA Section 11.3' }, // Holiday Premium related to Filing Deadline
  ];

  for (const link of relatedSections) {
    await executeWriteQuery(`
      MATCH (s1:ContractSection {reference: $section1})
      MATCH (s2:ContractSection {reference: $section2})
      MERGE (s1)-[:RELATED_TO]->(s2)
    `, link);
  }

  console.log('✅ Relationships created');
}

/**
 * Main seed function
 */
async function seed(): Promise<void> {
  try {
    console.log('🌱 Starting Neo4j seed process...\n');
    
    // Initialize driver
    initNeo4jDriver();
    
    // Optional: Clear database (uncomment if you want to start fresh)
    // await clearDatabase();
    
    // Create indexes
    await createIndexes();
    
    // Seed data
    await seedContractSections();
    await seedClaimTypes();
    await seedComplianceRules();
    await seedPremiumPayRates();
    
    // Create relationships
    await createRelationships();
    
    console.log('\n✅ Neo4j seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    throw error;
  } finally {
    await closeNeo4jDriver();
  }
}

// Run seed if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed-neo4j.ts')) {
  seed()
    .then(() => {
      console.log('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
}

export { seed };
