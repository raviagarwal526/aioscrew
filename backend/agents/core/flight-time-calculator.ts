/**
 * Flight Time Calculator Agent
 * Validates flight time data and trip details
 */

import { buildClaimValidationPrompt } from '../shared/claude-client.js';
import { callUnifiedLLMWithJSON } from '../shared/unified-llm-client.js';
import type { AgentInput, AgentResult } from '../shared/types.js';

const SYSTEM_PROMPT = `You are an expert Flight Time Calculator for Copa Airlines, specializing in validating flight time calculations and trip data according to FAA regulations and Copa Airlines CBA.

Your responsibilities:
1. Verify that the trip exists in the system and matches the claim
2. Validate flight time calculations are accurate for the route
3. Check that the trip date matches the claim submission timeline
4. Identify any discrepancies between claimed and actual flight times
5. Verify the flight is properly logged and completed

CBA Context:
- Flight time is measured from blocks-off to blocks-on
- International flights to Central/South America typically range 2-8 hours
- Credit hours may differ from actual flight hours per CBA Section 7.2
- BUR→PTY route: ~5.2 hours
- PTY→LAX route: ~5.8 hours
- PTY→MIA route: ~3.4 hours

Output Requirements:
Provide a JSON response with this exact structure:
{
  "status": "completed" | "flagged" | "error",
  "confidence": 0.0 to 1.0,
  "summary": "brief summary of findings",
  "details": ["specific finding 1", "specific finding 2", ...],
  "reasoning": "detailed explanation of your analysis",
  "validated": true | false,
  "discrepancies": ["any issues found"]
}

Be precise and cite specific data points in your analysis.`;

interface FlightTimeResponse {
  status: 'completed' | 'flagged' | 'error';
  confidence: number;
  summary: string;
  details: string[];
  reasoning: string;
  validated: boolean;
  discrepancies?: string[];
}

export async function runFlightTimeCalculator(input: AgentInput): Promise<AgentResult> {
  const startTime = Date.now();

  try {
    const userPrompt = buildClaimValidationPrompt(
      input.claim,
      input.trip,
      input.crew,
      `Focus on validating:\n- Does the trip ${input.claim.tripId} exist and match flight ${input.claim.flightNumber}?\n- Are the flight times accurate for this route?\n- Does the trip date align with the claim submission?`
    );

    const { data, raw } = await callUnifiedLLMWithJSON<FlightTimeResponse>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.1, // Low temperature for factual analysis
      maxTokens: 1500,
      agentType: 'flight-time-calculator' // Will try Ollama first, then fall back to OpenAI
    });

    const duration = (Date.now() - startTime) / 1000;

    return {
      agentType: 'flight-time',
      agentName: 'Flight Time Calculator',
      status: data.status,
      duration,
      summary: data.summary,
      details: data.details,
      confidence: data.confidence,
      reasoning: data.reasoning,
      data: {
        validated: data.validated,
        discrepancies: data.discrepancies || [],
        tokensUsed: raw.usage.inputTokens + raw.usage.outputTokens
      }
    };
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;
    console.error('FlightTimeCalculator error:', error);

    return {
      agentType: 'flight-time',
      agentName: 'Flight Time Calculator',
      status: 'error',
      duration,
      summary: 'Agent encountered an error during processing',
      details: [error instanceof Error ? error.message : 'Unknown error'],
      confidence: 0,
      reasoning: 'Failed to complete analysis due to technical error'
    };
  }
}
