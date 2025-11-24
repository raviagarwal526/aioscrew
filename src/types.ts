export type UserRole =
  | 'crew-member'
  | 'scheduler'
  | 'crew-scheduler'
  | 'controller'
  | 'payroll'
  | 'management'
  | 'union'
  | 'executive';

export interface CrewMember {
  id: string;
  name: string;
  role: 'Captain' | 'First Officer' | 'Flight Attendant';
  base: string;
  seniority: number;
  qualification: string;
  email: string;
  ytdEarnings?: number;
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
  trip_date: string;
  route: string;
  flight_numbers?: string;
  flight_time_hours?: number;
  credit_hours?: number;
  layover_city?: string;
  is_international?: boolean;
  aircraft_type?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'delayed';
  captain_id?: string | null;
  first_officer_id?: string | null;
  senior_fa_id?: string | null;
  junior_fa_id?: string | null;
}

export interface Claim {
  id: string;
  crew_id: string;
  claim_type: string;
  trip_id: string;
  claim_date: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'under-review';
  ai_validated: boolean;
  ai_explanation: string;
  contract_reference?: string;
  crew_name?: string;
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
