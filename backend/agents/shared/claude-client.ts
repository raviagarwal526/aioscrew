/**
 * Claude API client wrapper
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Check if Anthropic API key is configured
 */
export function isAnthropicApiKeyConfigured(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return !!apiKey && apiKey.trim().length > 0;
}

/**
 * Get Anthropic client instance (lazy initialization)
 */
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!isAnthropicApiKeyConfigured()) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Please set it in your environment variables.\n' +
        'Get your API key from: https://console.anthropic.com/'
      );
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

export interface ClaudeCallOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface ClaudeResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
}

/**
 * Call Claude API with structured prompts
 */
export async function callClaude(options: ClaudeCallOptions): Promise<ClaudeResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens = 2000,
    model = 'claude-sonnet-4-5-20250929'
  } = options;

  // Check API key before making request
  if (!isAnthropicApiKeyConfigured()) {
    const error = new Error(
      'ANTHROPIC_API_KEY is not configured. Please set it in your environment variables.\n' +
      'Get your API key from: https://console.anthropic.com/'
    );
    (error as any).isConfigError = true;
    (error as any).statusCode = 503;
    throw error;
  }

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return {
      content: content.text,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens
      },
      stopReason: message.stop_reason || 'end_turn'
    };
  } catch (error: any) {
    // Don't wrap config errors
    if (error?.isConfigError) {
      throw error;
    }

    // Check for specific API errors
    const statusCode = error?.status || error?.statusCode;
    const errorMessage = error?.error?.message || error?.message || String(error);
    
    // Detect credit balance errors (400, 402, or specific error messages)
    if (
      statusCode === 402 ||
      statusCode === 400 ||
      errorMessage.toLowerCase().includes('credit balance') ||
      errorMessage.toLowerCase().includes('insufficient funds') ||
      errorMessage.toLowerCase().includes('too low') ||
      errorMessage.toLowerCase().includes('payment required')
    ) {
      const creditError = new Error(
        `Anthropic API credit balance is insufficient or account has no funds.\n` +
        `Please add credits to your Anthropic account at https://console.anthropic.com/\n` +
        `Original error: ${errorMessage}`
      );
      (creditError as any).isCreditError = true;
      (creditError as any).statusCode = 402;
      throw creditError;
    }
    
    // Detect authentication errors (401)
    if (
      statusCode === 401 ||
      errorMessage.toLowerCase().includes('authentication') ||
      errorMessage.toLowerCase().includes('api key') ||
      errorMessage.toLowerCase().includes('invalid api key') ||
      errorMessage.toLowerCase().includes('unauthorized')
    ) {
      const authError = new Error(
        `Anthropic API authentication failed. Please check your ANTHROPIC_API_KEY.\n` +
        `Get your API key from: https://console.anthropic.com/\n` +
        `Original error: ${errorMessage}`
      );
      (authError as any).isAuthError = true;
      (authError as any).statusCode = 401;
      throw authError;
    }

    // Handle rate limiting (429)
    if (statusCode === 429) {
      const rateLimitError = new Error(
        `Anthropic API rate limit exceeded. Please wait before retrying.\n` +
        `Original error: ${errorMessage}`
      );
      (rateLimitError as any).isRateLimitError = true;
      (rateLimitError as any).statusCode = 429;
      throw rateLimitError;
    }
    
    console.error('Claude API error:', error);
    const apiError = new Error(
      `Claude API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    (apiError as any).originalError = error;
    (apiError as any).statusCode = statusCode || 500;
    throw apiError;
  }
}

/**
 * Call Claude with JSON output parsing
 */
export async function callClaudeWithJSON<T>(
  options: ClaudeCallOptions
): Promise<{ data: T; raw: ClaudeResponse }> {
  const response = await callClaude(options);

  try {
    // Extract JSON from markdown code blocks if present
    let jsonStr = response.content;
    const jsonMatch = jsonStr.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const data = JSON.parse(jsonStr) as T;
    return { data, raw: response };
  } catch (error) {
    console.error('Failed to parse Claude response as JSON:', response.content);
    throw new Error('Claude response was not valid JSON');
  }
}

/**
 * Estimate tokens (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Build a structured prompt for claim validation
 */
export function buildClaimValidationPrompt(
  claim: any,
  trip?: any,
  crew?: any,
  additionalContext?: string
): string {
  let prompt = `Analyze the following pay claim:\n\n`;

  prompt += `CLAIM DETAILS:\n`;
  prompt += `- Claim Number: ${claim.claimNumber}\n`;
  prompt += `- Crew Member: ${claim.crewMemberName} (${claim.crewMemberId})\n`;
  prompt += `- Type: ${claim.type}\n`;
  prompt += `- Amount: $${(claim.amount ?? 0).toFixed(2)}\n`;
  prompt += `- Submitted: ${new Date(claim.submittedDate).toLocaleDateString()}\n`;
  if (claim.description) {
    prompt += `- Description: ${claim.description}\n`;
  }

  if (trip) {
    prompt += `\nTRIP DETAILS:\n`;
    prompt += `- Trip ID: ${trip.id}\n`;
    prompt += `- Route: ${trip.route}\n`;
    prompt += `- Flight Numbers: ${trip.flightNumbers}\n`;
    prompt += `- Date: ${new Date(trip.date).toLocaleDateString()}\n`;
    prompt += `- Flight Time: ${trip.flightTimeHours} hours\n`;
    prompt += `- International: ${trip.isInternational ? 'Yes' : 'No'}\n`;
    if (trip.layoverCity) {
      prompt += `- Layover: ${trip.layoverCity}\n`;
    }
  }

  if (crew) {
    prompt += `\nCREW MEMBER INFO:\n`;
    prompt += `- Role: ${crew.role}\n`;
    prompt += `- Base: ${crew.base}\n`;
    prompt += `- Seniority: ${crew.seniority} years\n`;
    prompt += `- Qualification: ${crew.qualification}\n`;
  }

  if (additionalContext) {
    prompt += `\nADDITIONAL CONTEXT:\n${additionalContext}\n`;
  }

  return prompt;
}
