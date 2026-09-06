import {
  AIChatRequest,
  AIChatResponse,
  AIEmbeddingResponse,
  AIMessage,
  AIModelInfo,
  AIProvider,
  AIProviderError,
  AIProviderHealth,
  AIProviderName
} from '../interfaces/AIProvider.js';
import { estimateTokens as estimateTokenCount } from '../utils/tokenEstimator.js';
import { estimateCost as estimateCostUsd } from '../utils/costEstimator.js';

interface OpenAICompatibleConfig {
  name: AIProviderName;
  baseUrl: string;
  apiKey?: string;
  apiKeyRequired: boolean;
  defaultModel: string;
  fallbackModels?: string[];
  contextLength: number;
  streamingSupported?: boolean;
  embeddingsSupported?: boolean;
  headers?: Record<string, string>;
  inputCostPer1K?: number;
  outputCostPer1K?: number;
}

export class OpenAICompatibleProvider implements AIProvider {
  name: AIProviderName;
  defaultModel: string;
  fallbackModels: string[];
  contextLength: number;
  streamingSupported: boolean;
  embeddingsSupported: boolean;
  protected baseUrl: string;
  protected apiKey: string;
  protected apiKeyRequired: boolean;
  protected headers: Record<string, string>;
  protected inputCostPer1K: number;
  protected outputCostPer1K: number;

  constructor(config: OpenAICompatibleConfig) {
    this.name = config.name;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey?.trim().replace(/^Bearer\s+/i, '') || '';
    this.apiKeyRequired = config.apiKeyRequired;
    this.defaultModel = config.defaultModel;
    this.fallbackModels = config.fallbackModels || [];
    this.contextLength = config.contextLength;
    this.streamingSupported = config.streamingSupported ?? true;
    this.embeddingsSupported = config.embeddingsSupported ?? true;
    this.headers = config.headers || {};
    this.inputCostPer1K = config.inputCostPer1K || 0;
    this.outputCostPer1K = config.outputCostPer1K || 0;
  }

  private requestHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      ...this.headers
    };
  }

  private assertConfigured(): void {
    if (this.apiKeyRequired && !this.apiKey) {
      throw new AIProviderError(this.name, `${this.name} API key is missing.`, 503, 'missing_api_key', true);
    }
  }

  private async readError(response: Response): Promise<string> {
    const raw = await response.text();
    try {
      const parsed = JSON.parse(raw);
      return parsed?.error?.message || parsed?.error || parsed?.message || raw || `${this.name} returned ${response.status}.`;
    } catch {
      return raw || `${this.name} returned ${response.status}.`;
    }
  }

  protected mapError(status: number, message: string): AIProviderError {
    if (status === 401 || status === 403) {
      return new AIProviderError(this.name, `${this.name} rejected authentication.`, status, 'invalid_api_key', true);
    }
    if (status === 429) {
      return new AIProviderError(this.name, `${this.name} is rate-limited or quota-limited.`, status, 'provider_rate_limited', true);
    }
    return new AIProviderError(this.name, message, status, 'provider_upstream_error', status >= 500 || status === 404 || status === 422);
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    this.assertConfigured();
    const started = Date.now();
    const model = request.model || this.defaultModel;

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.requestHeaders(),
        signal: request.signal,
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.maxTokens || 700,
          temperature: request.temperature ?? 0.7
        })
      });
    } catch (error: any) {
      throw new AIProviderError(this.name, error?.message || `${this.name} network error.`, 503, 'provider_network_error', true);
    }

    if (!response.ok) {
      throw this.mapError(response.status, await this.readError(response));
    }

    const data: any = await response.json();
    const choice = data.choices?.[0]?.message;
    const reply = choice?.content || choice?.reasoning_content || choice?.text || '';
    if (!reply.trim()) {
      throw new AIProviderError(this.name, `${this.name} returned an empty response.`, 502, 'provider_empty_response', true);
    }

    const usage = data.usage || {};
    const promptTokens = usage.prompt_tokens || this.estimateTokens(request.messages);
    const completionTokens = usage.completion_tokens || this.estimateTokens(reply);

    return {
      reply,
      model: data.model || model,
      provider: this.name,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: usage.total_tokens || promptTokens + completionTokens,
        estimatedCostUsd: this.estimateCost(promptTokens, completionTokens, data.model || model)
      },
      metadata: { latencyMs: Date.now() - started }
    };
  }

  async stream(request: AIChatRequest, onToken: (token: string) => void): Promise<AIChatResponse> {
    if (!this.streamingSupported) {
      const response = await this.chat(request);
      onToken(response.reply);
      return response;
    }

    this.assertConfigured();
    const started = Date.now();
    const model = request.model || this.defaultModel;
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.requestHeaders(),
        signal: request.signal,
        body: JSON.stringify({
          model,
          messages: request.messages,
          max_tokens: request.maxTokens || 700,
          temperature: request.temperature ?? 0.7,
          stream: true
        })
      });
    } catch (error: any) {
      throw new AIProviderError(this.name, error?.message || `${this.name} streaming network error.`, 503, 'provider_network_error', true);
    }

    if (!response.ok) {
      throw this.mapError(response.status, await this.readError(response));
    }

    const reader = response.body?.getReader();
    if (!reader) throw new AIProviderError(this.name, `${this.name} stream reader unavailable.`, 502, 'provider_stream_unavailable', true);

    const decoder = new TextDecoder();
    let buffer = '';
    let reply = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          const token = parsed.choices?.[0]?.delta?.content || '';
          if (token) {
            reply += token;
            onToken(token);
          }
        } catch {
          // Ignore incomplete chunks.
        }
      }
    }

    if (!reply.trim()) {
      throw new AIProviderError(this.name, `${this.name} returned an empty stream.`, 502, 'provider_empty_response', true);
    }

    const promptTokens = this.estimateTokens(request.messages);
    const completionTokens = this.estimateTokens(reply);

    return {
      reply,
      model,
      provider: this.name,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCostUsd: this.estimateCost(promptTokens, completionTokens, model)
      },
      metadata: { latencyMs: Date.now() - started }
    };
  }

  async listModels(): Promise<AIModelInfo[]> {
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/models`, { headers: this.requestHeaders() });
    if (!response.ok) {
      return [this.defaultModel, ...this.fallbackModels].map((id) => ({ id, supportsStreaming: this.streamingSupported, contextLength: this.contextLength }));
    }
    const data: any = await response.json();
    const models = Array.isArray(data.data) ? data.data : [];
    return models.map((model: any) => ({
      id: model.id || model.name,
      name: model.name || model.id,
      contextLength: model.context_length || model.contextLength || this.contextLength,
      supportsStreaming: this.streamingSupported,
      supportsEmbeddings: this.embeddingsSupported
    })).filter((model: AIModelInfo) => model.id);
  }

  async health(): Promise<AIProviderHealth> {
    const started = Date.now();
    if (this.apiKeyRequired && !this.apiKey) {
      return this.healthPayload('missing_auth', false, null, 'unavailable', 'API key missing.');
    }

    try {
      await this.listModels();
      return this.healthPayload('ready', true, Date.now() - started, 'known');
    } catch (error: any) {
      return this.healthPayload('error', Boolean(this.apiKey), Date.now() - started, 'unknown', error?.message || `${this.name} health check failed.`);
    }
  }

  async embeddings(input: string | string[], model?: string): Promise<AIEmbeddingResponse> {
    if (!this.embeddingsSupported) {
      throw new AIProviderError(this.name, `${this.name} embeddings are not supported by this adapter.`, 501, 'embeddings_unsupported', false);
    }
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: this.requestHeaders(),
      body: JSON.stringify({ model: model || 'text-embedding-3-small', input })
    });
    if (!response.ok) throw this.mapError(response.status, await this.readError(response));
    const data: any = await response.json();
    return {
      embeddings: (data.data || []).map((item: any) => item.embedding),
      model: data.model || model || 'text-embedding-3-small',
      provider: this.name
    };
  }

  async cancel(_requestId?: string): Promise<void> {
    return;
  }

  estimateTokens(input: string | AIMessage[]): number {
    return estimateTokenCount(input);
  }

  estimateCost(inputTokens: number, outputTokens: number, _model?: string): number {
    return estimateCostUsd(inputTokens, outputTokens, {
      inputCostPer1K: this.inputCostPer1K,
      outputCostPer1K: this.outputCostPer1K
    });
  }

  protected healthPayload(
    status: AIProviderHealth['status'],
    authenticated: boolean,
    latencyMs: number | null,
    modelAvailability: AIProviderHealth['modelAvailability'],
    error?: string
  ): AIProviderHealth {
    return {
      provider: this.name,
      status,
      authenticated,
      latencyMs,
      modelAvailability,
      streamingSupported: this.streamingSupported,
      embeddingsSupported: this.embeddingsSupported,
      contextLength: this.contextLength,
      estimatedInputCostPer1K: this.inputCostPer1K,
      estimatedOutputCostPer1K: this.outputCostPer1K,
      defaultModel: this.defaultModel,
      error
    };
  }
}
