/**
 * API client for backend agent service
 */

import type { ClaimData, AgentValidationResult } from '../types/agents';

// Use current origin in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

export interface ApiError {
  error: string;
  message?: string;
}

/**
 * Call the backend agent validation API
 */
export async function validateClaimAPI(claim: ClaimData): Promise<AgentValidationResult> {
  try {
    const response = await fetch(`${API_URL}/api/agents/validate-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        claim: {
          id: claim.id,
          claimNumber: claim.claimNumber,
          crewMemberId: 'unknown', // Would come from claim data
          crewMemberName: claim.crewMember,
          type: claim.type,
          tripId: claim.flight,
          flightNumber: claim.flight,
          amount: claim.amount,
          submittedDate: claim.submittedDate,
        },
      }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || error.error || 'API request failed');
    }

    const result = await response.json();

    // Transform backend ValidationResult to frontend AgentValidationResult
    return transformValidationResult(result, claim.id);
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * Transform backend ValidationResult to frontend format
 */
function transformValidationResult(
  backendResult: any,
  claimId: string
): AgentValidationResult {
  return {
    claimId,
    overallStatus: backendResult.overallStatus,
    confidence: backendResult.confidence,
    processingTime: backendResult.processingTime,
    recommendation: backendResult.recommendation,
    steps: backendResult.agentResults.map((result: any) => ({
      agentType: result.agentType,
      agentName: result.agentName,
      agentAbbrev: getAgentAbbrev(result.agentType),
      status: result.status,
      duration: result.duration,
      summary: result.summary,
      details: result.details,
      confidence: result.confidence,
      color: getAgentColor(result.agentType),
    })),
    issues: backendResult.issues,
    contractReferences: backendResult.contractReferences,
    historicalAnalysis: backendResult.historicalAnalysis,
  };
}

/**
 * Get agent abbreviation
 */
function getAgentAbbrev(agentType: string): string {
  const abbrevMap: Record<string, string> = {
    'orchestrator': 'OR',
    'flight-time': 'FT',
    'duty-time': 'DT',
    'per-diem': 'PD',
    'premium-pay': 'PP',
    'guarantee': 'GC',
    'compliance': 'CV',
    'dispute-resolution': 'DR',
  };
  return abbrevMap[agentType] || '??';
}

/**
 * Get agent color
 */
function getAgentColor(agentType: string): string {
  const colorMap: Record<string, string> = {
    'orchestrator': 'bg-blue-900',
    'flight-time': 'bg-green-600',
    'duty-time': 'bg-blue-600',
    'per-diem': 'bg-purple-600',
    'premium-pay': 'bg-green-600',
    'guarantee': 'bg-indigo-600',
    'compliance': 'bg-green-600',
    'dispute-resolution': 'bg-red-600',
  };
  return colorMap[agentType] || 'bg-gray-600';
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/agents/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}
