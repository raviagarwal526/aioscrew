/**
 * Online Ollama-Compatible Services Client
 * Provides free/cheap online alternatives when local Ollama is not available
 * Supports Groq (fast, free tier) and other compatible services
 */

export interface OnlineOllamaCallOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  provider?: 'groq' | 'auto'; // 'auto' tries providers in order
}

export interface OnlineOllamaResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
  provider: string;
  model: string;
}

/**
 * Check if Groq API key is configured
 */
function isGroqApiKeyConfigured(): boolean {
  const apiKey = process.env.GROQ_API_KEY;
  return !!apiKey && apiKey.trim().length > 0;
}

/**
 * Call Groq API (fast, free tier available)
 * Groq supports many open-source models including Llama 3.2
 */
async function callGroq(options: OnlineOllamaCallOptions): Promise<OnlineOllamaResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens = 2000,
    model = process.env.GROQ_MODEL || 'llama-3.2-90b-text-preview' // Free tier model
  } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
      const errorMessage = errorData.error?.message || `Groq API returned status ${response.status}`;
      
      if (response.status === 401) {
        throw new Error(`Groq API authentication failed: ${errorMessage}`);
      }
      if (response.status === 429) {
        throw new Error(`Groq API rate limit exceeded: ${errorMessage}`);
      }
      throw new Error(`Groq API error: ${errorMessage}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const content = data.choices?.[0]?.message?.content || '';
    const finishReason = data.choices?.[0]?.finish_reason || 'stop';

    return {
      content,
      usage: {
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0
      },
      stopReason: finishReason === 'stop' ? 'end_turn' : finishReason,
      provider: 'groq',
      model
    };
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error(`Groq API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if any online Ollama service is available
 */
export async function isOnlineOllamaAvailable(): Promise<boolean> {
  // Check if Groq is configured (most common free option)
  if (isGroqApiKeyConfigured()) {
    return true;
  }
  
  // Could add checks for other services here
  return false;
}

/**
 * Call online Ollama-compatible service
 * Tries providers in order: Groq, then others
 */
export async function callOnlineOllama(options: OnlineOllamaCallOptions): Promise<OnlineOllamaResponse> {
  const provider = options.provider || 'auto';

  // Try Groq first (fast, free tier)
  if (provider === 'auto' || provider === 'groq') {
    if (isGroqApiKeyConfigured()) {
      try {
        console.log('🌐 Trying Groq (free online Ollama alternative)...');
        return await callGroq(options);
      } catch (error) {
        console.warn('Groq failed, trying other providers...', error);
        if (provider === 'groq') {
          throw error; // If explicitly requested Groq, throw the error
        }
        // Otherwise continue to try other providers
      }
    } else if (provider === 'groq') {
      throw new Error('GROQ_API_KEY is not configured. Get a free API key from https://console.groq.com/');
    }
  }

  // Could add other providers here (Hugging Face, Replicate, etc.)
  
  throw new Error('No online Ollama service available. Please configure GROQ_API_KEY (free at https://console.groq.com/) or set up local Ollama.');
}

/**
 * Call online Ollama with JSON output parsing
 */
export async function callOnlineOllamaWithJSON<T>(
  options: OnlineOllamaCallOptions
): Promise<{ data: T; raw: OnlineOllamaResponse }> {
  // Enhance system prompt to request JSON output
  const enhancedOptions = {
    ...options,
    systemPrompt: `${options.systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`
  };

  const response = await callOnlineOllama(enhancedOptions);

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
    console.error('Failed to parse online Ollama response as JSON:', response.content);
    throw new Error('Online Ollama response was not valid JSON');
  }
}
