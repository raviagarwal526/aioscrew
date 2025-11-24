/**
 * Compliance Validator Agent
 * Detects fraud, duplicates, and policy violations
 * Uses Neo4j Knowledge Graph for CBA contract rules
 */

import { buildClaimValidationPrompt } from '../shared/claude-client.js';
import { callUnifiedLLMWithJSON } from '../shared/unified-llm-client.js';
import { getAllComplianceRules, getContractSectionsForClaimType } from '../../services/neo4j-service.js';
import type { AgentInput, AgentResult, Issue, ContractReference } from '../shared/types.js';

/**
 * Build system prompt dynamically from Neo4j compliance rules
 */
async function buildComplianceSystemPrompt(): Promise<string> {
  try {
    const rules = await getAllComplianceRules();
    
    let rulesText = 'CBA Compliance Rules (from Knowledge Graph):\n';
    if (rules.length === 0) {
      // Fallback to default rules if Neo4j is not available
      rulesText = `CBA Compliance Rules (fallback):
- Filing deadline: Claims must be submitted within 7 days of trip completion
- Duplicate prevention: Only one claim per trip per crew member per pay type
- Qualification requirements: Crew must have valid qualification for claimed work
- Documentation: Claims over $100 should have supporting documentation`;
    } else {
      rules.forEach((rule: any) => {
        rulesText += `- ${rule.type}: ${rule.description}\n`;
        if (rule.deadlineDays) {
          rulesText += `  Deadline: ${rule.deadlineDays} days\n`;
        }
        if (rule.requiredDocumentation) {
          rulesText += `  Required Documentation: ${rule.requiredDocumentation}\n`;
        }
        if (rule.qualificationRequired) {
          rulesText += `  Qualification Required: Yes\n`;
        }
        if (rule.redFlags && rule.redFlags.length > 0) {
          rulesText += `  Red Flags: ${rule.redFlags.join(', ')}\n`;
        }
        if (rule.contractSections && rule.contractSections.length > 0) {
          rulesText += `  Contract References: ${rule.contractSections.join(', ')}\n`;
        }
        rulesText += '\n';
      });
    }

    return `You are an expert Compliance Validator and fraud detection specialist for Copa Airlines payroll claims.

Your responsibilities:
1. Check for duplicate claims (same trip, same crew member, same type)
2. Verify crew member is qualified for the claimed work
3. Detect unusual patterns (frequency, amounts, timing)
4. Validate claim is within filing deadline
5. Check for policy violations and fraud indicators
6. Review crew member's recent claim history

Red Flags to Check:
- Multiple claims for the same trip
- Claims significantly above historical averages
- Claims filed outside the filing deadline window
- Crew member not qualified for the work claimed (e.g., international premium without international qualification)
- Suspicious patterns: many claims in short time, all above average amounts
- Missing supporting documentation for high-value claims
- Claims for cancelled or never-operated flights

${rulesText}

Output Requirements:
Provide a JSON response with this exact structure:
{
  "status": "completed" | "flagged" | "error",
  "confidence": 0.0 to 1.0,
  "summary": "brief summary of compliance check",
  "details": ["finding 1", "finding 2", ...],
  "reasoning": "detailed explanation",
  "compliant": true | false,
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "title": "Issue title",
      "description": "Issue description",
      "suggestedAction": "What to do about it"
    }
  ],
  "fraudRisk": "none" | "low" | "medium" | "high",
  "fraudIndicators": ["indicator 1", "indicator 2", ...]
}

Be thorough but fair. Flag legitimate concerns but don't create false positives. Always cite specific CBA contract sections when referencing rules.`;
  } catch (error) {
    console.error('Error building compliance system prompt from Neo4j:', error);
    // Return fallback prompt
    return `You are an expert Compliance Validator and fraud detection specialist for Copa Airlines payroll claims.

Your responsibilities:
1. Check for duplicate claims (same trip, same crew member, same type)
2. Verify crew member is qualified for the claimed work
3. Detect unusual patterns (frequency, amounts, timing)
4. Validate claim is within filing deadline (7 days from trip)
5. Check for policy violations and fraud indicators
6. Review crew member's recent claim history

CBA Compliance Rules:
- Filing deadline: Claims must be submitted within 7 days of trip completion
- Duplicate prevention: Only one claim per trip per crew member per pay type
- Qualification requirements: Crew must have valid qualification for claimed work
- Documentation: Claims over $100 should have supporting documentation

Output Requirements:
Provide a JSON response with this exact structure:
{
  "status": "completed" | "flagged" | "error",
  "confidence": 0.0 to 1.0,
  "summary": "brief summary of compliance check",
  "details": ["finding 1", "finding 2", ...],
  "reasoning": "detailed explanation",
  "compliant": true | false,
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "title": "Issue title",
      "description": "Issue description",
      "suggestedAction": "What to do about it"
    }
  ],
  "fraudRisk": "none" | "low" | "medium" | "high",
  "fraudIndicators": ["indicator 1", "indicator 2", ...]
}

Be thorough but fair. Flag legitimate concerns but don't create false positives.`;
  }
}

interface ComplianceResponse {
  status: 'completed' | 'flagged' | 'error';
  confidence: number;
  summary: string;
  details: string[];
  reasoning: string;
  compliant: boolean;
  issues: Issue[];
  fraudRisk: 'none' | 'low' | 'medium' | 'high';
  fraudIndicators: string[];
}

export async function runComplianceValidator(input: AgentInput): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    // Query Neo4j for contract sections relevant to this claim type
    let contractReferences: ContractReference[] = [];
    if (input.claim?.type) {
      try {
        contractReferences = await getContractSectionsForClaimType(input.claim.type);
      } catch (error) {
        console.warn('Could not fetch contract references from Neo4j:', error);
      }
    }

    // Build system prompt from Neo4j data
    const systemPrompt = await buildComplianceSystemPrompt();

    // Build context with historical data and contract references
    let historicalContext = '';
    if (input.historicalData) {
      historicalContext = `\nHISTORICAL DATA FOR THIS CREW MEMBER:\n`;
      historicalContext += `- Similar claims filed: ${input.historicalData.similarClaims}\n`;
      historicalContext += `- Historical approval rate: ${((input.historicalData.approvalRate ?? 0) * 100).toFixed(1)}%\n`;
      historicalContext += `- Average claim amount: $${(input.historicalData.averageAmount ?? 0).toFixed(2)}\n`;

      if (input.historicalData.recentClaimsByUser && input.historicalData.recentClaimsByUser.length > 0) {
        historicalContext += `- Recent claims (last 7 days): ${input.historicalData.recentClaimsByUser.length}\n`;
        historicalContext += `  Types: ${input.historicalData.recentClaimsByUser.map(c => c.type).join(', ')}\n`;
        historicalContext += `  Amounts: ${input.historicalData.recentClaimsByUser.map(c => `$${c.amount ?? 0}`).join(', ')}\n`;
      }
    }

    // Add contract references to context
    let contractContext = '';
    if (contractReferences.length > 0) {
      contractContext = `\nRELEVANT CBA CONTRACT SECTIONS:\n`;
      contractReferences.forEach(ref => {
        contractContext += `- ${ref.section}: ${ref.title}\n`;
        contractContext += `  ${ref.text.substring(0, 200)}...\n`;
      });
    }

    const userPrompt = buildClaimValidationPrompt(
      input.claim,
      input.trip,
      input.crew,
      `Focus on compliance and fraud detection:\n- Any red flags or policy violations?\n- Is this claim within the filing deadline window?\n- Any unusual patterns in amount or frequency?\n- Is crew qualified for this work?${historicalContext}${contractContext}`
    );

    const { data, raw } = await callUnifiedLLMWithJSON<ComplianceResponse>({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 2500,
      agentType: 'compliance-validator' // Will try Ollama first, then fall back to Claude Opus (expensive!)
    });

    const duration = (Date.now() - startTime) / 1000;

    // Add detectedBy field to issues
    const issuesWithDetectedBy = data.issues.map(issue => ({
      ...issue,
      detectedBy: 'compliance' as const
    }));

    return {
      agentType: 'compliance',
      agentName: 'Compliance Validator',
      status: data.status,
      duration,
      summary: data.summary,
      details: data.details,
      confidence: data.confidence,
      reasoning: data.reasoning,
      data: {
        compliant: data.compliant,
        issues: issuesWithDetectedBy,
        fraudRisk: data.fraudRisk,
        fraudIndicators: data.fraudIndicators,
        contractReferences, // Include contract references from Neo4j
        tokensUsed: raw.usage?.inputTokens + raw.usage?.outputTokens || 0
      }
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error('ComplianceValidator error:', error);

    return {
      agentType: 'compliance',
      agentName: 'Compliance Validator',
      status: 'error',
      duration,
      summary: 'Agent encountered an error during processing',
      details: [error instanceof Error ? error.message : 'Unknown error'],
      confidence: 0,
      reasoning: 'Failed to complete compliance check due to technical error'
    };
  }
}
