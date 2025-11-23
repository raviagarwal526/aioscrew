/**
 * Test data helpers for E2E tests
 */

export interface TestClaim {
  id: string;
  crewMemberId: string;
  tripId: string;
  amount: number;
  type: string;
  status: string;
}

export interface TestCrewMember {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  base: string;
}

export interface TestTrip {
  id: string;
  tripNumber: string;
  date: string;
  route: string;
  flightTime: number;
  creditHours: number;
}

/**
 * Sample test data based on the actual database schema
 */
export const testData = {
  crewMembers: {
    pilot1: {
      id: 'crew-001',
      name: 'Sarah Martinez',
      employeeId: 'EMP-12345',
      role: 'Captain',
      base: 'PTY',
    },
    pilot2: {
      id: 'crew-002',
      name: 'Carlos Rodriguez',
      employeeId: 'EMP-12346',
      role: 'First Officer',
      base: 'PTY',
    },
    flightAttendant: {
      id: 'crew-003',
      name: 'Maria Santos',
      employeeId: 'EMP-12347',
      role: 'Lead Flight Attendant',
      base: 'PTY',
    },
  },

  trips: {
    international: {
      id: 'trip-001',
      tripNumber: 'CM401-PTY-MIA',
      date: '2024-03-15',
      route: 'PTY → MIA → PTY',
      flightTime: 5.2,
      creditHours: 6.5,
      type: 'International',
    },
    domestic: {
      id: 'trip-002',
      tripNumber: 'CM105-PTY-DAV',
      date: '2024-03-16',
      route: 'PTY → DAV → PTY',
      flightTime: 2.1,
      creditHours: 3.0,
      type: 'Domestic',
    },
    redeye: {
      id: 'trip-003',
      tripNumber: 'CM801-PTY-GRU',
      date: '2024-03-17',
      route: 'PTY → GRU',
      flightTime: 8.5,
      creditHours: 10.2,
      type: 'Red-Eye',
    },
  },

  claims: {
    validInternational: {
      id: 'CLM-2024-1156',
      crewMemberId: 'crew-001',
      tripId: 'trip-001',
      amount: 125.00,
      type: 'International Premium',
      status: 'Pending',
      description: 'International flight premium pay',
    },
    invalidDomesticAsPremium: {
      id: 'CLM-2024-1157',
      crewMemberId: 'crew-002',
      tripId: 'trip-002',
      amount: 125.00,
      type: 'International Premium',
      status: 'Pending',
      description: 'Should be rejected - domestic flight claiming international premium',
    },
    suspiciousHighAmount: {
      id: 'CLM-2024-1158',
      crewMemberId: 'crew-003',
      tripId: 'trip-003',
      amount: 2500.00,
      type: 'Red-Eye Premium',
      status: 'Pending',
      description: 'Should be flagged - unusually high amount',
    },
    validOvertime: {
      id: 'CLM-2024-1159',
      crewMemberId: 'crew-001',
      tripId: 'trip-001',
      amount: 450.00,
      type: 'Overtime',
      status: 'Pending',
      description: 'Valid overtime claim',
    },
  },
};

/**
 * API endpoints for testing
 */
export const apiEndpoints = {
  validateClaim: (baseURL: string) => `${baseURL}/api/agents/validate`,
  validateClaimWithData: (baseURL: string) => `${baseURL}/api/agents/validate-claim`,
  health: (baseURL: string) => `${baseURL}/api/agents/health`,
  serverHealth: (baseURL: string) => `${baseURL}/health`,
};

/**
 * Expected validation results for test claims
 */
export const expectedResults = {
  'CLM-2024-1156': {
    recommendation: 'APPROVED',
    minConfidence: 85,
  },
  'CLM-2024-1157': {
    recommendation: 'REJECTED',
    minConfidence: 80,
  },
  'CLM-2024-1158': {
    recommendation: 'FLAGGED',
    minConfidence: 50,
    maxConfidence: 75,
  },
};

/**
 * Selectors for common UI elements
 */
export const selectors = {
  // Landing page
  roleCard: (role: string) => `[data-testid="role-card-${role}"]`,

  // Payroll Admin
  claimCard: (claimId: string) => `[data-testid="claim-card-${claimId}"]`,
  validateButton: '[data-testid="validate-button"]',
  approveButton: '[data-testid="approve-button"]',
  rejectButton: '[data-testid="reject-button"]',

  // AI Validation
  validationPipeline: '[data-testid="validation-pipeline"]',
  agentStatus: (agentName: string) => `[data-testid="agent-status-${agentName}"]`,
  validationResult: '[data-testid="validation-result"]',
  confidenceScore: '[data-testid="confidence-score"]',

  // Crew Member
  submitClaimButton: '[data-testid="submit-claim-button"]',
  claimForm: '[data-testid="claim-form"]',

  // Common
  loadingSpinner: '[data-testid="loading-spinner"]',
  errorMessage: '[data-testid="error-message"]',
  successMessage: '[data-testid="success-message"]',
};
