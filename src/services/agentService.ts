import {
  ClaimData,
  AgentValidationResult,
  AgentProcessingStep,
  AgentActivity
} from '../types/agents';

export async function validateClaimWithAgents(claim: ClaimData): Promise<AgentValidationResult> {
  await delay(1500);

  if (claim.type === 'International Premium') {
    return {
      claimId: claim.id,
      overallStatus: 'approved',
      confidence: 0.998,
      processingTime: 1.2,
      recommendation: 'APPROVE - All validation checks passed',
      steps: [
        {
          agentType: 'orchestrator',
          agentName: 'Orchestrator',
          agentAbbrev: 'OR',
          status: 'completed',
          duration: 0.1,
          summary: 'Received claim, identified as International Premium type, routing to specialized agents',
          details: [],
          color: 'bg-blue-900'
        },
        {
          agentType: 'flight-time',
          agentName: 'Flight Time Calculator',
          agentAbbrev: 'FT',
          status: 'completed',
          duration: 0.3,
          summary: 'Verified flight data and time calculations',
          details: [
            `Verified trip ${claim.flight} exists in system`,
            'Flight time: 5.2 hours (within normal range for BUR→GUA route)',
            `Trip date matches claim date: ${claim.submittedDate.toLocaleDateString()}`
          ],
          confidence: 0.99,
          color: 'bg-green-600'
        },
        {
          agentType: 'premium-pay',
          agentName: 'Premium Pay Calculator',
          agentAbbrev: 'PP',
          status: 'completed',
          duration: 0.4,
          summary: 'Validated premium pay calculation',
          details: [
            'Destination: GUA (Guatemala City) - Confirmed international',
            'CBA Section 12.4 applies: $125 per international flight',
            `Amount calculation: CORRECT ($${claim.amount.toFixed(2)})`
          ],
          confidence: 1.0,
          color: 'bg-green-600'
        },
        {
          agentType: 'compliance',
          agentName: 'Compliance Validator',
          agentAbbrev: 'CV',
          status: 'completed',
          duration: 0.4,
          summary: 'Validated CBA compliance',
          details: [
            'No duplicate claims found for this trip',
            'Crew qualified for international operations',
            'Within filing deadline (7 days from trip)',
            'CBA contract rules satisfied'
          ],
          confidence: 0.995,
          color: 'bg-green-600'
        }
      ],
      contractReferences: [
        {
          section: 'CBA Section 12.4',
          title: 'International Premium Pay',
          text: 'Crew members operating flights to destinations outside the continental United States shall receive an international premium of $125 per flight segment, payable in addition to regular flight pay. Destinations include but are not limited to: Central America, South America, Caribbean islands...',
          relevance: 1.0
        }
      ],
      historicalAnalysis: {
        similarClaims: 47,
        approvalRate: 1.0,
        averageAmount: 125.00
      }
    };
  }

  if (claim.type === 'Per Diem') {
    return {
      claimId: claim.id,
      overallStatus: 'flagged',
      confidence: 0.45,
      processingTime: 1.8,
      recommendation: 'RECOMMEND: Request Additional Information',
      steps: [
        {
          agentType: 'orchestrator',
          agentName: 'Orchestrator',
          agentAbbrev: 'OR',
          status: 'completed',
          duration: 0.1,
          summary: 'Received claim, identified as Per Diem type, routing to specialized agents',
          details: [],
          color: 'bg-blue-900'
        },
        {
          agentType: 'per-diem',
          agentName: 'Per Diem Calculator',
          agentAbbrev: 'PD',
          status: 'flagged',
          duration: 0.5,
          summary: 'Detected amount discrepancy',
          details: [
            `Calculated per diem: $75 (1 night × $75/night)`,
            `Claimed amount: $${claim.amount.toFixed(2)}`,
            `Difference: +$${(claim.amount - 75).toFixed(2)} (${Math.round(((claim.amount - 75) / 75) * 100)}% over)`
          ],
          confidence: 0.3,
          color: 'bg-purple-600'
        },
        {
          agentType: 'compliance',
          agentName: 'Compliance Validator',
          agentAbbrev: 'CV',
          status: 'flagged',
          duration: 0.6,
          summary: 'Found compliance issues',
          details: [
            'No hotel receipt or layover confirmation attached',
            'Crew member has filed 3 per diem claims in past 7 days',
            'All recent claims above normal amounts'
          ],
          confidence: 0.5,
          color: 'bg-green-600'
        }
      ],
      issues: [
        {
          severity: 'high',
          title: 'Amount Discrepancy',
          description: `Claimed amount ($${claim.amount.toFixed(2)}) exceeds calculated per diem ($75/night × 1 night = $75). Difference: +$${(claim.amount - 75).toFixed(2)} (${Math.round(((claim.amount - 75) / 75) * 100)}% over)`,
          suggestedAction: 'Verify if extended layover or international rate applies'
        },
        {
          severity: 'medium',
          title: 'Missing Documentation',
          description: 'No hotel receipt or layover confirmation attached to claim.',
          suggestedAction: 'Request supporting documentation from crew member'
        },
        {
          severity: 'medium',
          title: 'Unusual Pattern Detected',
          description: 'Crew member has filed 3 per diem claims in past 7 days, all above normal amounts. Pattern confidence: 87%',
          suggestedAction: 'Review recent claim history for irregularities'
        }
      ],
      historicalAnalysis: {
        similarClaims: 156,
        approvalRate: 0.92,
        averageAmount: 75.00
      }
    };
  }

  return {
    claimId: claim.id,
    overallStatus: 'approved',
    confidence: 0.95,
    processingTime: 1.0,
    recommendation: 'APPROVE - Standard claim validated',
    steps: [
      {
        agentType: 'orchestrator',
        agentName: 'Orchestrator',
        agentAbbrev: 'OR',
        status: 'completed',
        duration: 0.1,
        summary: 'Processing claim',
        details: [],
        color: 'bg-blue-900'
      }
    ]
  };
}

export function createAgentActivity(
  agentType: string,
  agentName: string,
  status: AgentActivity['status'],
  message: string
): AgentActivity {
  return {
    id: `${Date.now()}-${Math.random()}`,
    agentType: agentType as any,
    agentName,
    status,
    message,
    timestamp: new Date()
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const mockClaims: ClaimData[] = [
  {
    id: 'claim-1156',
    claimNumber: 'CLM-2024-1156',
    crewMember: 'Sarah Martinez',
    type: 'International Premium',
    flight: 'CM450',
    amount: 125.00,
    submittedDate: new Date('2024-11-22T14:30:00'),
    status: 'ai-validated'
  },
  {
    id: 'claim-1157',
    claimNumber: 'CLM-2024-1157',
    crewMember: 'James Wilson',
    type: 'International Premium',
    flight: 'CM401',
    amount: 125.00,
    submittedDate: new Date('2024-11-22T14:45:00'),
    status: 'ai-validated'
  },
  {
    id: 'claim-1158',
    claimNumber: 'CLM-2024-1158',
    crewMember: 'Michael Wilson',
    type: 'Per Diem',
    flight: 'CM230',
    amount: 150.00,
    submittedDate: new Date('2024-11-22T13:15:00'),
    status: 'needs-review'
  },
  {
    id: 'claim-1159',
    claimNumber: 'CLM-2024-1159',
    crewMember: 'Emily Chen',
    type: 'Overnight Allowance',
    flight: 'CM305',
    amount: 75.00,
    submittedDate: new Date('2024-11-22T12:00:00'),
    status: 'ai-validated'
  },
  {
    id: 'claim-1160',
    claimNumber: 'CLM-2024-1160',
    crewMember: 'Robert Taylor',
    type: 'Holiday Premium',
    flight: 'CM180',
    amount: 200.00,
    submittedDate: new Date('2024-11-22T10:30:00'),
    status: 'ai-validated'
  }
];
