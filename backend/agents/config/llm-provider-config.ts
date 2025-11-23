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
  provider: 'anthropic' | 'openai' | 'google' | 'xai' | 'native';
  model: string;
  apiKey?: string;
  reasoning: string;
  cost: string;
  avgLatency: string;
}

export const AGENT_LLM_MAPPING: Record<string, LLMProviderConfig> = {
  'flight-time-calculator': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    reasoning: 'Structured calculations, fast inference, cost-effective for simple arithmetic logic',
    cost: '$0.15 per 1M tokens (input), $0.60 per 1M tokens (output)',
    avgLatency: '2-3 seconds'
  },

  'premium-pay-calculator': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    reasoning: 'Complex contract interpretation, multi-step reasoning, excellent for nuanced premium pay rules',
    cost: '$3 per 1M tokens (input), $15 per 1M tokens (output)',
    avgLatency: '5-8 seconds'
  },

  'compliance-validator': {
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    reasoning: 'Most powerful reasoning for ambiguous legal clauses, highest accuracy for CBA compliance',
    cost: '$15 per 1M tokens (input), $75 per 1M tokens (output)',
    avgLatency: '8-12 seconds'
  },

  'orchestrator': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    reasoning: 'Coordinates agent execution, synthesizes results, makes final decisions',
    cost: '$3 per 1M tokens (input), $15 per 1M tokens (output)',
    avgLatency: '3-5 seconds'
  },

  // Future agents that might use other providers
  'dispute-resolution': {
    provider: 'google',
    model: 'gemini-2.0-flash-exp',
    reasoning: 'Fast multimodal reasoning for document analysis and dispute resolution',
    cost: 'Free tier available, then $0.075 per 1M tokens',
    avgLatency: '2-4 seconds'
  },

  'schedule-optimizer': {
    provider: 'xai',
    model: 'grok-beta',
    reasoning: 'Real-time reasoning and optimization for dynamic scheduling',
    cost: 'Beta pricing TBD',
    avgLatency: '3-6 seconds'
  },

  'basic-eligibility': {
    provider: 'native',
    model: 'rules-engine',
    reasoning: 'Simple if/then logic, deterministic, no AI needed, instant results',
    cost: '$0 (native code)',
    avgLatency: '<100ms'
  }
};

/**
 * Get LLM configuration for a specific agent
 */
export function getLLMConfig(agentType: string): LLMProviderConfig {
  const config = AGENT_LLM_MAPPING[agentType];

  if (!config) {
    // Default to Claude Sonnet if agent not found
    return AGENT_LLM_MAPPING['orchestrator'];
  }

  // Add API key from environment
  switch (config.provider) {
    case 'anthropic':
      config.apiKey = process.env.ANTHROPIC_API_KEY;
      break;
    case 'openai':
      config.apiKey = process.env.OPENAI_API_KEY;
      break;
    case 'google':
      config.apiKey = process.env.GOOGLE_API_KEY;
      break;
    case 'xai':
      config.apiKey = process.env.XAI_API_KEY;
      break;
    default:
      config.apiKey = undefined;
  }

  return config;
}

/**
 * Technology selection rationale for different problem types
 */
export const TECHNOLOGY_SELECTION_RATIONALE = {
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
    '1. Try rules engine first (free, instant)',
    '2. Use GPT-4o-mini for structured tasks (20x cheaper than Opus)',
    '3. Use Claude Sonnet for balanced reasoning (5x cheaper than Opus)',
    '4. Reserve Opus only for critical legal/compliance analysis',
    '5. Monitor costs and adjust routing logic'
  ],
  estimatedSavings: 'Up to 90% cost reduction vs using Opus for everything'
};
