/**
 * Unified LLM Client
 *
 * Intelligently routes LLM calls between providers:
 * 1. Tries cloud providers first (Claude, OpenAI, etc.) for best quality
 * 2. Falls back to Ollama (free local GPU) if cloud providers fail
 * 3. Warns about expensive operations
 */

import { callOllama, isOllamaAvailable } from './ollama-client.js';
import { callOnlineOllama, isOnlineOllamaAvailable } from './online-ollama-client.js';
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

// Cache online Ollama availability check
let onlineOllamaAvailableCache: boolean | null = null;
let onlineOllamaCheckTimestamp = 0;

async function checkOnlineOllamaAvailable(): Promise<boolean> {
  const now = Date.now();
  if (onlineOllamaAvailableCache !== null && (now - onlineOllamaCheckTimestamp) < OLLAMA_CHECK_CACHE_MS) {
    return onlineOllamaAvailableCache;
  }

  onlineOllamaAvailableCache = await isOnlineOllamaAvailable();
  onlineOllamaCheckTimestamp = now;
  return onlineOllamaAvailableCache;
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

  // Track which providers to skip (e.g., all Anthropic models after credit error)
  const skipProviders = new Set<string>();

  // Try each provider in priority order
  for (const config of configs) {
    // Skip providers marked for skipping
    const providerKey = `${config.provider}/${config.model}`;
    if (skipProviders.has(providerKey)) {
      continue;
    }
    // Skip if forced to specific provider
    if (forceProvider && config.provider !== forceProvider) {
      continue;
    }
    if (forceModel && config.model !== forceModel) {
      continue;
    }

    try {
      // Try Ollama as fallback (priority 99 - tried last)
      if (config.provider === 'ollama' && !skipOllama) {
        // First try local Ollama
        const ollamaAvailable = await checkOllamaAvailable();

        if (ollamaAvailable) {
          console.log(`💰 Using FREE local Ollama fallback: ${config.model}`);

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
        }

        // If local Ollama not available, try online Ollama services (Groq, etc.)
        const onlineOllamaAvailable = await checkOnlineOllamaAvailable();
        if (onlineOllamaAvailable) {
          console.log(`🌐 Local Ollama not available, trying FREE online Ollama service (Groq)...`);

          try {
            const response = await callOnlineOllama({
              systemPrompt,
              userPrompt,
              temperature,
              maxTokens,
              model: config.model,
              provider: 'auto'
            });

            return {
              content: response.content,
              usage: response.usage,
              stopReason: response.stopReason,
              provider: response.provider,
              model: response.model,
              estimatedCost: '$0.00 (free tier)'
            };
          } catch (onlineError) {
            console.warn('Online Ollama service failed:', onlineError);
            // Continue to next provider or throw if this was the last one
            continue;
          }
        }

        console.log('ℹ️  Local and online Ollama not available, all providers exhausted');
        continue;
      }

      // Try Anthropic/Claude
      if (config.provider === 'anthropic') {
        if (!config.apiKey) {
          console.log(`⚠️  Skipping ${config.provider}/${config.model}: API key not configured`);
          console.log(`   💡 TIP: Set ANTHROPIC_API_KEY environment variable to use Claude`);
          continue;
        }

        logCostWarning(config, estimatedInputTokens);
        console.log(`☁️  Using cloud provider: ${config.provider}/${config.model}`);

        try {
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
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Claude API call failed: ${errorMessage}`);
          
          // Check for specific error types using error flags
          if (error?.isConfigError) {
            console.error(`   ⚙️  Configuration error - ANTHROPIC_API_KEY is not set`);
            console.error(`   💡 TIP: Set ANTHROPIC_API_KEY environment variable to use Claude`);
          } else if (error?.isAuthError) {
            console.error(`   🔑 Authentication failed - check ANTHROPIC_API_KEY is valid`);
          } else if (error?.isCreditError) {
            console.error(`   💳 Insufficient API credits - check your Anthropic account balance`);
            console.error(`   💡 TIP: Add credits at https://console.anthropic.com/`);
          } else if (error?.isRateLimitError) {
            console.error(`   ⏱️  Rate limit exceeded - wait before retrying`);
          } else {
            // Fallback to message-based detection for backward compatibility
            if (errorMessage.includes('401') || errorMessage.includes('authentication')) {
              console.error(`   🔑 Authentication failed - check ANTHROPIC_API_KEY is valid`);
            } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
              console.error(`   ⏱️  Rate limit exceeded - wait before retrying`);
            } else if (errorMessage.includes('insufficient') || errorMessage.includes('credit')) {
              console.error(`   💳 Insufficient API credits - check your Anthropic account balance`);
            }
          }
          
          // Mark this provider to skip if it's a config/auth/credit error
          if (error?.isConfigError || error?.isAuthError || error?.isCreditError) {
            skipProviders.add(`${config.provider}/${config.model}`);
            // Also skip all other Anthropic models
            for (const remainingConfig of configs) {
              if (remainingConfig.provider === 'anthropic') {
                skipProviders.add(`${remainingConfig.provider}/${remainingConfig.model}`);
              }
            }
          }
          
          // Continue to next provider
          continue;
        }
      }

      // Skip unimplemented providers
      if (['openai', 'google', 'xai'].includes(config.provider)) {
        console.log(`⚠️  Skipping ${config.provider}/${config.model}: Provider not yet implemented`);
        continue;
      }

      // Native rules engine
      if (config.provider === 'native') {
        console.log('⚡ Using native rules engine (not LLM)');
        // Rules engine not implemented yet
        continue;
      }

      // If we reach here, provider is not recognized
      console.warn(`⚠️  Unknown provider: ${config.provider}/${config.model}, skipping...`);
      continue;

    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // Check if this is a credit balance error - don't retry other Anthropic models
      if (error?.isCreditError) {
        console.error(`❌ Credit balance error with ${config.provider}/${config.model}: ${errorMessage}`);
        console.warn(`⚠️  Skipping remaining Anthropic models due to credit balance issue`);
        // Mark all remaining Anthropic providers to skip
        for (const remainingConfig of configs) {
          if (remainingConfig.provider === 'anthropic') {
            skipProviders.add(`${remainingConfig.provider}/${remainingConfig.model}`);
          }
        }
        continue;
      }
      
      // Check if this is an auth error - don't retry other Anthropic models
      if (error?.isAuthError) {
        console.error(`❌ Authentication error with ${config.provider}/${config.model}: ${errorMessage}`);
        console.warn(`⚠️  Skipping remaining Anthropic models due to authentication issue`);
        // Mark all remaining Anthropic providers to skip
        for (const remainingConfig of configs) {
          if (remainingConfig.provider === 'anthropic') {
            skipProviders.add(`${remainingConfig.provider}/${remainingConfig.model}`);
          }
        }
        continue;
      }
      
      console.error(`❌ Error with ${config.provider}/${config.model}:`, error);
      // Continue to next provider
      continue;
    }
  }

  // Build list of attempted providers for better error message (excluding skipped ones)
  const attemptedProviders = configs
    .filter(c => !skipProviders.has(`${c.provider}/${c.model}`))
    .map(c => `${c.provider}/${c.model}`)
    .join(', ');
  
  // Check if we have any credit/auth errors (check if any Anthropic providers were attempted)
  const hasCreditError = configs.some(c => c.provider === 'anthropic' && !skipProviders.has(`${c.provider}/${c.model}`));
  
  let errorMessage = `All LLM providers failed for agent type: ${agentType}. Attempted: ${attemptedProviders}`;
  
  if (hasCreditError) {
    errorMessage += '\n\n💡 SUGGESTIONS:';
    errorMessage += '\n   1. Add credits to your Anthropic account at https://console.anthropic.com/';
    errorMessage += '\n   2. Set up Ollama locally for free local inference (see OLLAMA_SETUP.md)';
    errorMessage += '\n   3. Get a FREE Groq API key for online Ollama fallback: https://console.groq.com/';
    errorMessage += '\n   4. Check your ANTHROPIC_API_KEY environment variable';
  } else {
    errorMessage += '\n\n💡 SUGGESTIONS:';
    errorMessage += '\n   1. Set up Ollama locally for free local inference (see OLLAMA_SETUP.md)';
    errorMessage += '\n   2. Get a FREE Groq API key for online Ollama fallback: https://console.groq.com/';
    errorMessage += '\n   3. Check your API keys and provider configurations';
    errorMessage += '\n   4. Online Ollama (Groq) will automatically be used when local Ollama is not available';
  }
  
  const finalError = new Error(errorMessage);
  (finalError as any).allProvidersFailed = true;
  (finalError as any).attemptedProviders = attemptedProviders;
  throw finalError;
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
