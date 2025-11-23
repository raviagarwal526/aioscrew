/**
 * Premium Pay Calculator Agent
 * Validates premium pay calculations per CBA contract
 */

import { buildClaimValidationPrompt } from '../shared/claude-client.js';
import { callUnifiedLLMWithJSON } from '../shared/unified-llm-client.js';
import type { AgentInput, AgentResult, ContractReference } from '../shared/types.js';

const SYSTEM_PROMPT = `You are an expert Premium Pay Calculator for Copa Airlines, specializing in Copa Airlines CBA premium pay sections and pay rules.

Your responsibilities:
1. Determine if the claim qualifies for premium pay under CBA rules
2. Calculate the correct premium amount based on claim type
3. Verify the claimed amount matches CBA rates
4. Identify applicable CBA sections
5. Flag any amount discrepancies

Copa Airlines CBA Premium Pay Rates:
- **International Premium (Section 12.4):** $125 per flight segment to destinations outside continental US
  - Applies to: Central America, South America, Caribbean
  - Examples: Guatemala (GUA), Panama (PTY), Costa Rica (SJO), Colombia (BOG), Ecuador (GYE)

- **Holiday Premium (Section 15.2):** 1.5x hourly rate for work on major holidays
  - Major holidays: New Year's, Memorial Day, Independence Day, Thanksgiving, Christmas

- **Night Premium (Section 14.3):** $5/hour for flights operating between 2200-0600 local

- **Reserve Call-Out (Section 18.5):** Minimum 4 hours pay at regular rate

- **Training Premium (Section 20.2):** $75/day for recurrent training days

Output Requirements:
Provide a JSON response with this exact structure:
{
  "status": "completed" | "flagged" | "error",
  "confidence": 0.0 to 1.0,
  "summary": "brief summary of calculation",
  "details": ["calculation step 1", "calculation step 2", ...],
  "reasoning": "detailed explanation",
  "calculatedAmount": 125.00,
  "claimedAmount": 125.00,
  "amountCorrect": true | false,
  "applicableSections": ["CBA Section 12.4"],
  "contractReferences": [
    {
      "section": "CBA Section 12.4",
      "title": "International Premium Pay",
      "text": "excerpt from contract",
      "relevance": 0.0 to 1.0
    }
  ]
}

Be precise in calculations and always cite specific CBA sections.`;

interface PremiumPayResponse {
  status: 'completed' | 'flagged' | 'error';
  confidence: number;
  summary: string;
  details: string[];
  reasoning: string;
  calculatedAmount: number;
  claimedAmount: number;
  amountCorrect: boolean;
  applicableSections: string[];
  contractReferences: ContractReference[];
}

export async function runPremiumPayCalculator(input: AgentInput): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const userPrompt = buildClaimValidationPrompt(
      input.claim,
      input.trip,
      input.crew,
      `Focus on:\n- What type of premium pay is being claimed: "${input.claim.type}"?\n- Does this claim qualify under CBA rules?\n- Is the amount $${input.claim.amount.toFixed(2)} correct per the CBA rate?\n- Which CBA sections apply?`
    );

    const { data, raw } = await callUnifiedLLMWithJSON<PremiumPayResponse>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.1,
      maxTokens: 2000,
      agentType: 'premium-pay-calculator' // Will try Ollama first, then fall back to Claude Sonnet
    });

    const duration = (Date.now() - startTime) / 1000;

    return {
      agentType: 'premium-pay',
      agentName: 'Premium Pay Calculator',
      status: data.status,
      duration,
      summary: data.summary,
      details: data.details,
      confidence: data.confidence,
      reasoning: data.reasoning,
      data: {
        calculatedAmount: data.calculatedAmount,
        claimedAmount: data.claimedAmount,
        amountCorrect: data.amountCorrect,
        applicableSections: data.applicableSections,
        contractReferences: data.contractReferences,
        tokensUsed: raw.usage.inputTokens + raw.usage.outputTokens
      }
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error('PremiumPayCalculator error:', error);

    return {
      agentType: 'premium-pay',
      agentName: 'Premium Pay Calculator',
      status: 'error',
      duration,
      summary: 'Agent encountered an error during processing',
      details: [error instanceof Error ? error.message : 'Unknown error'],
      confidence: 0,
      reasoning: 'Failed to complete calculation due to technical error'
    };
  }
}
