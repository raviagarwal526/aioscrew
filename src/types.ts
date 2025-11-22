export type UserRole =
  | 'crew-member'
  | 'scheduler'
  | 'controller'
  | 'payroll'
  | 'management'
  | 'union';

export interface CrewMember {
  id: string;
  name: string;
  role: 'Captain' | 'First Officer' | 'Flight Attendant';
  base: string;
  seniority: number;
  qualification: string;
  email: string;
  ytdEarnings: number;
  upcomingTraining?: {
    type: string;
    daysUntil: number;
  };
  currentPay?: {
    period: string;
    amount: number;
    verified: boolean;
  };
}

export interface Trip {
  id: string;
  date: string;
  route: string;
  crewAssigned: string[];
  flightTime: number;
  creditHours: number;
  layover: string;
  international: boolean;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'delayed';
  disruption?: boolean;
  crewAffected?: string[];
  delayMinutes?: number;
}

export interface Claim {
  id: string;
  crewId: string;
  type: string;
  flight: string;
  date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  aiValidation: boolean;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: string;
}

export interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}
