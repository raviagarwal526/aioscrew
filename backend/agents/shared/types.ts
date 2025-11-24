/**
 * Shared types for AI agents
 */

export type AgentType =
  | 'orchestrator'
  | 'flight-time'
  | 'duty-time'
  | 'per-diem'
  | 'premium-pay'
  | 'guarantee'
  | 'compliance'
  | 'dispute-resolution'
  | 'excess-payment-detector';

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error' | 'flagged';

export interface AgentInput {
  claim: ClaimInput;
  trip?: TripData;
  crew?: CrewData;
  historicalData?: HistoricalData;
}

export interface ClaimInput {
  id: string;
  claimNumber: string;
  crewMemberId: string;
  crewMemberName: string;
  type: string;
  tripId: string;
  flightNumber: string;
  amount: number;
  submittedDate: Date;
  description?: string;
}

export interface TripData {
  id: string;
  date: Date;
  route: string;
  flightNumbers: string;
  departureTime?: string;
  arrivalTime?: string;
  flightTimeHours: number;
  creditHours: number;
  layoverCity?: string;
  isInternational: boolean;
  aircraftType: string;
  status: string;
}

export interface CrewData {
  id: string;
  name: string;
  role: string;
  base: string;
  seniority: number;
  qualification: string;
  hireDate: Date;
  ytdEarnings: number;
}

export interface HistoricalData {
  similarClaims: number;
  approvalRate: number;
  averageAmount: number;
  recentClaimsByUser: ClaimInput[];
  commonPatterns?: string[];
}

export interface AgentResult {
  agentType: AgentType;
  agentName: string;
  status: AgentStatus;
  duration: number;
  summary: string;
  details: string[];
  confidence?: number;
  reasoning?: string;
  data?: Record<string, any>;
}

export interface ValidationResult {
  claimId: string;
  overallStatus: 'approved' | 'flagged' | 'rejected';
  confidence: number;
  processingTime: number;
  recommendation: string;
  agentResults: AgentResult[];
  issues?: Issue[];
  contractReferences?: ContractReference[];
  historicalAnalysis?: HistoricalData;
}

export interface Issue {
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction?: string;
  detectedBy: AgentType;
}

export interface ContractReference {
  section: string;
  title: string;
  text: string;
  relevance: number;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}
