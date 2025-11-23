/**
 * Ollama API client wrapper for local LLM inference
 * Prioritize local GPU inference to save costs on cloud LLM APIs
 */

export interface OllamaCallOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface OllamaResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string;
}

/**
 * Check if Ollama is available locally
 */
export async function isOllamaAvailable(): Promise<boolean> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json() as { models?: Array<{ name: string }> };
    return data.models && Array.isArray(data.models) && data.models.length > 0;
  } catch (error) {
    // Ollama not running or not accessible
    return false;
  }
}

/**
 * Get available Ollama models
 */
export async function getOllamaModels(): Promise<string[]> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`);
    const data = await response.json() as { models?: Array<{ name: string }> };
    return data.models?.map((m) => m.name) || [];
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error);
    return [];
  }
}

/**
 * Call Ollama API with structured prompts
 */
export async function callOllama(options: OllamaCallOptions): Promise<OllamaResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.3,
    maxTokens = 2000,
    model = process.env.OLLAMA_MODEL || 'llama3.2:latest'
  } = options;

  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
        options: {
          temperature,
          num_predict: maxTokens,
        },
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API returned status ${response.status}`);
    }

    const data = await response.json() as {
      message?: { content?: string };
      prompt_eval_count?: number;
      eval_count?: number;
      done?: boolean;
    };

    // Extract the assistant's message
    const content = data.message?.content || '';

    // Ollama provides token counts in the response
    const promptTokens = data.prompt_eval_count || 0;
    const completionTokens = data.eval_count || 0;

    return {
      content,
      usage: {
        inputTokens: promptTokens,
        outputTokens: completionTokens
      },
      stopReason: data.done ? 'end_turn' : 'max_tokens'
    };
  } catch (error) {
    console.error('Ollama API error:', error);
    throw new Error(`Ollama API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Call Ollama with JSON output parsing
 */
export async function callOllamaWithJSON<T>(
  options: OllamaCallOptions
): Promise<{ data: T; raw: OllamaResponse }> {
  // Enhance system prompt to request JSON output
  const enhancedOptions = {
    ...options,
    systemPrompt: `${options.systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include any explanatory text before or after the JSON.`
  };

  const response = await callOllama(enhancedOptions);

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
    console.error('Failed to parse Ollama response as JSON:', response.content);
    throw new Error('Ollama response was not valid JSON');
  }
}
