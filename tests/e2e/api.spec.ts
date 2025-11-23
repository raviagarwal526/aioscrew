import { test, expect } from '@playwright/test';
import { testData, apiEndpoints } from './helpers/test-data';

/**
 * API Integration Tests
 * Tests backend API endpoints directly
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

test.describe('API Health Checks', () => {
  test('should return healthy status from server', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  test('should return agent health status', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/agents/health`);

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('agents');
    expect(data.agents).toBeInstanceOf(Array);
    expect(data.agents.length).toBe(3);
  });
});

test.describe('Claim Validation API', () => {
  test('should validate claim with claim ID', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: {
        claimId: 'CLM-2024-1156',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('recommendation');
    expect(data).toHaveProperty('confidence');
    expect(data).toHaveProperty('agents');

    // Verify recommendation is valid
    expect(['APPROVED', 'FLAGGED', 'REJECTED']).toContain(data.recommendation);

    // Verify confidence is a number between 0 and 100
    expect(data.confidence).toBeGreaterThanOrEqual(0);
    expect(data.confidence).toBeLessThanOrEqual(100);

    // Verify all three agents returned results
    expect(data.agents).toHaveProperty('flightTimeCalculator');
    expect(data.agents).toHaveProperty('premiumPayCalculator');
    expect(data.agents).toHaveProperty('complianceValidator');
  });

  test('should validate legitimate international premium claim', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate-claim`, {
      data: {
        claim: {
          id: 'CLM-2024-TEST-001',
          amount: 125.00,
          type: 'International Premium',
          submittedDate: '2024-03-15',
        },
        trip: {
          id: 'trip-001',
          tripNumber: 'CM401-PTY-MIA',
          date: '2024-03-15',
          route: 'PTY → MIA → PTY',
          flightTime: 5.2,
          creditHours: 6.5,
          type: 'International',
        },
        crew: {
          id: 'crew-001',
          name: 'Sarah Martinez',
          employeeId: 'EMP-12345',
          role: 'Captain',
          base: 'PTY',
          seniority: 15,
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.recommendation).toBe('APPROVED');
    expect(data.confidence).toBeGreaterThan(80);
  });

  test('should reject domestic flight claiming international premium', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate-claim`, {
      data: {
        claim: {
          id: 'CLM-2024-TEST-002',
          amount: 125.00,
          type: 'International Premium',
          submittedDate: '2024-03-16',
        },
        trip: {
          id: 'trip-002',
          tripNumber: 'CM105-PTY-DAV',
          date: '2024-03-16',
          route: 'PTY → DAV → PTY',
          flightTime: 2.1,
          creditHours: 3.0,
          type: 'Domestic',
        },
        crew: {
          id: 'crew-002',
          name: 'Carlos Rodriguez',
          employeeId: 'EMP-12346',
          role: 'First Officer',
          base: 'PTY',
          seniority: 8,
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.recommendation).toBe('REJECTED');

    // Should cite policy violation
    const complianceResult = data.agents.complianceValidator;
    expect(complianceResult.issues.length).toBeGreaterThan(0);
  });

  test('should flag unusually high claim amounts', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate-claim`, {
      data: {
        claim: {
          id: 'CLM-2024-TEST-003',
          amount: 5000.00,
          type: 'Red-Eye Premium',
          submittedDate: '2024-03-17',
        },
        trip: {
          id: 'trip-003',
          tripNumber: 'CM801-PTY-GRU',
          date: '2024-03-17',
          route: 'PTY → GRU',
          flightTime: 8.5,
          creditHours: 10.2,
          type: 'Red-Eye',
        },
        crew: {
          id: 'crew-003',
          name: 'Maria Santos',
          employeeId: 'EMP-12347',
          role: 'Lead Flight Attendant',
          base: 'PTY',
          seniority: 5,
        },
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.recommendation).toBe('FLAGGED');

    // Should have flagged the suspicious amount
    const complianceResult = data.agents.complianceValidator;
    expect(complianceResult.issues.some((issue: any) =>
      issue.description.toLowerCase().includes('amount') ||
      issue.description.toLowerCase().includes('high')
    )).toBeTruthy();
  });

  test('should handle missing claim ID gracefully', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: {},
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  test('should handle invalid claim data', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate-claim`, {
      data: {
        claim: {},
        trip: {},
        crew: {},
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Should return error for invalid data
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should validate claim within reasonable time', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: {
        claimId: 'CLM-2024-1156',
      },
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 35000, // 35 seconds timeout
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();

    // Validation should complete within 30 seconds
    expect(duration).toBeLessThan(30000);
  });
});

test.describe('Agent Response Structure', () => {
  test('flight time calculator should return valid response', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: { claimId: 'CLM-2024-1156' },
    });

    const data = await response.json();
    const flightTime = data.agents.flightTimeCalculator;

    expect(flightTime).toHaveProperty('isValid');
    expect(flightTime).toHaveProperty('confidence');
    expect(flightTime).toHaveProperty('reasoning');
    expect(typeof flightTime.isValid).toBe('boolean');
    expect(typeof flightTime.confidence).toBe('number');
  });

  test('premium pay calculator should return valid response', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: { claimId: 'CLM-2024-1156' },
    });

    const data = await response.json();
    const premiumPay = data.agents.premiumPayCalculator;

    expect(premiumPay).toHaveProperty('isEligible');
    expect(premiumPay).toHaveProperty('calculatedAmount');
    expect(premiumPay).toHaveProperty('confidence');
    expect(premiumPay).toHaveProperty('reasoning');
    expect(typeof premiumPay.isEligible).toBe('boolean');
    expect(typeof premiumPay.confidence).toBe('number');
  });

  test('compliance validator should return valid response', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: { claimId: 'CLM-2024-1156' },
    });

    const data = await response.json();
    const compliance = data.agents.complianceValidator;

    expect(compliance).toHaveProperty('isPolicyCompliant');
    expect(compliance).toHaveProperty('isFraudulent');
    expect(compliance).toHaveProperty('confidence');
    expect(compliance).toHaveProperty('issues');
    expect(compliance).toHaveProperty('reasoning');
    expect(Array.isArray(compliance.issues)).toBeTruthy();
  });
});

test.describe('Parallel Agent Execution', () => {
  test('should execute all three agents in parallel', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: { claimId: 'CLM-2024-1156' },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    // All agents should have results
    expect(data.agents.flightTimeCalculator).toBeDefined();
    expect(data.agents.premiumPayCalculator).toBeDefined();
    expect(data.agents.complianceValidator).toBeDefined();

    // Parallel execution should be faster than sequential
    // If sequential: ~45-60 seconds (3 agents × 15-20s each)
    // If parallel: ~15-20 seconds (max of all agents)
    expect(duration).toBeLessThan(25000);
  });
});

test.describe('Error Handling', () => {
  test('should handle non-existent claim ID', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: {
        claimId: 'CLM-9999-9999',
      },
    });

    // Should return error or handle gracefully
    expect([400, 404, 500]).toContain(response.status());
  });

  test('should handle malformed request body', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should handle missing required fields', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate-claim`, {
      data: {
        claim: { id: 'test' },
        // Missing trip and crew
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('CORS and Headers', () => {
  test('should allow CORS from frontend origin', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:5173',
      },
    });

    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeDefined();
  });

  test('should accept JSON content type', async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/api/agents/validate`, {
      data: { claimId: 'CLM-2024-1156' },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.ok()).toBeTruthy();
  });
});

test.describe('Rate Limiting and Performance', () => {
  test('should handle multiple concurrent requests', async ({ request }) => {
    const requests = Array(5).fill(null).map(() =>
      request.post(`${API_BASE_URL}/api/agents/validate`, {
        data: { claimId: 'CLM-2024-1156' },
        timeout: 40000,
      })
    );

    const responses = await Promise.all(requests);

    // All requests should succeed
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
  });

  test('should respond to health check quickly', async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${API_BASE_URL}/health`);

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.ok()).toBeTruthy();
    expect(duration).toBeLessThan(1000); // Should respond within 1 second
  });
});
