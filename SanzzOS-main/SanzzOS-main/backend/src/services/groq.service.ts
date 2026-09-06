import { env } from '../config/env.js';

export interface MessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GroqServiceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'groq_error') {
    super(message);
    this.name = 'GroqServiceError';
    this.status = status;
    this.code = code;
  }
}

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
export const LEGACY_GROQ_MODEL = 'llama-3.1-8b-instant';
export const LARGE_FALLBACK_GROQ_MODEL = 'llama-3.3-70b-versatile';

const PRIMARY_MODEL = env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL;
const FALLBACK_MODELS = [LEGACY_GROQ_MODEL, LARGE_FALLBACK_GROQ_MODEL].filter((model) => model !== PRIMARY_MODEL);
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

async function requestChatCompletion(messages: MessagePayload[], model: string, stream = false): Promise<Response> {
  const apiKey = env.GROQ_API_KEY?.trim().replace(/^Bearer\s+/i, '');
  if (!apiKey) {
    throw new GroqServiceError('Groq API key is missing in backend/.env.', 503, 'missing_groq_api_key');
  }

  try {
    return await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 700,
        temperature: 0.7,
        ...(stream ? { stream: true } : {})
      })
    });
  } catch (error: any) {
    throw new GroqServiceError(error?.message || 'Network error while contacting Groq.', 503, 'groq_network_error');
  }
}

function isRetryableGroqStatus(status: number): boolean {
  return status === 400 || status === 404 || status === 422 || status >= 500;
}

async function readGroqErrorMessage(response: Response): Promise<string> {
  const raw = await response.text();

  try {
    const parsed = JSON.parse(raw);
    return parsed?.error?.message || parsed?.error || parsed?.message || raw || `Groq returned status ${response.status}.`;
  } catch {
    return raw || `Groq returned status ${response.status}.`;
  }
}

export async function getGroqChatCompletion(messages: MessagePayload[]): Promise<{ reply: string; model: string; usage: any }> {
  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let lastError: GroqServiceError | null = null;

  for (const model of modelsToTry) {
    const response = await requestChatCompletion(messages, model);
    if (!response.ok) {
      if (response.status === 401) {
        throw new GroqServiceError('Groq rejected the API key. Check backend/.env and create a fresh Groq key.', 401, 'invalid_groq_api_key');
      }
      if (response.status === 429) {
        throw new GroqServiceError('Groq rate limit or quota reached. Try again later.', 429, 'groq_rate_limited');
      }

      const errorText = await readGroqErrorMessage(response);
      lastError = new GroqServiceError(errorText || `Groq returned status ${response.status}.`, response.status, 'groq_upstream_error');
      if (!isRetryableGroqStatus(response.status) || model === modelsToTry[modelsToTry.length - 1]) {
        break;
      }
      continue;
    }

    const data: any = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    if (!reply.trim()) {
      throw new GroqServiceError('Groq returned an empty response.', 502, 'groq_empty_response');
    }
    const resolvedModel = data.model || model;
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      reply,
      model: resolvedModel,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      }
    };
  }

  throw lastError || new GroqServiceError('Groq returned an unexpected error.', 502, 'groq_upstream_error');
}

export async function getGroqChatStream(messages: MessagePayload[], onToken: (token: string) => void): Promise<void> {
  const response = await requestChatCompletion(messages, PRIMARY_MODEL, true);
  if (!response.ok) {
    if (response.status === 401) {
      throw new GroqServiceError('Groq rejected the API key. Check backend/.env and create a fresh Groq key.', 401, 'invalid_groq_api_key');
    }
    if (response.status === 429) {
      throw new GroqServiceError('Groq rate limit or quota reached. Try again later.', 429, 'groq_rate_limited');
    }
    if (isRetryableGroqStatus(response.status)) {
      let lastError: GroqServiceError | null = null;
      for (const fallbackModel of FALLBACK_MODELS) {
        const fallbackResponse = await requestChatCompletion(messages, fallbackModel, true);
        if (!fallbackResponse.ok) {
          const errorText = await readGroqErrorMessage(fallbackResponse);
          lastError = new GroqServiceError(errorText || `Groq streaming returned status ${fallbackResponse.status}.`, fallbackResponse.status, 'groq_upstream_error');
          continue;
        }
        await consumeGroqStream(fallbackResponse, onToken);
        return;
      }
      throw lastError || new GroqServiceError('Groq streaming fallback failed.', 502, 'groq_upstream_error');
    }
    const errorText = await readGroqErrorMessage(response);
    throw new GroqServiceError(errorText || `Groq streaming returned status ${response.status}.`, response.status, 'groq_upstream_error');
  }

  await consumeGroqStream(response, onToken);
}

async function consumeGroqStream(response: Response, onToken: (token: string) => void): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to initialize completions stream reader.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === 'data: [DONE]') continue;

      if (trimmed.startsWith('data: ')) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const chunk = parsed.choices?.[0]?.delta?.content || '';
          if (chunk) {
            onToken(chunk);
          }
        } catch {
          // Ignore parsing errors for incomplete stream lines
        }
      }
    }
  }
}
