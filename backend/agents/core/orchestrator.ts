/**
 * Orchestrator Agent
 * Coordinates the execution of specialized agents
 */

import type { AgentInput, AgentResult, ValidationResult } from '../shared/types.js';
import { runFlightTimeCalculator } from './flight-time-calculator.js';
import { runPremiumPayCalculator } from './premium-pay-calculator.js';
import { runComplianceValidator } from './compliance-validator.js';

/**
 * Make final decision based on all agent results
 */
async function makeFinalDecision(
  input: AgentInput,
  allResults: AgentResult[]
): Promise<ValidationResult> {
  console.log('⚖️ Making final decision...');

  // Calculate overall confidence (average of all agent confidences)
  const confidences = allResults
    .filter(r => r.confidence !== undefined)
    .map(r => r.confidence!);
  const overallConfidence = confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0.5;

  // Determine overall status
  const hasErrors = allResults.some(r => r.status === 'error');
  const hasFlagged = allResults.some(r => r.status === 'flagged');

  let overallStatus: 'approved' | 'flagged' | 'rejected';
  if (hasErrors) {
    overallStatus = 'rejected';
  } else if (hasFlagged || overallConfidence < 0.7) {
    overallStatus = 'flagged';
  } else {
    overallStatus = 'approved';
  }

  // Collect all issues from agents
  const allIssues = allResults
    .filter(r => r.data?.issues)
    .flatMap(r => r.data!.issues);

  // Collect contract references from premium pay calculator
  const premiumPayResult = allResults.find(r => r.agentType === 'premium-pay');
  const contractReferences = premiumPayResult?.data?.contractReferences || [];

  // Build recommendation
  let recommendation = '';
  if (overallStatus === 'approved') {
    recommendation = 'APPROVE - All validation checks passed';
  } else if (overallStatus === 'flagged') {
    recommendation = 'RECOMMEND: Request Additional Information';
  } else {
    recommendation = 'REJECT - Validation failed';
  }

  // Calculate total processing time
  const totalProcessingTime = allResults.reduce((sum, r) => sum + r.duration, 0);

  return {
    claimId: input.claim.id,
    overallStatus,
    confidence: overallConfidence,
    processingTime: totalProcessingTime,
    recommendation,
    agentResults: allResults,
    issues: allIssues.length > 0 ? allIssues : undefined,
    contractReferences: contractReferences.length > 0 ? contractReferences : undefined,
    historicalAnalysis: input.historicalData
  };
}

/**
 * Run the orchestrator to validate a claim
 * Uses sequential agent execution for reliability
 */
export async function orchestrateClaimValidation(
  input: AgentInput
): Promise<ValidationResult> {
  console.log(`\n🚀 Starting claim validation for ${input.claim.claimNumber}...`);
  const startTime = Date.now();

  try {
    const allResults: AgentResult[] = [];

    // Step 1: Flight Time Calculator
    console.log('🔍 Running Flight Time Calculator...');
    const flightTimeResult = await runFlightTimeCalculator(input);
    allResults.push(flightTimeResult);

    // Step 2: Premium Pay Calculator
    console.log('💰 Running Premium Pay Calculator...');
    const premiumPayResult = await runPremiumPayCalculator(input);
    allResults.push(premiumPayResult);

    // Step 3: Compliance Validator
    console.log('🛡️ Running Compliance Validator...');
    const complianceResult = await runComplianceValidator(input);
    allResults.push(complianceResult);

    // Step 4: Make final decision
    const finalDecision = await makeFinalDecision(input, allResults);

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(`✅ Validation complete in ${totalTime.toFixed(2)}s`);
    console.log(`📊 Decision: ${finalDecision.overallStatus.toUpperCase()}`);
    console.log(`🎯 Confidence: ${(finalDecision.confidence * 100).toFixed(1)}%\n`);

    return finalDecision;
  } catch (error) {
    console.error('❌ Orchestrator error:', error);

    // Return error result
    return {
      claimId: input.claim.id,
      overallStatus: 'rejected',
      confidence: 0,
      processingTime: (Date.now() - startTime) / 1000,
      recommendation: 'ERROR - Failed to process claim',
      agentResults: [{
        agentType: 'orchestrator',
        agentName: 'Orchestrator',
        status: 'error',
        duration: 0,
        summary: 'Orchestration failed',
        details: [error instanceof Error ? error.message : 'Unknown error'],
        confidence: 0
      }]
    };
  }
}
