import { sql } from '../lib/db';
import type { CrewMember, Trip, Claim } from '../types';

export const crewService = {
  async getCurrentUser(): Promise<CrewMember | null> {
    try {
      // First try to get CM001 (default user)
      let result = await sql`
        SELECT * FROM crew_members WHERE id = 'CM001' LIMIT 1
      `;
      
      // If CM001 doesn't exist, get the first available crew member
      if (!result || result.length === 0) {
        result = await sql`
          SELECT * FROM crew_members WHERE status = 'active' ORDER BY seniority DESC LIMIT 1
        `;
      }
      
      return result[0] as CrewMember || null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  async getUserTrips(crewId: string): Promise<Trip[]> {
    try {
      const result = await sql`
        SELECT * FROM trips
        WHERE captain_id = ${crewId}
           OR first_officer_id = ${crewId}
           OR senior_fa_id = ${crewId}
           OR junior_fa_id = ${crewId}
        ORDER BY trip_date DESC
      `;
      return result as Trip[];
    } catch (error) {
      console.error('Error fetching user trips:', error);
      return [];
    }
  },

  async getUserClaims(crewId: string): Promise<Claim[]> {
    try {
      const result = await sql`
        SELECT * FROM pay_claims
        WHERE crew_id = ${crewId}
        ORDER BY created_at DESC
      `;
      return result as Claim[];
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return [];
    }
  },

  async submitClaim(claim: Omit<Claim, 'id'>): Promise<Claim | null> {
    try {
      const claimId = `CLM-${Date.now()}`;
      const result = await sql`
        INSERT INTO pay_claims (
          id, crew_id, claim_type, trip_id, claim_date, amount,
          status, ai_validated, ai_explanation, contract_reference
        )
        VALUES (
          ${claimId}, ${claim.crew_id}, ${claim.claim_type}, ${claim.trip_id},
          ${claim.claim_date}, ${claim.amount}, ${claim.status},
          ${claim.ai_validated}, ${claim.ai_explanation}, ${claim.contract_reference || 'CBA Section 12.4'}
        )
        RETURNING *
      `;
      return result[0] as Claim;
    } catch (error) {
      console.error('Error submitting claim:', error);
      return null;
    }
  },

  async getAllCrew(): Promise<CrewMember[]> {
    try {
      const result = await sql`
        SELECT * FROM crew_members
        WHERE status = 'active'
        ORDER BY seniority DESC
      `;
      return result as CrewMember[];
    } catch (error) {
      console.error('Error fetching all crew:', error);
      return [];
    }
  },

  async getAllTrips(): Promise<Trip[]> {
    try {
      const result = await sql`
        SELECT * FROM trips
        ORDER BY trip_date DESC
      `;
      return result as Trip[];
    } catch (error) {
      console.error('Error fetching all trips:', error);
      return [];
    }
  },

  async getAllClaims(): Promise<Claim[]> {
    try {
      const result = await sql`
        SELECT c.*, m.name as crew_name
        FROM pay_claims c
        LEFT JOIN crew_members m ON c.crew_id = m.id
        ORDER BY c.created_at DESC
      `;
      return result as any[];
    } catch (error) {
      console.error('Error fetching all claims:', error);
      return [];
    }
  },

  async updateClaimStatus(claimId: string, status: string, reviewedBy?: string): Promise<boolean> {
    try {
      await sql`
        UPDATE pay_claims
        SET status = ${status},
            reviewed_by = ${reviewedBy || 'system'},
            reviewed_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${claimId}
      `;
      return true;
    } catch (error) {
      console.error('Error updating claim status:', error);
      return false;
    }
  },

  async getDisruptions(): Promise<any[]> {
    try {
      const result = await sql`
        SELECT d.*, t.route, t.trip_date
        FROM disruptions d
        LEFT JOIN trips t ON d.trip_id = t.id
        WHERE d.resolution_status != 'resolved'
        ORDER BY d.created_at DESC
      `;
      return result as any[];
    } catch (error) {
      console.error('Error fetching disruptions:', error);
      return [];
    }
  },

  async getViolations(): Promise<any[]> {
    try {
      const result = await sql`
        SELECT v.*, m.name as crew_name, t.route
        FROM compliance_violations v
        LEFT JOIN crew_members m ON v.crew_id = m.id
        LEFT JOIN trips t ON v.trip_id = t.id
        WHERE v.status != 'resolved'
        ORDER BY v.detected_at DESC
      `;
      return result as any[];
    } catch (error) {
      console.error('Error fetching violations:', error);
      return [];
    }
  }
};
