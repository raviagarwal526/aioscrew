export type AgentType =
  | 'orchestrator'
  | 'flight-time'
  | 'duty-time'
  | 'per-diem'
  | 'premium-pay'
  | 'guarantee'
  | 'compliance'
  | 'dispute-resolution'
  | 'pairing-optimizer'
  | 'roster-builder'
  | 'bidding-processor'
  | 'real-time-tracker'
  | 'fatigue-risk'
  | 'disruption-recovery'
  | 'reserve-optimizer'
  | 'training-scheduler'
  | 'legality-validator'
  | 'analytics'
  | 'communications'
  | 'workforce-planner';

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error' | 'flagged';

export interface AgentActivity {
  id: string;
  agentType: AgentType;
  agentName: string;
  status: AgentStatus;
  message: string;
  timestamp: Date;
  duration?: number;
  details?: string[];
  confidence?: number;
}

export interface AgentProcessingStep {
  agentType: AgentType;
  agentName: string;
  agentAbbrev: string;
  status: AgentStatus;
  duration: number;
  summary: string;
  details: string[];
  confidence?: number;
  color: string;
}

export interface AgentValidationResult {
  claimId: string;
  overallStatus: 'approved' | 'flagged' | 'rejected';
  confidence: number;
  processingTime: number;
  steps: AgentProcessingStep[];
  recommendation: string;
  issues?: AgentIssue[];
  contractReferences?: ContractReference[];
  historicalAnalysis?: HistoricalAnalysis;
}

export interface AgentIssue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction?: string;
}

export interface ContractReference {
  section: string;
  title: string;
  text: string;
  relevance: number;
}

export interface HistoricalAnalysis {
  similarClaims: number;
  approvalRate: number;
  averageAmount: number;
  commonPatterns?: string[];
}

export interface ClaimData {
  id: string;
  claimNumber: string;
  crewMember: string;
  type: string;
  flight: string;
  amount: number;
  submittedDate: Date;
  status: 'pending' | 'ai-validated' | 'needs-review' | 'approved' | 'rejected';
  agentValidation?: AgentValidationResult;
}

export const agentConfig: Record<AgentType, { name: string; abbrev: string; color: string }> = {
  'orchestrator': { name: 'Orchestrator', abbrev: 'OR', color: 'bg-blue-900' },
  'flight-time': { name: 'Flight Time Calculator', abbrev: 'FT', color: 'bg-green-600' },
  'duty-time': { name: 'Duty Time Monitor', abbrev: 'DT', color: 'bg-blue-600' },
  'per-diem': { name: 'Per Diem Calculator', abbrev: 'PD', color: 'bg-purple-600' },
  'premium-pay': { name: 'Premium Pay Calculator', abbrev: 'PP', color: 'bg-green-600' },
  'guarantee': { name: 'Guarantee Calculator', abbrev: 'GC', color: 'bg-indigo-600' },
  'compliance': { name: 'Compliance Validator', abbrev: 'CV', color: 'bg-green-600' },
  'dispute-resolution': { name: 'Claim Dispute Resolution', abbrev: 'DR', color: 'bg-red-600' },
  'pairing-optimizer': { name: 'Pairing Optimizer', abbrev: 'PO', color: 'bg-cyan-600' },
  'roster-builder': { name: 'Roster Builder', abbrev: 'RB', color: 'bg-teal-600' },
  'bidding-processor': { name: 'Bidding Processor', abbrev: 'BP', color: 'bg-lime-600' },
  'real-time-tracker': { name: 'Real-Time Tracker', abbrev: 'RT', color: 'bg-amber-600' },
  'fatigue-risk': { name: 'Fatigue Risk Manager', abbrev: 'FR', color: 'bg-rose-600' },
  'disruption-recovery': { name: 'Disruption Recovery', abbrev: 'DC', color: 'bg-orange-600' },
  'reserve-optimizer': { name: 'Reserve Optimizer', abbrev: 'RO', color: 'bg-sky-600' },
  'training-scheduler': { name: 'Training Scheduler', abbrev: 'TS', color: 'bg-violet-600' },
  'legality-validator': { name: 'Legality Validator', abbrev: 'LV', color: 'bg-emerald-600' },
  'analytics': { name: 'Analytics Engine', abbrev: 'AE', color: 'bg-fuchsia-600' },
  'communications': { name: 'Communications', abbrev: 'CM', color: 'bg-pink-600' },
  'workforce-planner': { name: 'Workforce Planner', abbrev: 'WP', color: 'bg-slate-600' }
};
