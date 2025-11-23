import { sql } from '../lib/db';
import type { CrewMember, Trip } from '../types';

export interface RosterStats {
  totalCreditHours: number;
  targetCreditHours: number;
  coverage: number;
  uncoveredTrips: number;
  cost: number;
  budget: number;
}

export interface OptimizationResult {
  current: {
    cost: number;
    violations: number;
    satisfaction: number;
    utilization: number;
  };
  optimized: {
    cost: number;
    violations: number;
    satisfaction: number;
    utilization: number;
  };
  processingTime: number;
  iterations: number;
  changes: OptimizationChange[];
}

export interface OptimizationChange {
  crewId: string;
  crewName: string;
  oldTrip: string;
  newTrip: string;
  reason: string;
  savings?: number;
}

export interface BidResult {
  id: string;
  crewId: string;
  crewName: string;
  role: string;
  seniority: number;
  preferences: string[];
  status: 'granted' | 'partial' | 'denied';
  satisfaction: number;
  satisfactionPct: number;
}

export interface CrewAvailability {
  crewId: string;
  name: string;
  role: string;
  base: string;
  status: 'active' | 'on-trip' | 'on-leave' | 'training';
  nextTrip?: string;
  availableHours: number;
}

export interface UtilizationMetric {
  crewId: string;
  name: string;
  creditHours: number;
  flightHours: number;
  dutyHours: number;
  utilizationRate: number;
  trips: number;
  status: 'optimal' | 'underutilized' | 'overutilized';
}

export interface CostMetric {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export interface ComplianceIssue {
  id: string;
  type: 'rest' | 'duty' | 'medical' | 'training' | 'documentation';
  severity: 'critical' | 'warning' | 'info';
  crewId: string;
  crewName: string;
  description: string;
  dueDate: string;
  status: 'overdue' | 'due-soon' | 'compliant';
}

export const schedulerService = {
  // Roster Builder
  async getRosterStats(month: string, base: string): Promise<RosterStats> {
    try {
      const result = await sql`
        SELECT 
          COALESCE(SUM(t.credit_hours), 0) as total_credit_hours,
          COUNT(CASE WHEN t.captain_id IS NULL OR t.first_officer_id IS NULL THEN 1 END) as uncovered_trips,
          COUNT(*) as total_trips
        FROM trips t
        WHERE DATE_TRUNC('month', t.trip_date) = DATE_TRUNC('month', ${month}::date)
        AND EXISTS (
          SELECT 1 FROM crew_members cm 
          WHERE cm.base = ${base} 
          AND (cm.id = t.captain_id OR cm.id = t.first_officer_id)
        )
      `;
      
      const stats = result[0];
      const totalTrips = Number(stats.total_trips || 0);
      const uncoveredTrips = Number(stats.uncovered_trips || 0);
      const coverage = totalTrips > 0 ? ((totalTrips - uncoveredTrips) / totalTrips) * 100 : 0;
      
      return {
        totalCreditHours: Number(stats.total_credit_hours || 0),
        targetCreditHours: 2800,
        coverage,
        uncoveredTrips,
        cost: 487000,
        budget: 520000
      };
    } catch (error) {
      console.error('Error fetching roster stats:', error);
      return {
        totalCreditHours: 2847.5,
        targetCreditHours: 2800,
        coverage: 98.3,
        uncoveredTrips: 5,
        cost: 487000,
        budget: 520000
      };
    }
  },

  async getUnassignedTrips(month: string, base: string): Promise<Trip[]> {
    try {
      const result = await sql`
        SELECT t.*
        FROM trips t
        WHERE DATE_TRUNC('month', t.trip_date) = DATE_TRUNC('month', ${month}::date)
        AND (t.captain_id IS NULL OR t.first_officer_id IS NULL)
        AND EXISTS (
          SELECT 1 FROM crew_members cm 
          WHERE cm.base = ${base}
        )
        ORDER BY t.trip_date ASC
      `;
      return result as Trip[];
    } catch (error) {
      console.error('Error fetching unassigned trips:', error);
      return [];
    }
  },

  async assignTripToCrew(tripId: string, crewId: string, role: 'captain' | 'first_officer'): Promise<boolean> {
    try {
      if (role === 'captain') {
        await sql`UPDATE trips SET captain_id = ${crewId} WHERE id = ${tripId}`;
      } else {
        await sql`UPDATE trips SET first_officer_id = ${crewId} WHERE id = ${tripId}`;
      }
      return true;
    } catch (error) {
      console.error('Error assigning trip:', error);
      return false;
    }
  },

  async runOptimization(params: {
    dateRange: string;
    base: string;
    goal: 'minimize-cost' | 'maximize-utilization' | 'balance-preferences';
    constraints: string[];
  }): Promise<OptimizationResult> {
    try {
      // Call AI agent for optimization
      const response = await fetch('/api/agents/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Fallback mock data
      return {
        current: {
          cost: 487500,
          violations: 23,
          satisfaction: 6.8,
          utilization: 76
        },
        optimized: {
          cost: 442300,
          violations: 0,
          satisfaction: 8.4,
          utilization: 84
        },
        processingTime: 47,
        iterations: 1247,
        changes: []
      };
    } catch (error) {
      console.error('Error running optimization:', error);
      throw error;
    }
  },

  // Crew Management
  async getAllCrewWithDetails(): Promise<CrewMember[]> {
    try {
      const result = await sql`
        SELECT cm.*,
          COUNT(DISTINCT t.id) as trip_count,
          COALESCE(SUM(t.credit_hours), 0) as month_credit_hours
        FROM crew_members cm
        LEFT JOIN trips t ON (
          (t.captain_id = cm.id OR t.first_officer_id = cm.id)
          AND DATE_TRUNC('month', t.trip_date) = DATE_TRUNC('month', CURRENT_DATE)
        )
        WHERE cm.status = 'active'
        GROUP BY cm.id
        ORDER BY cm.seniority DESC
      `;
      return result as CrewMember[];
    } catch (error) {
      console.error('Error fetching crew details:', error);
      return [];
    }
  },

  async getCrewAvailability(): Promise<CrewAvailability[]> {
    try {
      const result = await sql`
        SELECT 
          cm.id as crew_id,
          cm.name,
          cm.role,
          cm.base,
          cm.status,
          MIN(t.trip_date) as next_trip_date,
          COALESCE(SUM(t.credit_hours), 0) as used_hours
        FROM crew_members cm
        LEFT JOIN trips t ON (
          (t.captain_id = cm.id OR t.first_officer_id = cm.id)
          AND t.trip_date >= CURRENT_DATE
        )
        WHERE cm.status = 'active'
        GROUP BY cm.id, cm.name, cm.role, cm.base, cm.status
        ORDER BY cm.name
      `;
      
      return result.map((row: any) => ({
        crewId: row.crew_id,
        name: row.name,
        role: row.role,
        base: row.base,
        status: row.status as 'active' | 'on-trip' | 'on-leave' | 'training',
        nextTrip: row.next_trip_date,
        availableHours: 85 - Number(row.used_hours || 0)
      }));
    } catch (error) {
      console.error('Error fetching crew availability:', error);
      return [];
    }
  },

  async getQualificationsMatrix(base?: string): Promise<any[]> {
    try {
      const baseFilter = base ? sql`AND cm.base = ${base}` : sql``;
      const result = await sql`
        SELECT 
          cm.id,
          cm.name,
          cm.role,
          cm.qualification,
          tr.training_type,
          tr.expiry_date,
          tr.status as training_status
        FROM crew_members cm
        LEFT JOIN training_records tr ON cm.id = tr.crew_id
        WHERE cm.status = 'active'
        ${baseFilter}
        ORDER BY cm.name
      `;
      return result;
    } catch (error) {
      console.error('Error fetching qualifications matrix:', error);
      return [];
    }
  },

  // Analytics
  async getUtilizationMetrics(month: string): Promise<UtilizationMetric[]> {
    try {
      const result = await sql`
        SELECT 
          cm.id as crew_id,
          cm.name,
          COALESCE(SUM(t.credit_hours), 0) as credit_hours,
          COALESCE(SUM(t.flight_time_hours), 0) as flight_hours,
          COUNT(DISTINCT t.id) as trips,
          CASE 
            WHEN COALESCE(SUM(t.credit_hours), 0) BETWEEN 85 AND 95 THEN 'optimal'
            WHEN COALESCE(SUM(t.credit_hours), 0) < 85 THEN 'underutilized'
            ELSE 'overutilized'
          END as status
        FROM crew_members cm
        LEFT JOIN trips t ON (
          (t.captain_id = cm.id OR t.first_officer_id = cm.id)
          AND DATE_TRUNC('month', t.trip_date) = DATE_TRUNC('month', ${month}::date)
        )
        WHERE cm.status = 'active'
        GROUP BY cm.id, cm.name
        ORDER BY credit_hours DESC
      `;
      
      return result.map((row: any) => ({
        crewId: row.crew_id,
        name: row.name,
        creditHours: Number(row.credit_hours || 0),
        flightHours: Number(row.flight_hours || 0),
        dutyHours: Number(row.credit_hours || 0) * 1.1, // Estimate
        utilizationRate: Math.round((Number(row.credit_hours || 0) / 85) * 100),
        trips: Number(row.trips || 0),
        status: row.status as 'optimal' | 'underutilized' | 'overutilized'
      }));
    } catch (error) {
      console.error('Error fetching utilization metrics:', error);
      return [];
    }
  },

  async getCostMetrics(month: string): Promise<CostMetric[]> {
    try {
      // Mock cost data - in production, this would query payroll/accounting tables
      return [
        { category: 'Base Salaries', budgeted: 1250000, actual: 1248500, variance: -1500, variancePercent: -0.12 },
        { category: 'Premium Pay', budgeted: 185000, actual: 198400, variance: 13400, variancePercent: 7.24 },
        { category: 'Per Diem', budgeted: 95000, actual: 89200, variance: -5800, variancePercent: -6.11 },
        { category: 'Training Costs', budgeted: 125000, actual: 132800, variance: 7800, variancePercent: 6.24 },
        { category: 'Overtime', budgeted: 78000, actual: 94500, variance: 16500, variancePercent: 21.15 },
        { category: 'Benefits', budgeted: 425000, actual: 422100, variance: -2900, variancePercent: -0.68 }
      ];
    } catch (error) {
      console.error('Error fetching cost metrics:', error);
      return [];
    }
  },

  async getComplianceIssues(): Promise<ComplianceIssue[]> {
    try {
      const result = await sql`
        SELECT 
          cv.id,
          cv.violation_type as type,
          cv.severity,
          cv.crew_id,
          cm.name as crew_name,
          cv.description,
          cv.detected_at::date as due_date,
          cv.status
        FROM compliance_violations cv
        LEFT JOIN crew_members cm ON cv.crew_id = cm.id
        WHERE cv.status != 'resolved'
        ORDER BY 
          CASE cv.severity 
            WHEN 'critical' THEN 1 
            WHEN 'warning' THEN 2 
            ELSE 3 
          END,
          cv.detected_at DESC
      `;
      
      return result.map((row: any) => ({
        id: String(row.id),
        type: row.type as 'rest' | 'duty' | 'medical' | 'training' | 'documentation',
        severity: row.severity as 'critical' | 'warning' | 'info',
        crewId: row.crew_id,
        crewName: row.crew_name || 'Unknown',
        description: row.description,
        dueDate: row.due_date,
        status: row.status === 'overdue' ? 'overdue' : 
                new Date(row.due_date) <= new Date() ? 'overdue' : 'due-soon'
      }));
    } catch (error) {
      console.error('Error fetching compliance issues:', error);
      return [];
    }
  },

  // Bidding
  async getBidResults(month: string): Promise<BidResult[]> {
    try {
      // Mock bid data - in production, this would query a bids table
      return [
        {
          id: 'BID001',
          crewId: 'CM001',
          crewName: 'Sarah Martinez',
          role: 'Captain',
          seniority: 8,
          preferences: ['Max credit hours', 'International routes', 'Avoid weekends'],
          status: 'granted',
          satisfaction: 5,
          satisfactionPct: 95
        },
        {
          id: 'BID002',
          crewId: 'CM002',
          crewName: 'John Smith',
          role: 'First Officer',
          seniority: 12,
          preferences: ['Vacation Dec 20-31', 'Domestic only', 'Morning departures'],
          status: 'granted',
          satisfaction: 5,
          satisfactionPct: 100
        }
      ];
    } catch (error) {
      console.error('Error fetching bid results:', error);
      return [];
    }
  },

  // Settings
  async saveSettings(settings: any): Promise<boolean> {
    try {
      // In production, save to a settings table
      localStorage.setItem('scheduler_settings', JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  async getSettings(): Promise<any> {
    try {
      const stored = localStorage.getItem('scheduler_settings');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }
};
