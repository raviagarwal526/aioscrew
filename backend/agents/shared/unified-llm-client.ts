/**
 * Unified LLM Client
 *
 * Intelligently routes LLM calls between providers:
 * 1. Tries Ollama first (free local GPU)
 * 2. Falls back to cloud providers (Claude, OpenAI, etc.)
 * 3. Warns about expensive operations
 */

import { callOllama, isOllamaAvailable } from './ollama-client.js';
import { callClaude } from './claude-client.js';
import { getLLMConfigs, LLMProviderConfig, COST_OPTIMIZATION } from '../config/llm-provider-config.js';

export interface UnifiedLLMOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  agentType: string;
  forceProvider?: 'ollama' | 'anthropic' | 'openai';
  forceModel?: string;
  skipOllama?: boolean; // Skip Ollama and go straight to cloud
}

export interface UnifiedLLMResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
  provider: string; // Which provider was actually used
  model: string;
  estimatedCost?: string; // Cost estimate for cloud providers
}

// Cache Ollama availability check (check once per minute)
let ollamaAvailableCache: boolean | null = null;
let ollamaCheckTimestamp = 0;
const OLLAMA_CHECK_CACHE_MS = 60000; // 1 minute

async function checkOllamaAvailable(): Promise<boolean> {
  const now = Date.now();
  if (ollamaAvailableCache !== null && (now - ollamaCheckTimestamp) < OLLAMA_CHECK_CACHE_MS) {
    return ollamaAvailableCache;
  }

  ollamaAvailableCache = await isOllamaAvailable();
  ollamaCheckTimestamp = now;
  return ollamaAvailableCache;
}

/**
 * Estimate cost for cloud LLM calls
 */
function estimateCost(config: LLMProviderConfig, inputTokens: number, outputTokens: number): string {
  // Parse cost from config (e.g., "$3 per 1M tokens (input), $15 per 1M tokens (output)")
  const costMatch = config.cost.match(/\$(\d+(?:\.\d+)?)[^,]+\$(\d+(?:\.\d+)?)/);

  if (!costMatch) {
    return 'Cost unknown';
  }

  const inputCostPerM = parseFloat(costMatch[1]);
  const outputCostPerM = parseFloat(costMatch[2]);

  const inputCost = (inputTokens / 1_000_000) * inputCostPerM;
  const outputCost = (outputTokens / 1_000_000) * outputCostPerM;
  const totalCost = inputCost + outputCost;

  return `~$${totalCost.toFixed(4)}`;
}

/**
 * Log cost warning for expensive operations
 */
function logCostWarning(config: LLMProviderConfig, estimatedInputTokens: number): void {
  // Warn if using Opus or if estimated cost is significant
  if (config.model.includes('opus') || estimatedInputTokens > 10000) {
    const estimatedCost = estimateCost(config, estimatedInputTokens, estimatedInputTokens);
    console.warn(`\n⚠️  COST WARNING: Using ${config.provider}/${config.model}`);
    console.warn(`   Estimated cost: ${estimatedCost} (based on ~${estimatedInputTokens} tokens)`);
    console.warn(`   ${config.cost}`);

    if (config.model.includes('opus')) {
      console.warn(`   ${COST_OPTIMIZATION.costWarnings.opusUsage}`);
    }
  }
}

/**
 * Call unified LLM with automatic provider selection
 */
export async function callUnifiedLLM(options: UnifiedLLMOptions): Promise<UnifiedLLMResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens = 2000,
    agentType,
    forceProvider,
    forceModel,
    skipOllama = false
  } = options;

  // Get available providers sorted by priority
  const configs = getLLMConfigs(agentType);

  // Estimate input tokens for cost warnings
  const estimatedInputTokens = Math.ceil((systemPrompt.length + userPrompt.length) / 4);

  // Try each provider in priority order
  for (const config of configs) {
    // Skip if forced to specific provider
    if (forceProvider && config.provider !== forceProvider) {
      continue;
    }
    if (forceModel && config.model !== forceModel) {
      continue;
    }

    try {
      // Try Ollama first (priority 0)
      if (config.provider === 'ollama' && !skipOllama) {
        const ollamaAvailable = await checkOllamaAvailable();

        if (ollamaAvailable) {
          console.log(`💰 Using FREE local Ollama: ${config.model}`);

          const response = await callOllama({
            systemPrompt,
            userPrompt,
            temperature,
            maxTokens,
            model: config.model
          });

          return {
            ...response,
            provider: 'ollama',
            model: config.model,
            estimatedCost: '$0.00 (local)'
          };
        } else {
          console.log('ℹ️  Ollama not available, falling back to cloud provider...');
          continue;
        }
      }

      // Try Anthropic/Claude
      if (config.provider === 'anthropic') {
        if (!config.apiKey) {
          console.log(`⚠️  Skipping ${config.provider}: API key not configured`);
          continue;
        }

        logCostWarning(config, estimatedInputTokens);
        console.log(`☁️  Using cloud provider: ${config.provider}/${config.model}`);

        const response = await callClaude({
          systemPrompt,
          userPrompt,
          temperature,
          maxTokens,
          model: config.model
        });

        const cost = estimateCost(config, response.usage.inputTokens, response.usage.outputTokens);

        return {
          ...response,
          provider: 'anthropic',
          model: config.model,
          estimatedCost: cost
        };
      }

      // TODO: Add OpenAI, Google, xAI providers here

      // Native rules engine
      if (config.provider === 'native') {
        console.log('⚡ Using native rules engine (not LLM)');
        // Rules engine not implemented yet
        continue;
      }

    } catch (error) {
      console.error(`❌ Error with ${config.provider}/${config.model}:`, error);
      // Continue to next provider
      continue;
    }
  }

  throw new Error(`All LLM providers failed for agent type: ${agentType}`);
}

/**
 * Call unified LLM with JSON output parsing
 */
export async function callUnifiedLLMWithJSON<T>(
  options: UnifiedLLMOptions
): Promise<{ data: T; raw: UnifiedLLMResponse }> {
  // Enhance system prompt to request JSON output
  const enhancedOptions = {
    ...options,
    systemPrompt: `${options.systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`
  };

  const response = await callUnifiedLLM(enhancedOptions);

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
    console.error('Failed to parse LLM response as JSON:', response.content, error);
    throw new Error('LLM response was not valid JSON');
  }
}

/**
 * Warn before bulk operations that could be expensive
 */
export function warnBulkOperation(operationName: string, count: number): void {
  if (count > 10) {
    console.warn(`\n${COST_OPTIMIZATION.costWarnings.bulkOperations}`);
    console.warn(`   Operation: ${operationName}`);
    console.warn(`   Count: ${count} requests`);
    console.warn(`   💡 TIP: Ensure Ollama is running to avoid costs!\n`);
  }
}

/**
 * Warn before test data generation
 */
export function warnTestDataGeneration(recordCount: number): void {
  console.warn(`\n${COST_OPTIMIZATION.costWarnings.testDataGeneration}`);
  console.warn(`   Generating ${recordCount} test records`);
  console.warn(`   💡 TIP: Install Ollama and set OLLAMA_MODEL in .env\n`);
}
