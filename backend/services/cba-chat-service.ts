/**
 * CBA Dual-Perspective Chat Service
 * Provides RAG-based Q&A from both Claims Administrator and Union Representative perspectives
 */

import Anthropic from '@anthropic-ai/sdk';
import { executeReadQuery } from './neo4j-service.js';
import type { ContractReference } from '../agents/shared/types.js';

/**
 * Check if Anthropic API key is configured
 */
function isAnthropicApiKeyConfigured(): boolean {
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

/**
 * Handle Anthropic API errors gracefully
 */
function handleAnthropicError(error: any, context: string): never {
  const statusCode = error?.status || error?.statusCode;
  const errorMessage = error?.error?.message || error?.message || String(error);
  
  // Check for missing API key
  if (!isAnthropicApiKeyConfigured()) {
    const configError = new Error(
      `ANTHROPIC_API_KEY is not configured. Cannot ${context}.\n` +
      `Please set ANTHROPIC_API_KEY in your environment variables.\n` +
      `Get your API key from: https://console.anthropic.com/`
    );
    (configError as any).isConfigError = true;
    (configError as any).statusCode = 503;
    throw configError;
  }

  // Check for credit balance errors
  if (
    statusCode === 402 ||
    statusCode === 400 ||
    errorMessage.toLowerCase().includes('credit balance') ||
    errorMessage.toLowerCase().includes('insufficient funds') ||
    errorMessage.toLowerCase().includes('too low') ||
    errorMessage.toLowerCase().includes('payment required')
  ) {
    const creditError = new Error(
      `Anthropic API credit balance is insufficient. Cannot ${context}.\n` +
      `Please add credits to your Anthropic account at https://console.anthropic.com/\n` +
      `Original error: ${errorMessage}`
    );
    (creditError as any).isCreditError = true;
    (creditError as any).statusCode = 402;
    throw creditError;
  }

  // Check for authentication errors
  if (
    statusCode === 401 ||
    errorMessage.toLowerCase().includes('authentication') ||
    errorMessage.toLowerCase().includes('api key') ||
    errorMessage.toLowerCase().includes('invalid api key') ||
    errorMessage.toLowerCase().includes('unauthorized')
  ) {
    const authError = new Error(
      `Anthropic API authentication failed. Cannot ${context}.\n` +
      `Please check your ANTHROPIC_API_KEY environment variable.\n` +
      `Get your API key from: https://console.anthropic.com/\n` +
      `Original error: ${errorMessage}`
    );
    (authError as any).isAuthError = true;
    (authError as any).statusCode = 401;
    throw authError;
  }

  // Generic error
  const apiError = new Error(
    `Failed to ${context}: ${errorMessage}`
  );
  (apiError as any).originalError = error;
  (apiError as any).statusCode = statusCode || 500;
  throw apiError;
}

export type Perspective = 'admin' | 'union';

export interface ChatResponse {
  answer: string;
  confidence: number;
  contractReferences: ContractReference[];
  perspective: Perspective;
  reasoning: string;
  warnings?: string[];
}

const PERSPECTIVE_PROMPTS = {
  admin: `You are a Claims Administrator for Copa Airlines. Your role is to:
- Ensure CBA compliance while managing costs
- Verify claims meet all requirements and deadlines
- Check for proper documentation and qualifications
- Apply rules consistently and fairly
- Protect the company from invalid claims while honoring valid ones

When answering questions:
- Focus on eligibility requirements and deadlines
- Emphasize documentation needs
- Highlight compliance rules
- Be precise about what qualifies and what doesn't
- Reference specific CBA sections
- Consider the cost implications
- Ensure fairness but err on the side of caution`,

  union: `You are a Union Representative for Copa Airlines crew members. Your role is to:
- Protect crew member rights under the CBA
- Ensure crew receive all entitled benefits and premiums
- Advocate for correct interpretation of contract language
- Help crew understand their rights
- Challenge incorrect claim denials

When answering questions:
- Focus on crew member entitlements
- Explain rights clearly and comprehensively
- Interpret contract language in favor of workers when ambiguous
- Highlight all applicable premiums and benefits
- Reference specific CBA sections
- Emphasize what crew members are entitled to
- Ensure they don't miss any benefits`,
};

/**
 * Search for relevant contract sections based on question
 */
async function searchRelevantSections(question: string, limit: number = 5): Promise<ContractReference[]> {
  try {
    // Ensure limit is an integer (Neo4j requires integer for LIMIT)
    const limitInt = Math.floor(limit);
    
    // Extract keywords from question
    const keywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 5);

    // Search Neo4j for relevant sections
    const sections: ContractReference[] = [];

    for (const keyword of keywords) {
      const results = await executeReadQuery<{
        reference: string;
        title: string;
        text: string;
        relevance: number;
        accuracy: number;
      }>(`
        MATCH (s:ContractSection)
        WHERE
          toLower(s.text) CONTAINS toLower($keyword)
          OR toLower(s.title) CONTAINS toLower($keyword)
          OR toLower(s.reference) CONTAINS toLower($keyword)
        RETURN
          s.reference as reference,
          s.title as title,
          s.text as text,
          s.relevance as relevance,
          s.accuracy as accuracy
        ORDER BY s.relevance DESC, s.accuracy DESC
        LIMIT $limit
      `, { keyword, limit: limitInt });

      sections.push(...results.map((r) => ({
        section: r.reference,
        title: r.title,
        text: r.text,
        relevance: r.relevance || 1.0,
      })));
    }

    // Deduplicate and sort by relevance
    const uniqueSections = Array.from(
      new Map(sections.map((s) => [s.section, s])).values()
    ).slice(0, limitInt);

    return uniqueSections;
  } catch (error) {
    console.error('Error searching contract sections:', error);
    return [];
  }
}

/**
 * Generate answer from specific perspective using RAG
 */
export async function askQuestion(
  question: string,
  perspective: Perspective,
  claimContext?: any
): Promise<ChatResponse> {
  console.log(`💬 Answering from ${perspective} perspective: "${question}"`);

  // Step 1: Retrieve relevant contract sections
  const relevantSections = await searchRelevantSections(question, 5);

  if (relevantSections.length === 0) {
    return {
      answer: "I couldn't find any relevant contract sections to answer this question. Please ensure the question relates to the CBA contract, or consider uploading more contract documents.",
      confidence: 0,
      contractReferences: [],
      perspective,
      reasoning: 'No relevant contract sections found in knowledge graph',
      warnings: ['Knowledge graph may be incomplete'],
    };
  }

  // Step 2: Build context from contract sections
  const context = relevantSections
    .map((section) => {
      return `${section.section} - ${section.title}\n${section.text}`;
    })
    .join('\n\n---\n\n');

  // Step 3: Build prompt with perspective
  const systemPrompt = PERSPECTIVE_PROMPTS[perspective];

  const userPrompt = `Question: ${question}

${claimContext ? `Claim Context:\n${JSON.stringify(claimContext, null, 2)}\n\n` : ''}Relevant CBA Contract Sections:

${context}

Please provide a detailed answer from your perspective as a ${perspective === 'admin' ? 'Claims Administrator' : 'Union Representative'}.

Your response must include:
1. A clear, direct answer to the question
2. Your reasoning based on the contract sections
3. Specific references to CBA sections
4. Any warnings or considerations
5. Your confidence level (0-1) in this answer

Format your response as JSON:
{
  "answer": "Your detailed answer here...",
  "reasoning": "Why you reached this conclusion...",
  "confidence": 0.95,
  "warnings": ["Any warnings or considerations"],
  "referencedSections": ["Section 12.4", "Section 11.5"]
}`;

  // Check API key before making request
  if (!isAnthropicApiKeyConfigured()) {
    return {
      answer: "I'm unable to process your question because the Anthropic API key is not configured. Please contact your administrator to set up the ANTHROPIC_API_KEY environment variable.",
      confidence: 0,
      contractReferences: relevantSections,
      perspective,
      reasoning: 'Anthropic API key not configured',
      warnings: ['ANTHROPIC_API_KEY is missing. Get your API key from https://console.anthropic.com/'],
    };
  }

  try {
    // Step 4: Get Claude's response
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Step 5: Build final response
    const response: ChatResponse = {
      answer: parsed.answer,
      confidence: parsed.confidence || 0.7,
      contractReferences: relevantSections,
      perspective,
      reasoning: parsed.reasoning,
      warnings: parsed.warnings || [],
    };

    console.log(`✅ Generated ${perspective} response with confidence ${response.confidence}`);

    return response;
  } catch (error) {
    console.error('Error generating answer:', error);
    
    // Handle Anthropic API errors gracefully
    try {
      handleAnthropicError(error, 'generate answer');
    } catch (handledError: any) {
      // Return a user-friendly error response instead of throwing
      return {
        answer: `I encountered an issue while processing your question. ${handledError.message}`,
        confidence: 0,
        contractReferences: relevantSections,
        perspective,
        reasoning: 'Error occurred during AI processing',
        warnings: [
          handledError.isConfigError && 'ANTHROPIC_API_KEY is not configured',
          handledError.isCreditError && 'Anthropic account has insufficient credits',
          handledError.isAuthError && 'Anthropic API authentication failed',
        ].filter(Boolean) as string[],
      };
    }
    
    // Fallback error
    throw new Error('Failed to generate answer');
  }
}

/**
 * Get answers from BOTH perspectives and compare
 */
export async function askBothPerspectives(
  question: string,
  claimContext?: any
): Promise<{
  admin: ChatResponse;
  union: ChatResponse;
  disagreement: boolean;
  disagreementAnalysis?: string;
}> {
  console.log('🔄 Getting answers from both perspectives...');

  // Get both answers in parallel
  const [adminResponse, unionResponse] = await Promise.all([
    askQuestion(question, 'admin', claimContext),
    askQuestion(question, 'union', claimContext),
  ]);

  // Analyze disagreement using Claude
  const disagreement = await analyzeDisagreement(question, adminResponse, unionResponse);

  return {
    admin: adminResponse,
    union: unionResponse,
    disagreement: disagreement.hasDisagreement,
    disagreementAnalysis: disagreement.analysis,
  };
}

/**
 * Analyze if admin and union responses disagree
 */
async function analyzeDisagreement(
  question: string,
  adminResponse: ChatResponse,
  unionResponse: ChatResponse
): Promise<{ hasDisagreement: boolean; analysis?: string }> {
  const prompt = `Analyze these two responses to the same CBA contract question and determine if they disagree.

Question: ${question}

Claims Administrator Response:
${adminResponse.answer}

Union Representative Response:
${unionResponse.answer}

Do these responses disagree on the interpretation or outcome? Consider:
- Do they reach different conclusions about eligibility?
- Do they interpret contract language differently?
- Do they emphasize different requirements?
- Would following each answer lead to different outcomes?

Return JSON:
{
  "hasDisagreement": true/false,
  "analysis": "Explanation of the disagreement or agreement",
  "severity": "minor" | "moderate" | "major"
}`;

  // Check API key before making request
  if (!isAnthropicApiKeyConfigured()) {
    console.warn('Anthropic API key not configured, skipping disagreement analysis');
    return { hasDisagreement: false };
  }

  try {
    const anthropic = getAnthropicClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return { hasDisagreement: false };
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { hasDisagreement: false };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      hasDisagreement: parsed.hasDisagreement,
      analysis: parsed.analysis,
    };
  } catch (error) {
    console.error('Error analyzing disagreement:', error);
    // Don't throw - just return no disagreement if analysis fails
    // This allows the system to continue functioning even if disagreement analysis fails
    return { hasDisagreement: false };
  }
}

/**
 * Update contract section based on validation feedback
 */
export async function updateSectionFromFeedback(
  sectionRef: string,
  feedback: {
    isCorrect: boolean;
    suggestedText?: string;
    comments?: string;
  }
): Promise<void> {
  try {
    if (feedback.isCorrect) {
      // Increase accuracy and validation count
      await executeReadQuery(`
        MATCH (s:ContractSection {reference: $sectionRef})
        SET s.accuracy = CASE
          WHEN s.accuracy IS NULL THEN 0.7
          ELSE s.accuracy + 0.05
        END,
        s.validationCount = COALESCE(s.validationCount, 0) + 1,
        s.lastValidated = timestamp()
        RETURN s
      `, { sectionRef });
    } else {
      // Decrease accuracy
      await executeReadQuery(`
        MATCH (s:ContractSection {reference: $sectionRef})
        SET s.accuracy = CASE
          WHEN s.accuracy IS NULL THEN 0.3
          ELSE s.accuracy - 0.1
        END,
        s.validationCount = COALESCE(s.validationCount, 0) + 1,
        s.lastValidated = timestamp()
        RETURN s
      `, { sectionRef });

      // If suggested text provided, create a revision node
      if (feedback.suggestedText) {
        await executeReadQuery(`
          MATCH (s:ContractSection {reference: $sectionRef})
          CREATE (r:Revision {
            id: randomUUID(),
            originalText: s.text,
            suggestedText: $suggestedText,
            comments: $comments,
            createdAt: timestamp(),
            status: 'pending'
          })
          CREATE (s)-[:HAS_REVISION]->(r)
          RETURN r
        `, {
          sectionRef,
          suggestedText: feedback.suggestedText,
          comments: feedback.comments || '',
        });
      }
    }

    console.log(`✅ Updated section ${sectionRef} based on feedback`);
  } catch (error) {
    console.error('Error updating section from feedback:', error);
    throw new Error('Failed to update section');
  }
}
