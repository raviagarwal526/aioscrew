/**
 * Multi-LLM Provider Configuration
 *
 * This configuration maps each agent to the optimal LLM provider.
 * Different problems require different technologies:
 * - Simple calculations → GPT-4o-mini (fast, cheap)
 * - Complex reasoning → Claude Sonnet 4.5 (balanced)
 * - Legal/contract analysis → Claude Opus (most powerful)
 * - Deterministic logic → Rules engine (no LLM needed)
 */

export interface LLMProviderConfig {
  provider: 'anthropic' | 'openai' | 'google' | 'xai' | 'native' | 'ollama';
  model: string;
  apiKey?: string;
  reasoning: string;
  cost: string;
  avgLatency: string;
  priority?: number; // Lower number = higher priority (0 = highest)
}

export const AGENT_LLM_MAPPING: Record<string, LLMProviderConfig[]> = {
  'flight-time-calculator': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference on your GPU - no API costs',
      cost: '$0 (local GPU)',
      avgLatency: '1-3 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      reasoning: 'Structured calculations, fast inference, cost-effective for simple arithmetic logic',
      cost: '$0.15 per 1M tokens (input), $0.60 per 1M tokens (output)',
      avgLatency: '2-3 seconds',
      priority: 1
    }
  ],

  'premium-pay-calculator': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference - try local first to save costs',
      cost: '$0 (local GPU)',
      avgLatency: '2-4 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      reasoning: 'Complex contract interpretation, multi-step reasoning, excellent for nuanced premium pay rules',
      cost: '$3 per 1M tokens (input), $15 per 1M tokens (output)',
      avgLatency: '5-8 seconds',
      priority: 1
    }
  ],

  'compliance-validator': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference - for non-critical validation',
      cost: '$0 (local GPU)',
      avgLatency: '2-4 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'anthropic',
      model: 'claude-opus-4-20250514',
      reasoning: 'Most powerful reasoning for ambiguous legal clauses, highest accuracy for CBA compliance',
      cost: '$15 per 1M tokens (input), $75 per 1M tokens (output)',
      avgLatency: '8-12 seconds',
      priority: 1
    }
  ],

  'orchestrator': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference for coordination tasks',
      cost: '$0 (local GPU)',
      avgLatency: '1-3 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      reasoning: 'Coordinates agent execution, synthesizes results, makes final decisions',
      cost: '$3 per 1M tokens (input), $15 per 1M tokens (output)',
      avgLatency: '3-5 seconds',
      priority: 1
    }
  ],

  // Test data generation - ALWAYS use local Ollama to save costs
  'test-data-generator': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference - PERFECT for generating test data without API costs',
      cost: '$0 (local GPU)',
      avgLatency: '2-5 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'anthropic',
      model: 'claude-sonnet-4-5-20250929',
      reasoning: 'Paid cloud option when Ollama is not available or you need faster throughput',
      cost: '$3 per 1M tokens (input), $15 per 1M tokens (output)',
      avgLatency: '5-7 seconds',
      priority: 1
    },
    {
      provider: 'anthropic',
      model: 'claude-opus-4-20250514',
      reasoning: 'Highest-fidelity paid option for massive synthetic data blueprints',
      cost: '$15 per 1M tokens (input), $75 per 1M tokens (output)',
      avgLatency: '9-12 seconds',
      priority: 2
    }
  ],

  // Future agents that might use other providers
  'dispute-resolution': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference for document analysis',
      cost: '$0 (local GPU)',
      avgLatency: '2-4 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'google',
      model: 'gemini-2.0-flash-exp',
      reasoning: 'Fast multimodal reasoning for document analysis and dispute resolution',
      cost: 'Free tier available, then $0.075 per 1M tokens',
      avgLatency: '2-4 seconds',
      priority: 1
    }
  ],

  'schedule-optimizer': [
    {
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:latest',
      reasoning: 'FREE local inference for scheduling optimization',
      cost: '$0 (local GPU)',
      avgLatency: '2-4 seconds (with GPU)',
      priority: 0
    },
    {
      provider: 'xai',
      model: 'grok-beta',
      reasoning: 'Real-time reasoning and optimization for dynamic scheduling',
      cost: 'Beta pricing TBD',
      avgLatency: '3-6 seconds',
      priority: 1
    }
  ],

  'basic-eligibility': [
    {
      provider: 'native',
      model: 'rules-engine',
      reasoning: 'Simple if/then logic, deterministic, no AI needed, instant results',
      cost: '$0 (native code)',
      avgLatency: '<100ms',
      priority: 0
    }
  ]
};

/**
 * Get LLM configuration for a specific agent
 * Returns array of configs sorted by priority (Ollama first if available)
 */
export function getLLMConfigs(agentType: string): LLMProviderConfig[] {
  const configs = AGENT_LLM_MAPPING[agentType];

  if (!configs) {
    // Default to orchestrator configs if agent not found
    return AGENT_LLM_MAPPING['orchestrator'];
  }

  // Add API keys from environment and sort by priority
  return configs
    .map(config => {
      const configCopy = { ...config };

      switch (configCopy.provider) {
        case 'anthropic':
          configCopy.apiKey = process.env.ANTHROPIC_API_KEY;
          break;
        case 'openai':
          configCopy.apiKey = process.env.OPENAI_API_KEY;
          break;
        case 'google':
          configCopy.apiKey = process.env.GOOGLE_API_KEY;
          break;
        case 'xai':
          configCopy.apiKey = process.env.XAI_API_KEY;
          break;
        case 'ollama':
          // Ollama doesn't need an API key
          configCopy.apiKey = undefined;
          break;
        default:
          configCopy.apiKey = undefined;
      }

      return configCopy;
    })
    .sort((a, b) => (a.priority || 99) - (b.priority || 99));
}

/**
 * Get single best LLM configuration (for backward compatibility)
 */
export function getLLMConfig(agentType: string): LLMProviderConfig {
  const configs = getLLMConfigs(agentType);
  return configs[0]; // Return highest priority config
}

/**
 * Technology selection rationale for different problem types
 */
export const TECHNOLOGY_SELECTION_RATIONALE = {
  'When to use Ollama (Local LLM)': [
    '🎯 ALWAYS TRY FIRST - Free local inference',
    'Test data generation (bulk operations)',
    'Development and testing environments',
    'Any task where you have GPU available',
    'Privacy-sensitive data processing',
    'Cost-conscious operations',
    'Fallback automatically to cloud if quality insufficient'
  ],

  'When to use GPT-4o-mini': [
    'Structured data processing',
    'Simple arithmetic calculations',
    'JSON parsing and generation',
    'Template-based responses',
    'High-volume, low-complexity tasks'
  ],

  'When to use Claude Sonnet': [
    'Multi-step reasoning',
    'Contract interpretation',
    'Nuanced decision making',
    'Balanced cost/performance',
    'Most general-purpose tasks'
  ],

  'When to use Claude Opus': [
    'Complex legal analysis',
    'Ambiguous clause interpretation',
    'Critical compliance decisions',
    'High-stakes accuracy required',
    'Maximum reasoning capability needed'
  ],

  'When to use Gemini': [
    'Multimodal inputs (images, PDFs)',
    'Fast experimental features',
    'Cost-sensitive applications',
    'Google workspace integration'
  ],

  'When to use Grok': [
    'Real-time data processing',
    'X/Twitter data integration',
    'Experimental cutting-edge features'
  ],

  'When to use Rules Engine': [
    'Deterministic logic',
    'No hallucination tolerance',
    'Sub-second latency required',
    'Simple if/then conditions',
    'Zero cost requirement'
  ]
};

/**
 * Cost optimization strategy
 */
export const COST_OPTIMIZATION = {
  principle: 'Use the cheapest technology that meets accuracy requirements',
  strategy: [
    '0. 🚀 TRY OLLAMA FIRST - 100% FREE local GPU inference (unlimited usage)',
    '1. Try rules engine for deterministic logic (free, instant)',
    '2. Use GPT-4o-mini for structured tasks (20x cheaper than Opus)',
    '3. Use Claude Sonnet for balanced reasoning (5x cheaper than Opus)',
    '4. Reserve Opus only for critical legal/compliance analysis',
    '5. Monitor costs and adjust routing logic'
  ],
  estimatedSavings: 'Up to 100% cost reduction with Ollama, or 90% with smart cloud routing',
  costWarnings: {
    testDataGeneration: '⚠️  CAUTION: Generating test data with cloud APIs can cost $10-100+ for large datasets. ALWAYS use Ollama for test data!',
    bulkOperations: '⚠️  WARNING: Bulk operations (>10 requests) should use Ollama first to avoid unexpected bills',
    opusUsage: '⚠️  EXPENSIVE: Claude Opus costs $15-75 per 1M tokens. Confirm before use.'
  }
};
