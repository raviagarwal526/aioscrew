/**
 * Excess Payment Detector Agent
 * Identifies various types of excess payments in payroll:
 * - Duplicate payments
 * - Overpayments due to calculation errors
 * - Payments exceeding contract limits
 * - Payments for ineligible claims
 * - Historical pattern anomalies
 * - Violations of CBA rules
 */

import { callUnifiedLLMWithJSON } from '../shared/unified-llm-client.js';
import { neon } from '@neondatabase/serverless';
import type { AgentInput, AgentResult } from '../shared/types.js';

const sql = neon(process.env.DATABASE_URL!);

interface ExcessPaymentFinding {
  type: 'duplicate' | 'overpayment' | 'contract_violation' | 'ineligible' | 'anomaly' | 'calculation_error';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  excessAmount: number;
  expectedAmount: number;
  paidAmount: number;
  evidence: string[];
  contractReferences?: string[];
  suggestedAction: string;
}

interface ExcessPaymentResponse {
  status: 'completed' | 'flagged' | 'error';
  confidence: number;
  summary: string;
  details: string[];
  reasoning: string;
  findings: ExcessPaymentFinding[];
  totalExcessAmount: number;
  recommendation: string;
}

/**
 * Check for duplicate payments for the same claim
 */
async function checkDuplicates(claimId: string, crewId: string, amount: number, claimDate: Date): Promise<ExcessPaymentFinding[]> {
  const findings: ExcessPaymentFinding[] = [];
  
  try {
    // Check for duplicate payments in payment_items
    const duplicates = await sql`
      SELECT 
        pi.payment_id,
        pi.claim_id,
        pi.amount,
        pi.paid_at,
        pb.batch_id,
        pb.batch_date
      FROM payment_items pi
      JOIN payment_batches pb ON pi.batch_id = pb.batch_id
      WHERE pi.claim_id = ${claimId}
      AND pi.status = 'completed'
      ORDER BY pi.paid_at DESC
    `;

    if (duplicates.length > 1) {
      const totalPaid = duplicates.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
      findings.push({
        type: 'duplicate',
        severity: 'high',
        title: 'Duplicate Payment Detected',
        description: `This claim has been paid ${duplicates.length} times. Total paid: $${totalPaid.toFixed(2)}`,
        excessAmount: totalPaid - amount,
        expectedAmount: amount,
        paidAmount: totalPaid,
        evidence: duplicates.map((d: any) => 
          `Paid $${Number(d.amount).toFixed(2)} on ${new Date(d.paid_at).toLocaleDateString()} in batch ${d.batch_id}`
        ),
        suggestedAction: 'Review all payment batches and reverse duplicate payments'
      });
    }

    // Check for similar claims paid around the same time
    const similarClaims = await sql`
      SELECT 
        pc.id,
        pc.amount,
        pc.claim_date,
        pi.paid_at,
        pi.amount as paid_amount
      FROM pay_claims pc
      JOIN payment_items pi ON pc.id = pi.claim_id
      WHERE pc.crew_id = ${crewId}
      AND pc.claim_type = (SELECT claim_type FROM pay_claims WHERE id = ${claimId})
      AND ABS(EXTRACT(EPOCH FROM (pc.claim_date - ${claimDate.toISOString()}))) < 86400 * 7
      AND pi.status = 'completed'
      AND pc.id != ${claimId}
      ORDER BY pi.paid_at DESC
      LIMIT 5
    `;

    if (similarClaims.length > 0) {
      const similarAmounts = similarClaims.filter((c: any) => 
        Math.abs(Number(c.amount) - amount) < amount * 0.1
      );
      
      if (similarAmounts.length > 0) {
        findings.push({
          type: 'duplicate',
          severity: 'medium',
          title: 'Potential Duplicate - Similar Claims Paid Recently',
          description: `Found ${similarAmounts.length} similar claims paid within 7 days`,
          excessAmount: 0,
          expectedAmount: amount,
          paidAmount: amount,
          evidence: similarAmounts.map((c: any) => 
            `Claim ${c.id}: $${Number(c.amount).toFixed(2)} paid on ${new Date(c.paid_at).toLocaleDateString()}`
          ),
          suggestedAction: 'Verify these are distinct claims and not duplicates'
        });
      }
    }
  } catch (error) {
    console.error('Error checking duplicates:', error);
  }

  return findings;
}

/**
 * Check for historical payment patterns and anomalies
 */
async function checkHistoricalPatterns(crewId: string, claimType: string, amount: number): Promise<ExcessPaymentFinding[]> {
  const findings: ExcessPaymentFinding[] = [];

  try {
    // Get historical average for this claim type
    const historicalStats = await sql`
      SELECT 
        AVG(COALESCE(pc.amount_approved, pc.amount)) as avg_amount,
        STDDEV(COALESCE(pc.amount_approved, pc.amount)) as stddev_amount,
        MAX(COALESCE(pc.amount_approved, pc.amount)) as max_amount,
        COUNT(*) as claim_count
      FROM pay_claims pc
      WHERE pc.crew_id = ${crewId}
      AND pc.claim_type = ${claimType}
      AND pc.status IN ('approved', 'auto_approved', 'ai-validated')
      AND pc.claim_date >= CURRENT_DATE - INTERVAL '90 days'
    `;

    if (historicalStats.length > 0 && historicalStats[0].claim_count > 0) {
      const avgAmount = Number(historicalStats[0].avg_amount || 0);
      const stddev = Number(historicalStats[0].stddev_amount || 0);
      const maxAmount = Number(historicalStats[0].max_amount || 0);

      // Flag if amount is significantly higher than average (more than 2 standard deviations)
      if (avgAmount > 0 && amount > avgAmount + (2 * stddev)) {
        findings.push({
          type: 'anomaly',
          severity: amount > avgAmount * 1.5 ? 'high' : 'medium',
          title: 'Amount Exceeds Historical Average',
          description: `This claim amount ($${amount.toFixed(2)}) is significantly higher than the crew member's average ($${avgAmount.toFixed(2)}) for this claim type`,
          excessAmount: amount - avgAmount,
          expectedAmount: avgAmount,
          paidAmount: amount,
          evidence: [
            `Historical average: $${avgAmount.toFixed(2)}`,
            `Standard deviation: $${stddev.toFixed(2)}`,
            `Maximum historical amount: $${maxAmount.toFixed(2)}`,
            `Current amount: $${amount.toFixed(2)}`
          ],
          suggestedAction: 'Review claim details and verify amount is correct'
        });
      }

      // Flag if amount exceeds historical maximum
      if (maxAmount > 0 && amount > maxAmount * 1.2) {
        findings.push({
          type: 'anomaly',
          severity: 'high',
          title: 'Amount Exceeds Historical Maximum',
          description: `This claim amount exceeds the crew member's historical maximum by more than 20%`,
          excessAmount: amount - maxAmount,
          expectedAmount: maxAmount,
          paidAmount: amount,
          evidence: [
            `Historical maximum: $${maxAmount.toFixed(2)}`,
            `Current amount: $${amount.toFixed(2)}`,
            `Excess: $${(amount - maxAmount).toFixed(2)}`
          ],
          suggestedAction: 'Require additional documentation and approval'
        });
      }
    }
  } catch (error) {
    console.error('Error checking historical patterns:', error);
  }

  return findings;
}

/**
 * Build system prompt for excess payment detection
 */
function buildExcessPaymentSystemPrompt(): string {
  return `You are an expert Excess Payment Detector for Copa Airlines Payroll, specializing in identifying various types of overpayments and payment errors.

Your responsibilities:
1. Identify duplicate payments for the same claim
2. Detect overpayments due to calculation errors
3. Flag payments that exceed CBA contract limits
4. Identify payments for ineligible claims
5. Detect anomalies in payment patterns
6. Verify payment amounts against contract rules

Common excess payment scenarios:
- **Duplicate Payments**: Same claim paid multiple times
- **Calculation Errors**: Incorrect premium pay calculations, wrong multipliers
- **Contract Violations**: Payments exceeding CBA maximums, ineligible periods
- **Ineligible Claims**: Claims that don't meet CBA requirements
- **Pattern Anomalies**: Amounts significantly higher than historical averages
- **Double Counting**: Same flight/trip counted multiple times

Output Requirements:
Provide a JSON response with this exact structure:
{
  "status": "completed" | "flagged" | "error",
  "confidence": 0.0 to 1.0,
  "summary": "brief summary of findings",
  "details": ["finding detail 1", "finding detail 2", ...],
  "reasoning": "detailed explanation",
  "findings": [
    {
      "type": "duplicate" | "overpayment" | "contract_violation" | "ineligible" | "anomaly" | "calculation_error",
      "severity": "high" | "medium" | "low",
      "title": "Short title",
      "description": "Detailed description",
      "excessAmount": 125.00,
      "expectedAmount": 100.00,
      "paidAmount": 125.00,
      "evidence": ["evidence item 1", "evidence item 2"],
      "contractReferences": ["CBA Section 12.4"],
      "suggestedAction": "What should be done"
    }
  ],
  "totalExcessAmount": 125.00,
  "recommendation": "Overall recommendation"
}

Be thorough and precise. Flag any potential excess payments, even if uncertain (use lower confidence).`;
}

/**
 * Run excess payment detection agent
 */
export async function runExcessPaymentDetector(input: AgentInput): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const claim = input.claim;
    const findings: ExcessPaymentFinding[] = [];

    // 1. Check for duplicates
    const duplicateFindings = await checkDuplicates(
      claim.id,
      claim.crewMemberId,
      claim.amount,
      claim.submittedDate
    );
    findings.push(...duplicateFindings);

    // 2. Check historical patterns
    const patternFindings = await checkHistoricalPatterns(
      claim.crewMemberId,
      claim.type,
      claim.amount
    );
    findings.push(...patternFindings);

    // 3. Use LLM to analyze claim details for other excess payment scenarios
    const systemPrompt = buildExcessPaymentSystemPrompt();
    
    // Get payment history for this claim
    const paymentHistory = await sql`
      SELECT 
        pi.*,
        pb.batch_date,
        pb.status as batch_status
      FROM payment_items pi
      JOIN payment_batches pb ON pi.batch_id = pb.batch_id
      WHERE pi.claim_id = ${claim.id}
      ORDER BY pi.paid_at DESC
    `;

    // Get approved amount
    const claimDetails = await sql`
      SELECT 
        amount,
        COALESCE(amount_approved, amount) as approved_amount,
        status,
        ai_reasoning,
        contract_references
      FROM pay_claims
      WHERE id = ${claim.id}
      LIMIT 1
    `;

    const approvedAmount = claimDetails.length > 0 
      ? Number(claimDetails[0].approved_amount || claimDetails[0].amount || 0)
      : claim.amount;

    const userPrompt = `Analyze this claim for excess payment scenarios:

CLAIM INFORMATION:
- Claim ID: ${claim.id}
- Claim Number: ${claim.claimNumber}
- Crew Member: ${claim.crewMemberName} (ID: ${claim.crewMemberId})
- Claim Type: ${claim.type}
- Claimed Amount: $${claim.amount.toFixed(2)}
- Approved Amount: $${approvedAmount.toFixed(2)}
- Submitted Date: ${claim.submittedDate.toISOString()}
- Description: ${claim.description || 'N/A'}

PAYMENT HISTORY:
${paymentHistory.length > 0 
  ? paymentHistory.map((p: any) => 
      `- Paid $${Number(p.amount).toFixed(2)} on ${new Date(p.paid_at).toISOString()} in batch ${p.batch_id} (Status: ${p.status})`
    ).join('\n')
  : 'No payments recorded yet'
}

TRIP INFORMATION:
${input.trip ? `
- Trip Date: ${input.trip.date.toISOString()}
- Route: ${input.trip.route}
- Flight Numbers: ${input.trip.flightNumbers}
- Flight Time: ${input.trip.flightTimeHours} hours
- Credit Hours: ${input.trip.creditHours} hours
- International: ${input.trip.isInternational ? 'Yes' : 'No'}
` : 'No trip data available'}

CREW INFORMATION:
${input.crew ? `
- Role: ${input.crew.role}
- Base: ${input.crew.base}
- Seniority: ${input.crew.seniority}
- YTD Earnings: $${input.crew.ytdEarnings.toFixed(2)}
` : 'No crew data available'}

EXISTING FINDINGS FROM AUTOMATED CHECKS:
${findings.length > 0 
  ? findings.map(f => `- ${f.title}: ${f.description}`).join('\n')
  : 'No automated findings'
}

Analyze this claim for:
1. Calculation errors (wrong multipliers, incorrect premium rates)
2. Contract violations (exceeding CBA maximums)
3. Ineligible periods or conditions
4. Double counting of flight segments or hours
5. Any other excess payment scenarios

Provide detailed findings with evidence and recommended actions.`;

    const { data, raw } = await callUnifiedLLMWithJSON<ExcessPaymentResponse>({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 3000,
      agentType: 'excess-payment-detector'
    });

    // Merge automated findings with LLM findings
    const allFindings = [...findings, ...(data.findings || [])];
    
    // Calculate total excess amount
    const totalExcess = allFindings.reduce((sum, f) => sum + f.excessAmount, 0);

    const duration = (Date.now() - startTime) / 1000;

    // Determine status based on findings
    let status: 'completed' | 'flagged' | 'error' = 'completed';
    if (data.status === 'error') {
      status = 'error';
    } else if (allFindings.length > 0 || totalExcess > 0) {
      status = 'flagged';
    }

    return {
      agentType: 'excess-payment-detector',
      agentName: 'Excess Payment Detector',
      status,
      duration,
      summary: data.summary || `Found ${allFindings.length} excess payment issue(s) totaling $${totalExcess.toFixed(2)}`,
      details: data.details || [],
      confidence: data.confidence || (allFindings.length > 0 ? 0.7 : 0.9),
      reasoning: data.reasoning || '',
      data: {
        findings: allFindings,
        totalExcessAmount: totalExcess,
        recommendation: data.recommendation || (totalExcess > 0 ? 'Review and correct excess payments' : 'No excess payments detected'),
        tokensUsed: raw.usage?.inputTokens + raw.usage?.outputTokens || 0
      }
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error('ExcessPaymentDetector error:', error);

    return {
      agentType: 'excess-payment-detector',
      agentName: 'Excess Payment Detector',
      status: 'error',
      duration,
      summary: 'Agent encountered an error during processing',
      details: [error instanceof Error ? error.message : 'Unknown error'],
      confidence: 0,
      reasoning: 'Failed to complete excess payment detection due to technical error'
    };
  }
}
