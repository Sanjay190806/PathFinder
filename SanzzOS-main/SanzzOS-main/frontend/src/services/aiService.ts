import { request, ApiError } from './apiClient';
import { AIMessage } from '../types';
import { useAISettingsStore } from '../app/store/useAISettingsStore';

const MAX_AI_MESSAGES = 8;
const MAX_AI_MESSAGE_CHARS = 2000;
const MAX_CONTEXT_STRING_CHARS = 600;
const MAX_CONTEXT_ARRAY_ITEMS = 8;
const MAX_CONTEXT_DEPTH = 3;

const trimForAI = (value: string, maxChars: number): string => {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 12)).trimEnd()}...[trimmed]`;
};

export interface NormalizedAIResponse {
  content: string;
  providerUsed?: string;
  modelUsed?: string;
  fallbackUsed?: boolean;
  latencyMs?: number;
}

export function normalizeAIResponse(raw: any): NormalizedAIResponse {
  if (!raw) {
    throw new Error('Shayla returned an empty response.');
  }

  let content = '';
  if (typeof raw.reply === 'string') content = raw.reply;
  else if (typeof raw.content === 'string') content = raw.content;
  else if (raw.message && typeof raw.message.content === 'string') content = raw.message.content;
  else if (raw.data && typeof raw.data.reply === 'string') content = raw.data.reply;
  else if (raw.data && raw.data.message && typeof raw.data.message.content === 'string') content = raw.data.message.content;

  if (!content) {
    throw new Error('Shayla returned an empty response.');
  }

  return {
    content,
    providerUsed: raw.metadata?.providerUsed || raw.provider || raw.providerUsed,
    modelUsed: raw.metadata?.modelUsed || raw.model || raw.modelUsed,
    fallbackUsed: raw.metadata?.fallbackUsed || raw.fallbackUsed,
    latencyMs: raw.metadata?.latencyMs || raw.latencyMs
  };
}

export function parseStreamChunk(line: string): string {
  const trimmed = line.trim();
  if (!trimmed) return '';
  if (trimmed === 'data: [DONE]' || trimmed === '[DONE]') return '';

  let dataStr = trimmed;
  if (trimmed.startsWith('data: ')) {
    dataStr = trimmed.slice(6);
  }

  try {
    const parsed = JSON.parse(dataStr);
    if (typeof parsed.content === 'string') return parsed.content;
    if (typeof parsed.delta === 'string') return parsed.delta;
    if (typeof parsed.token === 'string') return parsed.token;
    if (typeof parsed.reply === 'string') return parsed.reply;
  } catch {
    // Ignore invalid JSON chunks
  }
  return '';
}

export function prepareAIMessagesForRequest(messages: AIMessage[]): AIMessage[] {
  return messages
    .filter((message) => message.role !== 'system' && message.status !== 'failed' && message.status !== 'streaming' && message.content.trim())
    .slice(-MAX_AI_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: trimForAI(message.content.trim(), MAX_AI_MESSAGE_CHARS)
    }));
}

function compactAIContext(value: unknown, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === 'string') return trimForAI(value, MAX_CONTEXT_STRING_CHARS);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (depth >= MAX_CONTEXT_DEPTH) return '[summary omitted]';

  if (Array.isArray(value)) {
    return value.slice(0, MAX_CONTEXT_ARRAY_ITEMS).map((item) => compactAIContext(item, depth + 1));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 30)
        .map(([key, item]) => [key, compactAIContext(item, depth + 1)])
    );
  }

  return undefined;
}

export interface AIService {
  getStatus: () => Promise<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean }>;
  testGroq: () => Promise<{ ok: boolean; message: string; model?: string }>;
  send: (messages: AIMessage[], context: any) => Promise<{ reply: string }>;
  sendMessage: (messages: AIMessage[], context: any) => Promise<{ reply: string }>;
  sendMessageStream: (
    messages: AIMessage[],
    context: any,
    onToken: (token: string) => void
  ) => Promise<void>;
  compare: (prompt: string, models: { provider: string; model: string }[]) => Promise<{ results: any[] }>;
  benchmark: (provider: string, model: string, categories: string[]) => Promise<{ results: any[] }>;
}

const getSettingsBody = (messages: AIMessage[], context: any) => {
  const settings = useAISettingsStore.getState();
  return {
    messages: prepareAIMessagesForRequest(messages),
    context: compactAIContext(context),
    provider: settings.activeProvider,
    model: settings.activeModel,
    mode: settings.activeMode,
    stream: settings.streamingEnabled,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    systemPrompt: settings.systemPrompt,
    language: settings.language || 'English'
  };
};

const sendAIRequest = async (messages: AIMessage[], context: any): Promise<{ reply: string }> => {
  const body = getSettingsBody(messages, context);
  const started = Date.now();
  const response = await request<any>('/ai/chat', {
    method: 'POST',
    body
  });

  const latency = Date.now() - started;
  
  // Normalize here
  const normalized = normalizeAIResponse(response);

  const finalLatency = response.metadata?.latencyMs || latency;
  const usage = response.metadata?.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const cost = usage.estimatedCostUsd || 0;
  useAISettingsStore.getState().recordUsage(usage.totalTokens, finalLatency, cost);

  return { reply: normalized.content };
};

export const aiService: AIService = {
  getStatus: () => request<{ backendOnline: boolean; groqConfigured: boolean; model: string; streamingSupported: boolean }>('/ai/status'),
  testGroq: () => request<{ ok: boolean; message: string; model?: string }>('/ai/test', {
    method: 'POST',
    body: {}
  }),
  send: sendAIRequest,
  sendMessage: sendAIRequest,
  sendMessageStream: async (messages, context, onToken) => {
    const body = getSettingsBody(messages, context);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const response = await fetch(`${baseUrl}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      let message = `Streaming API returned status ${response.status}`;
      let code: string | undefined;

      try {
        const payload = await response.json();
        message = payload.error || payload.message || message;
        code = payload.code;
      } catch {
        // Fall back to the default status message when the body is not JSON.
      }

      throw new ApiError(message, response.status, code);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Completions stream reader is not available.');

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
        if (trimmed.startsWith('event: done')) continue;

        // Process metadata/errors from custom headers
        if (trimmed.startsWith('data: ')) {
          try {
            const dataStr = trimmed.slice(6);
            const parsed = JSON.parse(dataStr);
            if (parsed.metadata) {
              const latency = parsed.metadata.latencyMs || 0;
              const usage = parsed.metadata.usage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
              const cost = usage.estimatedCostUsd || 0;
              useAISettingsStore.getState().recordUsage(usage.totalTokens, latency, cost);
            } else if (parsed.message) {
              throw new ApiError(parsed.message, response.status, parsed.code);
            }
          } catch (err) {
            if (err instanceof ApiError) {
              throw err;
            }
          }
        }

        const token = parseStreamChunk(trimmed);
        if (token) {
          onToken(token);
        }
      }
    }
  },
  compare: (prompt, models) => request<{ results: any[] }>('/ai/compare', {
    method: 'POST',
    body: {
      prompt,
      models,
      temperature: useAISettingsStore.getState().temperature,
      maxTokens: useAISettingsStore.getState().maxTokens
    }
  }),
  benchmark: (provider, model, categories) => request<{ results: any[] }>('/ai/benchmark', {
    method: 'POST',
    body: {
      provider,
      model,
      categories
    }
  })
};
