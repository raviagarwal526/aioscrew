/**
 * Test Data Generator Agent
 * Produces AI-guided blueprints for seed data while prioritizing local Ollama usage.
 */

import { callUnifiedLLMWithJSON, warnTestDataGeneration } from '../shared/unified-llm-client.js';

/**
 * Configuration provided by the frontend card. Mirrors the UI options.
 */
export interface TestDataConfig {
  totalCrewMembers: number;
  captains: number;
  firstOfficers: number;
  seniorFA: number;
  juniorFA: number;
  yearsOfHistory: number;
  startDate: string;
  averageTripsPerMonth: number;
  internationalRatio: number;
  claimFrequency: number;
  claimTypes: Record<string, number>;
  violationRate: number;
  disruptionRate: number;
  bases: string[];
  routes: string[];
  aircraftTypes: string[];
  useRealisticDistributions: boolean;
  useSeasonalPatterns: boolean;
  generateEdgeCases: boolean;
}

export interface TestDataAgentResult {
  scenarioId?: string | null;
  stats: GenerationStats;
  aiPlan: TestDataLLMResponse;
  provider: string;
  model: string;
  tokensUsed: number;
  generatedAt: string;
  warning?: string;
}

interface GenerationStats {
  crewMembers: number;
  trips: number;
  claims: number;
  violations: number;
  disruptions: number;
  timeSpan: string;
  dataPoints: number;
}

interface SampleCrew {
  name: string;
  role: string;
  base: string;
  seniority: string;
  focus?: string;
}

interface SampleTrip {
  route: string;
  flightNumber: string;
  seasonality: string;
  notes?: string;
}

interface SampleClaim {
  claimType: string;
  pattern: string;
  amountHint: string;
  contractReference?: string;
}

interface TestDataLLMResponse {
  summary: string;
  recommendedSteps: string[];
  qaChecklist: string[];
  datasetSamples: {
    crewMembers: SampleCrew[];
    trips: SampleTrip[];
    claims: SampleClaim[];
  };
  riskAlerts?: string[];
}

const DEFAULT_CONFIG: TestDataConfig = {
  totalCrewMembers: 500,
  captains: 25,
  firstOfficers: 25,
  seniorFA: 25,
  juniorFA: 25,
  yearsOfHistory: 10,
  startDate: '2015-01-01',
  averageTripsPerMonth: 15,
  internationalRatio: 0.3,
  claimFrequency: 4,
  claimTypes: {
    internationalPremium: 25,
    perDiem: 25,
    holidayPay: 10,
    overtime: 15,
    layoverPremium: 8,
    training: 5,
    leadPremium: 5,
    deadhead: 4,
    other: 3
  },
  violationRate: 2,
  disruptionRate: 5,
  bases: ['PTY', 'GUA', 'MIA', 'MEX'],
  routes: ['PTY-GUA', 'PTY-MIA', 'PTY-MEX', 'GUA-MIA', 'MIA-MEX'],
  aircraftTypes: ['737-800', '737-MAX8', 'E190'],
  useRealisticDistributions: true,
  useSeasonalPatterns: true,
  generateEdgeCases: false
};

const SYSTEM_PROMPT = `You are a Copa Airlines data generation engineer.
Design synthetic data blueprints for crew members, trips, and claims.
Focus on realistic airline operations, ensuring every recommendation can be executed by engineers.

Respond with JSON using this schema:
{
  "summary": "high-level description",
  "recommendedSteps": ["step 1", "step 2"],
  "qaChecklist": ["validation 1", "validation 2"],
  "datasetSamples": {
    "crewMembers": [
      {"name": "...", "role": "...", "base": "...", "seniority": "...", "focus": "..."}
    ],
    "trips": [
      {"route": "...", "flightNumber": "...", "seasonality": "...", "notes": "..."}
    ],
    "claims": [
      {"claimType": "...", "pattern": "...", "amountHint": "...", "contractReference": "..."}
    ]
  },
  "riskAlerts": ["optional risk callouts"]
}

Keep responses concise, actionable, and grounded in the provided configuration.`;

/**
 * Merge user-provided configuration with defaults for safety.
 */
export function normalizeConfig(config: Partial<TestDataConfig> = {}): TestDataConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    claimTypes: {
      ...DEFAULT_CONFIG.claimTypes,
      ...(config.claimTypes || {})
    },
    bases: config.bases && config.bases.length > 0 ? config.bases : DEFAULT_CONFIG.bases,
    routes: config.routes && config.routes.length > 0 ? config.routes : DEFAULT_CONFIG.routes,
    aircraftTypes: config.aircraftTypes && config.aircraftTypes.length > 0
      ? config.aircraftTypes
      : DEFAULT_CONFIG.aircraftTypes
  };
}

/**
 * Calculate approximate stats for progress UI + guardrails.
 */
function calculateStats(config: TestDataConfig): GenerationStats {
  const totalTrips = config.totalCrewMembers *
    config.averageTripsPerMonth *
    12 *
    config.yearsOfHistory;

  const totalClaims = config.totalCrewMembers *
    config.claimFrequency *
    config.yearsOfHistory;

  const totalViolations = Math.floor((totalTrips / 1000) * config.violationRate);
  const totalDisruptions = Math.floor((totalTrips / 1000) * config.disruptionRate);

  return {
    crewMembers: config.totalCrewMembers,
    trips: Math.round(totalTrips),
    claims: Math.round(totalClaims),
    violations: totalViolations,
    disruptions: totalDisruptions,
    timeSpan: `${config.yearsOfHistory} years`,
    dataPoints: Math.round(
      config.totalCrewMembers + totalTrips + totalClaims + totalViolations + totalDisruptions
    )
  };
}

function buildUserPrompt(
  config: TestDataConfig,
  stats: GenerationStats,
  scenarioId?: string | null
): string {
  const claimBreakdown = Object.entries(config.claimTypes)
    .map(([key, value]) => `- ${key}: ${value}%`)
    .join('\n');

  return `Generate Copa Airlines synthetic dataset guidance.
Scenario: ${scenarioId || 'custom'}
Crew: ${config.totalCrewMembers} (${config.captains}% captains, ${config.firstOfficers}% FOs, ${config.seniorFA}% senior FA, ${config.juniorFA}% junior FA)
Time span: ${config.yearsOfHistory} years starting ${config.startDate}
Trips/month per crew: ${config.averageTripsPerMonth}
International mix: ${(config.internationalRatio * 100).toFixed(0)}%
Edge cases: ${config.generateEdgeCases ? 'Include' : 'Exclude'}
Seasonality enabled: ${config.useSeasonalPatterns ? 'yes' : 'no'}
Realistic distributions: ${config.useRealisticDistributions ? 'yes' : 'no'}

Projected volume:
- Crew members: ${stats.crewMembers.toLocaleString()}
- Trips: ${stats.trips.toLocaleString()}
- Claims: ${stats.claims.toLocaleString()}
- Violations per 1k trips: ${config.violationRate}
- Disruptions per 1k trips: ${config.disruptionRate}

Claim type distribution:
${claimBreakdown}

Include concrete SQL-ready guidance, QA checks, and a few sample rows for each entity.`;
}

function buildFallbackPlan(stats: GenerationStats, config: TestDataConfig): TestDataLLMResponse {
  return {
    summary: `Seed ~${stats.crewMembers} crew, ${stats.trips.toLocaleString()} trips, and ${stats.claims.toLocaleString()} claims across ${stats.timeSpan}. Split crews across bases ${config.bases.join(', ')} with ${(config.internationalRatio * 100).toFixed(0)}% international flying.`,
    recommendedSteps: [
      'Batch insert crew by role and base to honor seniority distributions',
      'Generate trips per month applying seasonality multipliers (1.3x summer, 0.8x shoulder)',
      'Link claims to flown trips, respecting claim type weights and contract references',
      'Run violation/disruption sampling once per 1k trips using configured rates'
    ],
    qaChecklist: [
      'Validate crew totals per role equal overall headcount',
      'Confirm trip counts per month align with average and seasonal modifiers',
      'Ensure claim totals per type align with provided percentages ±2%',
      'Spot-check international ratio against target percentage'
    ],
    datasetSamples: {
      crewMembers: [
        { name: 'Maria Perez', role: 'Captain', base: 'PTY', seniority: '14 yrs', focus: 'International long-haul' },
        { name: 'Javier Lopez', role: 'First Officer', base: 'MIA', seniority: '6 yrs', focus: 'North America network' }
      ],
      trips: [
        { route: 'PTY → GUA', flightNumber: 'CM412', seasonality: 'Year-round', notes: 'High per-diem utilization' },
        { route: 'PTY → MEX', flightNumber: 'CM702', seasonality: 'Peak summer', notes: 'Counts toward international premium' }
      ],
      claims: [
        { claimType: 'internationalPremium', pattern: 'Applied on PTY-MEX segment', amountHint: '$125 flat', contractReference: 'CBA §12.4' },
        { claimType: 'perDiem', pattern: '3-day layover in GUA, hotel provided', amountHint: '$225', contractReference: 'CBA §8.2' }
      ]
    },
    riskAlerts: [
      'LLM agent unavailable - fallback heuristics provided',
      'Verify Ollama is running locally to enable zero-cost AI guidance'
    ]
  };
}

/**
 * Execute the test data generation agent (Ollama-first).
 */
export async function runTestDataGenerator(
  partialConfig: Partial<TestDataConfig> = {},
  scenarioId?: string | null
): Promise<TestDataAgentResult> {
  const config = normalizeConfig(partialConfig);
  const stats = calculateStats(config);

  warnTestDataGeneration(stats.crewMembers);

  try {
    const { data, raw } = await callUnifiedLLMWithJSON<TestDataLLMResponse>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(config, stats, scenarioId),
      temperature: 0.2,
      maxTokens: 1400,
      agentType: 'test-data-generator'
    });

    return {
      scenarioId,
      stats,
      aiPlan: data,
      provider: raw.provider,
      model: raw.model,
      tokensUsed: raw.usage.inputTokens + raw.usage.outputTokens,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('TestDataGenerator agent failed, using fallback plan:', error);
    const fallback = buildFallbackPlan(stats, config);

    return {
      scenarioId,
      stats,
      aiPlan: fallback,
      provider: 'fallback',
      model: 'rule-based',
      tokensUsed: 0,
      generatedAt: new Date().toISOString(),
      warning: error instanceof Error ? error.message : 'LLM agent unavailable'
    };
  }
}

