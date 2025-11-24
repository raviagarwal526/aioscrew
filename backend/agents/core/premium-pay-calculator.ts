/**
 * Premium Pay Calculator Agent
 * Validates premium pay calculations per CBA contract
 * Uses Neo4j Knowledge Graph for CBA premium pay rates
 */

import { buildClaimValidationPrompt } from '../shared/claude-client.js';
import { callUnifiedLLMWithJSON } from '../shared/unified-llm-client.js';
import { getPremiumPayRate, getContractSectionsForClaimType, getAllPremiumPayRates } from '../../services/neo4j-service.js';
import type { AgentInput, AgentResult, ContractReference } from '../shared/types.js';

/**
 * Build system prompt dynamically from Neo4j premium pay rates
 */
async function buildPremiumPaySystemPrompt(): Promise<string> {
  try {
    const rates = await getAllPremiumPayRates();
    
    let ratesText = 'Copa Airlines CBA Premium Pay Rates (from Knowledge Graph):\n';
    if (rates.length === 0) {
      // Fallback to default rates if Neo4j is not available
      ratesText = `Copa Airlines CBA Premium Pay Rates (fallback):
- **International Premium (Section 12.4):** $125 per flight segment to destinations outside continental US
  - Applies to: Central America, South America, Caribbean
  - Examples: Guatemala (GUA), Panama (PTY), Costa Rica (SJO), Colombia (BOG), Ecuador (GYE)

- **Holiday Premium (Section 15.2):** 1.5x hourly rate for work on major holidays
  - Major holidays: New Year's, Memorial Day, Independence Day, Thanksgiving, Christmas

- **Night Premium (Section 14.3):** $5/hour for flights operating between 2200-0600 local

- **Reserve Call-Out (Section 18.5):** Minimum 4 hours pay at regular rate

- **Training Premium (Section 20.2):** $75/day for recurrent training days`;
    } else {
      rates.forEach((rate: any) => {
        ratesText += `- **${rate.type}**: `;
        if (rate.amount) {
          ratesText += `$${rate.amount}`;
        }
        if (rate.formula) {
          ratesText += ` ${rate.formula}`;
        }
        ratesText += '\n';
        if (rate.conditions) {
          ratesText += `  - Conditions: ${rate.conditions}\n`;
        }
        if (rate.applicableDestinations && rate.applicableDestinations.length > 0) {
          ratesText += `  - Applies to: ${rate.applicableDestinations.join(', ')}\n`;
        }
        if (rate.contractSections && rate.contractSections.length > 0) {
          ratesText += `  - Contract Sections: ${rate.contractSections.join(', ')}\n`;
        }
        ratesText += '\n';
      });
    }

    return `You are an expert Premium Pay Calculator for Copa Airlines, specializing in Copa Airlines CBA premium pay sections and pay rules.

Your responsibilities:
1. Determine if the claim qualifies for premium pay under CBA rules
2. Calculate the correct premium amount based on claim type
3. Verify the claimed amount matches CBA rates
4. Identify applicable CBA sections
5. Flag any amount discrepancies

${ratesText}

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

Be precise in calculations and always cite specific CBA sections from the knowledge graph.`;
  } catch (error) {
    console.error('Error building premium pay system prompt from Neo4j:', error);
    // Return fallback prompt
    return `You are an expert Premium Pay Calculator for Copa Airlines, specializing in Copa Airlines CBA premium pay sections and pay rules.

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
  }
}

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
    // Query Neo4j for premium pay rate for this claim type
    let premiumPayRate: any = null;
    if (input.claim?.type) {
      try {
        premiumPayRate = await getPremiumPayRate(input.claim.type);
      } catch (error) {
        console.warn('Could not fetch premium pay rate from Neo4j:', error);
      }
    }

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
    const systemPrompt = await buildPremiumPaySystemPrompt();

    // Build context with premium pay rate information
    let rateContext = '';
    if (premiumPayRate) {
      rateContext = `\nPREMIUM PAY RATE FROM KNOWLEDGE GRAPH:\n`;
      rateContext += `- Type: ${premiumPayRate.type}\n`;
      if (premiumPayRate.amount) {
        rateContext += `- Amount: $${premiumPayRate.amount}\n`;
      }
      if (premiumPayRate.formula) {
        rateContext += `- Formula: ${premiumPayRate.formula}\n`;
      }
      if (premiumPayRate.conditions) {
        rateContext += `- Conditions: ${premiumPayRate.conditions}\n`;
      }
      if (premiumPayRate.applicableDestinations && premiumPayRate.applicableDestinations.length > 0) {
        rateContext += `- Applicable Destinations: ${premiumPayRate.applicableDestinations.join(', ')}\n`;
      }
      if (premiumPayRate.contractSections && premiumPayRate.contractSections.length > 0) {
        rateContext += `- Contract Sections: ${premiumPayRate.contractSections.join(', ')}\n`;
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
      `Focus on:\n- What type of premium pay is being claimed: "${input.claim.type}"?\n- Does this claim qualify under CBA rules?\n- Is the amount $${(input.claim.amount ?? 0).toFixed(2)} correct per the CBA rate?\n- Which CBA sections apply?${rateContext}${contractContext}`
    );

    const { data, raw } = await callUnifiedLLMWithJSON<PremiumPayResponse>({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 2000,
      agentType: 'premium-pay-calculator' // Will try Ollama first, then fall back to Claude Sonnet
    });

    const duration = (Date.now() - startTime) / 1000;

    // Merge contract references from Neo4j with those from LLM response
    const allContractReferences = [
      ...contractReferences,
      ...(data.contractReferences || [])
    ].filter((ref, index, self) => 
      index === self.findIndex(r => r.section === ref.section)
    );

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
        contractReferences: allContractReferences, // Include contract references from Neo4j
        tokensUsed: raw.usage?.inputTokens + raw.usage?.outputTokens || 0
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
