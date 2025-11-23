/**
 * Agent API routes
 */

import { Router, Request, Response } from 'express';
import { neon } from '@neondatabase/serverless';
import { orchestrateClaimValidation } from '../../agents/core/orchestrator.js';
import {
  getClaimById,
  getTripById,
  getCrewMemberById,
  getHistoricalData,
  updateClaimWithValidation
} from '../../services/database-service.js';
import type { AgentInput } from '../../agents/shared/types.js';
import { runTestDataGenerator } from '../../agents/core/test-data-generator.js';

const router = Router();
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

/**
 * POST /api/agents/validate
 * Validate a claim using AI agents
 */
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { claimId } = req.body;

    if (!claimId) {
      return res.status(400).json({
        error: 'Missing claimId in request body'
      });
    }

    console.log(`\n📥 Received validation request for claim: ${claimId}`);

    // Fetch claim data from database
    const claim = await getClaimById(claimId);
    if (!claim) {
      return res.status(404).json({
        error: `Claim ${claimId} not found`
      });
    }

    // Fetch related data
    const trip = await getTripById(claim.tripId);
    const crew = await getCrewMemberById(claim.crewMemberId);
    const historicalData = await getHistoricalData(claim.crewMemberId, claim.type);

    // Build agent input
    const input: AgentInput = {
      claim,
      trip: trip || undefined,
      crew: crew || undefined,
      historicalData
    };

    // Run orchestration
    const result = await orchestrateClaimValidation(input);

    // Update claim in database
    const contractRef = result.contractReferences && result.contractReferences.length > 0
      ? result.contractReferences[0].section
      : '';

    await updateClaimWithValidation(
      claimId,
      result.overallStatus === 'approved',
      result.recommendation,
      contractRef
    );

    console.log(`✅ Returning validation result: ${result.overallStatus}\n`);

    // Return result
    res.json(result);
  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({
      error: 'Internal server error during claim validation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/agents/validate-claim
 * Alternative endpoint that accepts full claim data (for frontend compatibility)
 */
router.post('/validate-claim', async (req: Request, res: Response) => {
  try {
    const { claim, trip, crew } = req.body;

    if (!claim) {
      return res.status(400).json({
        error: 'Missing claim data in request body'
      });
    }

    console.log(`\n📥 Received validation request for claim: ${claim.id}`);

    // Get historical data
    const historicalData = claim.crewMemberId
      ? await getHistoricalData(claim.crewMemberId, claim.type)
      : undefined;

    // Build agent input
    const input: AgentInput = {
      claim,
      trip,
      crew,
      historicalData
    };

    // Run orchestration
    const result = await orchestrateClaimValidation(input);

    console.log(`✅ Returning validation result: ${result.overallStatus}\n`);

    // Return result
    res.json(result);
  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({
      error: 'Internal server error during claim validation',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/agents/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    agents: [
      'orchestrator',
      'flight-time-calculator',
      'premium-pay-calculator',
      'compliance-validator'
    ]
  });
});

/**
 * POST /api/agents/test-data/generate
 * Returns AI-assisted blueprint for generating synthetic datasets.
 */
router.post('/test-data/generate', async (req: Request, res: Response) => {
  try {
    const { config, scenarioId, llmPreference } = req.body || {};

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        error: 'Missing config in request body'
      });
    }

    const result = await runTestDataGenerator(config, scenarioId, llmPreference);
    res.json(result);
  } catch (error) {
    console.error('❌ Test data generation error:', error);
    res.status(500).json({
      error: 'Failed to generate test data blueprint',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/agents/test-data/cleanup
 * Removes generated test data from primary tables so teams can start fresh.
 */
router.post('/test-data/cleanup', async (req: Request, res: Response) => {
  try {
    if (!sql) {
      return res.status(500).json({
        error: 'Database not configured'
      });
    }

    const { preserveCrew = true } = req.body || {};
    await sql`
      TRUNCATE TABLE pay_claims, trips, disruptions, compliance_violations
      RESTART IDENTITY CASCADE
    `;

    if (!preserveCrew) {
      await sql`
        TRUNCATE TABLE crew_members
        RESTART IDENTITY CASCADE
      `;
    }

    res.json({
      success: true,
      message: 'Test data tables cleared. You can generate a fresh dataset.',
      clearedScenarios: true,
      crewPreserved: preserveCrew
    });
  } catch (error) {
    console.error('❌ Test data cleanup error:', error);
    res.status(500).json({
      error: 'Failed to clean up test data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
