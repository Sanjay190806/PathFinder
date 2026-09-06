export type AIProviderName =
  | 'groq'
  | 'openrouter'
  | 'ollama'
  | 'lmstudio'
  | 'openai'
  | 'anthropic'
  | 'gemini';

export type AIMessageRole = 'system' | 'user' | 'assistant';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
}

export interface AIModelInfo {
  id: string;
  name?: string;
  contextLength?: number;
  inputCostPer1K?: number;
  outputCostPer1K?: number;
  supportsStreaming?: boolean;
  supportsEmbeddings?: boolean;
}

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
}

export interface AIProviderMetadata {
  provider: AIProviderName;
  model: string;
  latencyMs: number;
  fallbackUsed: boolean;
  attempts: Array<{ provider: AIProviderName; model: string; status: 'success' | 'failed'; error?: string }>;
  usage?: AIUsage;
}

export interface AIChatRequest {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface AIChatResponse {
  reply: string;
  model: string;
  provider: AIProviderName;
  usage: AIUsage;
  metadata?: Partial<AIProviderMetadata>;
}

export interface AIEmbeddingResponse {
  embeddings: number[][];
  model: string;
  provider: AIProviderName;
  usage?: AIUsage;
}

export interface AIProviderHealth {
  provider: AIProviderName;
  status: 'ready' | 'missing_auth' | 'offline' | 'error';
  authenticated: boolean;
  latencyMs: number | null;
  modelAvailability: 'known' | 'unknown' | 'unavailable';
  streamingSupported: boolean;
  embeddingsSupported: boolean;
  contextLength: number;
  estimatedInputCostPer1K: number;
  estimatedOutputCostPer1K: number;
  defaultModel: string;
  error?: string;
}

export class AIProviderError extends Error {
  provider: AIProviderName;
  status: number;
  code: string;
  retryable: boolean;

  constructor(provider: AIProviderName, message: string, status = 500, code = 'ai_provider_error', retryable = true) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.status = status;
    this.code = code;
    this.retryable = retryable;
  }
}

export interface AIProvider {
  name: AIProviderName;
  defaultModel: string;
  fallbackModels: string[];
  contextLength: number;
  streamingSupported: boolean;
  embeddingsSupported: boolean;
  chat(request: AIChatRequest): Promise<AIChatResponse>;
  stream(request: AIChatRequest, onToken: (token: string) => void): Promise<AIChatResponse>;
  listModels(): Promise<AIModelInfo[]>;
  health(): Promise<AIProviderHealth>;
  embeddings(input: string | string[], model?: string): Promise<AIEmbeddingResponse>;
  cancel(requestId?: string): Promise<void>;
  estimateTokens(input: string | AIMessage[]): number;
  estimateCost(inputTokens: number, outputTokens: number, model?: string): number;
}
