import { env } from '../../config/env.js';
import {
  AIChatRequest,
  AIChatResponse,
  AIEmbeddingResponse,
  AIMessage,
  AIModelInfo,
  AIProvider,
  AIProviderError,
  AIProviderHealth
} from '../interfaces/AIProvider.js';
import { estimateTokens as estimateTokenCount } from '../utils/tokenEstimator.js';

export class OllamaProvider implements AIProvider {
  name = 'ollama' as const;
  defaultModel = env.OLLAMA_MODEL || 'qwen2.5-coder';
  fallbackModels = ['llama3', 'deepseek', 'phi'];
  contextLength = 8192;
  streamingSupported = true;
  embeddingsSupported = true;
  private baseUrl = (env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');

  private toPrompt(messages: AIMessage[]): string {
    return messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n');
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const started = Date.now();
    const model = request.model || this.defaultModel;
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        signal: request.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: request.messages, stream: false })
      });
    } catch (error: any) {
      throw new AIProviderError(this.name, error?.message || 'Ollama is offline.', 503, 'provider_network_error', true);
    }
    if (!response.ok) throw new AIProviderError(this.name, `Ollama returned ${response.status}.`, response.status, 'provider_upstream_error', true);
    const data: any = await response.json();
    const reply = data.message?.content || data.response || '';
    if (!reply.trim()) throw new AIProviderError(this.name, 'Ollama returned an empty response.', 502, 'provider_empty_response', true);
    const promptTokens = this.estimateTokens(request.messages);
    const completionTokens = this.estimateTokens(reply);
    return {
      reply,
      model,
      provider: this.name,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, estimatedCostUsd: 0 },
      metadata: { latencyMs: Date.now() - started }
    };
  }

  async stream(request: AIChatRequest, onToken: (token: string) => void): Promise<AIChatResponse> {
    const started = Date.now();
    const model = request.model || this.defaultModel;
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        signal: request.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: request.messages, stream: true })
      });
    } catch (error: any) {
      throw new AIProviderError(this.name, error?.message || 'Ollama is offline.', 503, 'provider_network_error', true);
    }
    if (!response.ok) throw new AIProviderError(this.name, `Ollama returned ${response.status}.`, response.status, 'provider_upstream_error', true);
    const reader = response.body?.getReader();
    if (!reader) return this.chat(request);
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
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const token = parsed.message?.content || parsed.response || '';
          if (token) {
            reply += token;
            onToken(token);
          }
        } catch {
          // Ignore incomplete chunks.
        }
      }
    }
    const promptTokens = this.estimateTokens(request.messages);
    const completionTokens = this.estimateTokens(reply);
    return {
      reply,
      model,
      provider: this.name,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, estimatedCostUsd: 0 },
      metadata: { latencyMs: Date.now() - started }
    };
  }

  async listModels(): Promise<AIModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    if (!response.ok) return [this.defaultModel, ...this.fallbackModels].map((id) => ({ id, contextLength: this.contextLength, supportsStreaming: true }));
    const data: any = await response.json();
    return (data.models || []).map((model: any) => ({ id: model.name, name: model.name, contextLength: this.contextLength, supportsStreaming: true }));
  }

  async health(): Promise<AIProviderHealth> {
    const started = Date.now();
    try {
      await this.listModels();
      return this.healthPayload('ready', Date.now() - started, 'known');
    } catch (error: any) {
      return this.healthPayload('offline', Date.now() - started, 'unknown', error?.message || 'Ollama offline.');
    }
  }

  async embeddings(input: string | string[], model?: string): Promise<AIEmbeddingResponse> {
    const values = Array.isArray(input) ? input : [input];
    const embeddings: number[][] = [];
    for (const value of values) {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: model || this.defaultModel, prompt: value })
      });
      if (!response.ok) throw new AIProviderError(this.name, `Ollama embeddings returned ${response.status}.`, response.status, 'embeddings_failed', true);
      const data: any = await response.json();
      embeddings.push(data.embedding || []);
    }
    return { embeddings, model: model || this.defaultModel, provider: this.name };
  }

  async cancel(_requestId?: string): Promise<void> {
    return;
  }

  estimateTokens(input: string | AIMessage[]): number {
    return estimateTokenCount(typeof input === 'string' ? input : this.toPrompt(input));
  }

  estimateCost(_inputTokens: number, _outputTokens: number, _model?: string): number {
    return 0;
  }

  private healthPayload(status: AIProviderHealth['status'], latencyMs: number | null, modelAvailability: AIProviderHealth['modelAvailability'], error?: string): AIProviderHealth {
    return {
      provider: this.name,
      status,
      authenticated: true,
      latencyMs,
      modelAvailability,
      streamingSupported: true,
      embeddingsSupported: true,
      contextLength: this.contextLength,
      estimatedInputCostPer1K: 0,
      estimatedOutputCostPer1K: 0,
      defaultModel: this.defaultModel,
      error
    };
  }
}
