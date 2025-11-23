import type { CrewMember, Trip, Claim } from '../types';

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

// Realistic name pools for diverse crew
const FIRST_NAMES = [
  // Male names
  'John', 'Michael', 'David', 'James', 'Robert', 'Carlos', 'Juan', 'Luis', 'Miguel', 'Jose',
  'Alexander', 'Daniel', 'Christopher', 'Matthew', 'Andrew', 'Ricardo', 'Fernando', 'Antonio',
  'Diego', 'Santiago', 'Gabriel', 'Javier', 'Rafael', 'Pablo', 'Eduardo', 'Manuel',
  // Female names
  'Sarah', 'Maria', 'Jennifer', 'Emily', 'Linda', 'Ana', 'Carmen', 'Sofia', 'Isabella', 'Valentina',
  'Patricia', 'Jessica', 'Michelle', 'Amanda', 'Laura', 'Gabriela', 'Daniela', 'Andrea',
  'Camila', 'Lucia', 'Elena', 'Monica', 'Victoria', 'Alejandra', 'Fernanda', 'Mariana'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Rodriguez', 'Hernandez',
  'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Walker', 'Perez', 'Sanchez', 'Torres', 'Rivera', 'Gomez', 'Diaz', 'Cruz', 'Morales',
  'Reyes', 'Jimenez', 'Castillo', 'Ortiz', 'Gutierrez', 'Chavez', 'Ramos', 'Silva', 'Rojas',
  'Mendoza', 'Vargas', 'Castro', 'Santos', 'Medina', 'Rios', 'Alvarez', 'Fernandez'
];

// Aircraft and route configurations
const BASES = ['PTY', 'GUA', 'SJO', 'BOG', 'LIM', 'MIA', 'MEX', 'CUN', 'SCL', 'EZE'];

const CITY_PAIRS = [
  // Panama City hub routes
  { from: 'PTY', to: 'GUA', international: false, distance: 600 },
  { from: 'PTY', to: 'SJO', international: false, distance: 350 },
  { from: 'PTY', to: 'BOG', international: true, distance: 500 },
  { from: 'PTY', to: 'LIM', international: true, distance: 1100 },
  { from: 'PTY', to: 'MIA', international: true, distance: 1200 },
  { from: 'PTY', to: 'MEX', international: true, distance: 1600 },
  { from: 'PTY', to: 'CUN', international: true, distance: 900 },
  { from: 'PTY', to: 'SCL', international: true, distance: 2500 },
  { from: 'PTY', to: 'EZE', international: true, distance: 3000 },
  // Cross-connections
  { from: 'GUA', to: 'MIA', international: true, distance: 1100 },
  { from: 'GUA', to: 'MEX', international: true, distance: 600 },
  { from: 'SJO', to: 'MIA', international: true, distance: 1200 },
  { from: 'BOG', to: 'MIA', international: true, distance: 1300 },
  { from: 'LIM', to: 'BOG', international: true, distance: 800 },
  { from: 'MEX', to: 'MIA', international: true, distance: 1000 },
  { from: 'CUN', to: 'MIA', international: true, distance: 500 }
];

const AIRCRAFT_TYPES = [
  { type: '737-800', capacity: 160, range: 2900 },
  { type: '737-MAX8', capacity: 172, range: 3550 },
  { type: '737-MAX9', capacity: 178, range: 3550 },
  { type: 'E190', capacity: 100, range: 2450 }
];

interface GenerationConfig {
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
  useRealisticDistributions: boolean;
  useSeasonalPatterns: boolean;
  generateEdgeCases: boolean;
}

export interface TestDataAgentResponse {
  scenarioId?: string | null;
  stats: {
    crewMembers: number;
    trips: number;
    claims: number;
    violations: number;
    disruptions: number;
    timeSpan: string;
    dataPoints: number;
  };
  aiPlan: {
    summary: string;
    recommendedSteps?: string[];
    qaChecklist?: string[];
    datasetSamples?: {
      crewMembers?: Array<{ name: string; role: string; base: string; focus?: string }>;
      trips?: Array<{ route: string; flightNumber?: string; seasonality?: string; notes?: string }>;
      claims?: Array<{ claimType: string; pattern?: string; amountHint?: string; contractReference?: string }>;
    };
    riskAlerts?: string[];
  };
  provider: string;
  model: string;
  tokensUsed: number;
  generatedAt: string;
  warning?: string;
}

type CrewRole = 'Captain' | 'First Officer' | 'Senior FA' | 'Junior FA';

class DataGenerationService {
  private random = Math.random;
  private llmBlueprintCache = new Map<string, TestDataAgentResponse>();

  // Utility: Random selection from array
  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(this.random() * array.length)];
  }

  // Utility: Random number in range
  private randomInt(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // Utility: Normal distribution (Box-Muller transform)
  private normalRandom(mean: number, stdDev: number): number {
    const u1 = this.random();
    const u2 = this.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  // Utility: Date manipulation
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Generate realistic crew member
  private generateCrewMember(
    id: string,
    role: CrewRole,
    config: GenerationConfig
  ): Omit<CrewMember, 'id'> {
    const firstName = this.randomChoice(FIRST_NAMES);
    const lastName = this.randomChoice(LAST_NAMES);
    const base = this.randomChoice(BASES);

    // Realistic seniority distribution
    let seniority: number;
    if (config.useRealisticDistributions) {
      // Use normal distribution centered around 10 years
      seniority = Math.max(1, Math.min(35, Math.round(this.normalRandom(10, 6))));
    } else {
      seniority = this.randomInt(1, 30);
    }

    // Qualifications based on role
    const qualification = role === 'Captain' || role === 'First Officer'
      ? this.randomChoice(['737-800', '737-MAX8', 'E190'])
      : 'N/A';

    const currentPay = {
      amount: this.calculateBasePay(role, seniority),
      period: 'Current Period'
    };

    const ytdEarnings = currentPay.amount * 12 * (1 + this.random() * 0.2);

    return {
      name: `${firstName} ${lastName}`,
      role,
      seniority,
      base,
      qualification,
      currentPay,
      ytdEarnings: Math.round(ytdEarnings),
      upcomingTraining: this.random() > 0.7 ? {
        type: this.randomChoice(['Recurrent', 'Type Rating', 'Emergency Procedures']),
        daysUntil: this.randomInt(30, 180)
      } : undefined
    };
  }

  private calculateBasePay(role: string, seniority: number): number {
    const basePay = {
      'Captain': 8000,
      'First Officer': 5000,
      'Senior FA': 3500,
      'Junior FA': 2500
    }[role] || 3000;

    // Add seniority bonus (2% per year)
    return Math.round(basePay * (1 + seniority * 0.02));
  }

  // Generate realistic trip
  private generateTrip(
    tripId: string,
    date: Date,
    crewPool: CrewMember[],
    config: GenerationConfig
  ): Omit<Trip, 'id'> {
    // Select route based on international ratio
    const isInternational = this.random() < config.internationalRatio;
    const eligibleRoutes = CITY_PAIRS.filter(r => r.international === isInternational);
    const route = this.randomChoice(eligibleRoutes);

    // Select aircraft
    const aircraft = this.randomChoice(AIRCRAFT_TYPES);

    // Calculate flight time based on distance
    const avgSpeed = 450; // mph
    const flightHours = route.distance / avgSpeed;
    const blockTime = flightHours + 0.5; // add taxi time

    // Credit hours (might differ from block time per contract)
    const creditHours = Math.max(blockTime, flightHours * 1.1);

    // Assign crew
    const captains = crewPool.filter(c => c.role === 'Captain');
    const fos = crewPool.filter(c => c.role === 'First Officer');
    const seniorFAs = crewPool.filter(c => c.role === 'Senior FA');
    const juniorFAs = crewPool.filter(c => c.role === 'Junior FA');

    const captain = this.randomChoice(captains);
    const fo = this.randomChoice(fos);
    const seniorFA = this.randomChoice(seniorFAs);
    const juniorFA = this.randomChoice(juniorFAs);

    // Determine status based on date
    const now = new Date();
    let status: string;
    if (date < now) {
      status = this.random() > 0.95 ? 'cancelled' : 'completed';
    } else if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      status = 'scheduled';
    } else {
      status = 'scheduled';
    }

    return {
      trip_date: date.toISOString().split('T')[0],
      route: `${route.from} → ${route.to}`,
      flight_numbers: `CM${this.randomInt(100, 999)}`,
      departure_time: `${this.randomInt(6, 22).toString().padStart(2, '0')}:${this.randomChoice(['00', '15', '30', '45'])}`,
      arrival_time: `${this.randomInt(6, 22).toString().padStart(2, '0')}:${this.randomChoice(['00', '15', '30', '45'])}`,
      flight_time_hours: parseFloat(flightHours.toFixed(2)),
      credit_hours: parseFloat(creditHours.toFixed(2)),
      layover_city: route.to,
      is_international: isInternational,
      aircraft_type: aircraft.type,
      status,
      captain_id: captain.id,
      first_officer_id: fo.id,
      senior_fa_id: seniorFA.id,
      junior_fa_id: juniorFA.id
    };
  }

  // Generate realistic claim
  private generateClaim(
    crewMember: CrewMember,
    trip: Trip,
    date: Date,
    config: GenerationConfig
  ): Omit<Claim, 'id'> {
    // Select claim type based on distribution
    const claimTypes = config.claimTypes;
    const total = Object.values(claimTypes).reduce((a, b) => a + b, 0);
    let rand = this.random() * total;

    let claimType = 'Per Diem';
    for (const [type, weight] of Object.entries(claimTypes)) {
      rand -= weight;
      if (rand <= 0) {
        claimType = this.formatClaimType(type);
        break;
      }
    }

    // Calculate amount based on type
    let amount = 0;
    let contractRef = 'CBA Section 12';

    switch (claimType) {
      case 'International Premium':
        amount = 125;
        contractRef = 'CBA Section 12.4.1';
        break;
      case 'Per Diem': {
        const days = this.randomInt(1, 4);
        amount = (trip.is_international ? 95 : 75) * days;
        contractRef = 'CBA Section 8.2';
        break;
      }
      case 'Holiday Pay':
        amount = 150;
        contractRef = 'CBA Section 11.3';
        break;
      case 'Overtime': {
        const hours = this.randomInt(5, 20);
        amount = hours * 85 * 1.5;
        contractRef = 'CBA Section 7.1';
        break;
      }
      case 'Layover Premium':
        amount = 50;
        contractRef = 'CBA Section 9.5';
        break;
      case 'Training Pay':
        amount = 200;
        contractRef = 'CBA Section 14.2';
        break;
      case 'Lead Premium':
        amount = 100 * trip.credit_hours;
        contractRef = 'CBA Section 13.1';
        break;
      case 'Deadhead Compensation':
        amount = 75;
        contractRef = 'CBA Section 10.4';
        break;
      default:
        amount = this.randomInt(50, 200);
        contractRef = 'CBA Section 15';
    }

    // Add some variation (±10%)
    amount = Math.round(amount * (0.9 + this.random() * 0.2));

    // Determine status (most are pending initially)
    const statusRand = this.random();
    const status: 'pending' | 'approved' | 'rejected' | 'under-review' =
      statusRand < 0.6 ? 'approved' :
      statusRand < 0.85 ? 'pending' :
      statusRand < 0.95 ? 'under-review' :
      'rejected';

    const aiValidated = this.random() > 0.2;
    const aiExplanation = aiValidated
      ? `AI validated: ${claimType} claim appears compliant with ${contractRef}. Amount calculation verified.`
      : 'Pending AI validation';

    return {
      crew_id: crewMember.id,
      claim_type: claimType,
      trip_id: trip.id,
      claim_date: date.toISOString().split('T')[0],
      amount,
      status,
      ai_validated: aiValidated,
      ai_explanation: aiExplanation,
      contract_reference: contractRef,
      notes: config.generateEdgeCases && this.random() > 0.9
        ? 'Edge case: Boundary condition testing'
        : undefined
    };
  }

  private formatClaimType(type: string): string {
    const mapping: Record<string, string> = {
      internationalPremium: 'International Premium',
      perDiem: 'Per Diem',
      holidayPay: 'Holiday Pay',
      overtime: 'Overtime',
      layoverPremium: 'Layover Premium',
      training: 'Training Pay',
      leadPremium: 'Lead Premium',
      deadhead: 'Deadhead Compensation',
      other: 'Other'
    };
    return mapping[type] || type;
  }

  // Main generation function
  async generate(config: GenerationConfig): Promise<{
    crewMembers: CrewMember[];
    trips: Trip[];
    claims: Claim[];
  }> {
    const startDate = new Date(config.startDate);
    const totalMonths = config.yearsOfHistory * 12;

    // Generate crew members
    console.log('Generating crew members...');
    const crewMembers: CrewMember[] = [];

    const roleDistribution = {
      'Captain': config.captains / 100,
      'First Officer': config.firstOfficers / 100,
      'Senior FA': config.seniorFA / 100,
      'Junior FA': config.juniorFA / 100
    };

    for (let i = 0; i < config.totalCrewMembers; i++) {
      const rand = this.random();
      let role: CrewRole = 'Captain';
      let cumulative = 0;

      for (const [r, weight] of Object.entries(roleDistribution)) {
        cumulative += weight;
        if (rand < cumulative) {
          role = r as CrewRole;
          break;
        }
      }

      const crewId = `CREW-${(i + 1).toString().padStart(4, '0')}`;
      const member = this.generateCrewMember(crewId, role, config);
      crewMembers.push({ id: crewId, ...member } as CrewMember);
    }

    // Generate trips
    console.log('Generating trips...');
    const trips: Trip[] = [];
    let tripCounter = 100;

    for (let month = 0; month < totalMonths; month++) {
      const monthDate = this.addMonths(startDate, month);

      // Apply seasonal variation if enabled
      let monthlyTripMultiplier = 1;
      if (config.useSeasonalPatterns) {
        const monthNum = monthDate.getMonth();
        // Peak travel: June-August (summer), December (holidays)
        if (monthNum >= 5 && monthNum <= 7) monthlyTripMultiplier = 1.3;
        else if (monthNum === 11) monthlyTripMultiplier = 1.4;
        // Low travel: January-February, September
        else if (monthNum <= 1 || monthNum === 8) monthlyTripMultiplier = 0.8;
      }

      const tripsThisMonth = Math.round(
        config.totalCrewMembers * config.averageTripsPerMonth * monthlyTripMultiplier / 4
      );

      for (let t = 0; t < tripsThisMonth; t++) {
        const dayOfMonth = this.randomInt(1, 28);
        const tripDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayOfMonth);

        const tripId = `CM${tripCounter++}`;
        const trip = this.generateTrip(tripId, tripDate, crewMembers, config);
        trips.push({ id: tripId, ...trip } as Trip);
      }
    }

    // Generate claims
    console.log('Generating claims...');
    const claims: Claim[] = [];
    let claimCounter = 1;

    for (const member of crewMembers) {
      const memberTrips = trips.filter(t =>
        t.captain_id === member.id ||
        t.first_officer_id === member.id ||
        t.senior_fa_id === member.id ||
        t.junior_fa_id === member.id
      );

      const numClaims = Math.round(
        config.claimFrequency * config.yearsOfHistory * (0.8 + this.random() * 0.4)
      );

      for (let c = 0; c < numClaims && c < memberTrips.length; c++) {
        const trip = this.randomChoice(memberTrips);
        const claimDate = new Date(trip.trip_date);
        claimDate.setDate(claimDate.getDate() + this.randomInt(1, 7)); // Claim filed within a week

        const claimId = `CLM-2024-${claimCounter.toString().padStart(4, '0')}`;
        const claim = this.generateClaim(member, trip, claimDate, config);
        claims.push({ id: claimId, ...claim } as Claim);
        claimCounter++;
      }
    }

    return { crewMembers, trips, claims };
  }

  // Persist generated data to database
  async persistToDatabase(data: {
    crewMembers: CrewMember[];
    trips: Trip[];
    claims: Claim[];
  }): Promise<void> {
    // This would integrate with your database service
    // For now, we'll simulate the persistence
    console.log('Persisting to database...');
    console.log(`- ${data.crewMembers.length} crew members`);
    console.log(`- ${data.trips.length} trips`);
    console.log(`- ${data.claims.length} claims`);

    // In a real implementation, you would batch insert these into the database
    // using the crewService or a direct database connection
  }

  private buildCacheKey(
    config: GenerationConfig,
    scenarioId?: string | null,
    llmPreference?: { provider?: string; model?: string }
  ): string {
    return JSON.stringify({
      scenarioId: scenarioId || 'custom',
      llm: llmPreference?.provider || 'auto',
      model: llmPreference?.model,
      config
    });
  }

  async requestLLMBlueprint(
    config: GenerationConfig,
    scenarioId?: string | null,
    llmPreference?: { provider?: 'ollama' | 'anthropic'; model?: string; skipOllama?: boolean }
  ): Promise<TestDataAgentResponse> {
    const cacheKey = this.buildCacheKey(config, scenarioId, llmPreference);
    const cached = this.llmBlueprintCache.get(cacheKey);
    if (cached) {
      return JSON.parse(JSON.stringify(cached)) as TestDataAgentResponse;
    }

    const response = await fetch(`${API_URL}/api/agents/test-data/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config,
        scenarioId,
        llmPreference
      })
    });

    if (!response.ok) {
      let message = 'Test data agent unavailable';
      try {
        const error = await response.json();
        message = error?.message || error?.error || message;
      } catch (err) {
        console.warn('Failed to parse test data agent error response:', err);
      }
      throw new Error(message);
    }

    const payload = await response.json() as TestDataAgentResponse;
    this.llmBlueprintCache.set(cacheKey, payload);
    return payload;
  }

  async cleanupTestData(preserveCrew = true): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/agents/test-data/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preserveCrew })
      });

      if (!response.ok) {
        let message = 'Failed to clean up test data';
        try {
          const error = await response.json();
          message = error?.message || error?.error || message;
        } catch (err) {
          console.warn('Failed to parse cleanup error response:', err);
        }
        return { success: false, message };
      }

      const payload = await response.json();
      if (payload?.clearedScenarios) {
        // Reset cache for cleared scenarios to avoid stale data reuse
        this.llmBlueprintCache.clear();
      }
      return { success: true, message: payload?.message };
    } catch (error) {
      console.error('Cleanup error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Cleanup request failed'
      };
    }
  }

  clearBlueprintCache(): void {
    this.llmBlueprintCache.clear();
  }
}

export const dataGenerationService = new DataGenerationService();
