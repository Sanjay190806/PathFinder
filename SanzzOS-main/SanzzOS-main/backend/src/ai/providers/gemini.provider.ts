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

export class GeminiProvider implements AIProvider {
  name = 'gemini' as const;
  defaultModel = env.GEMINI_MODEL || 'gemini-1.5-flash';
  fallbackModels = ['gemini-1.5-pro'];
  contextLength = 1000000;
  streamingSupported = true;
  embeddingsSupported = true;
  private apiKey = env.GEMINI_API_KEY?.trim() || '';

  private assertConfigured() {
    if (!this.apiKey) throw new AIProviderError(this.name, 'Gemini API key is missing.', 503, 'missing_api_key', true);
  }

  private toGeminiContents(messages: AIMessage[]) {
    const system = messages.filter((message) => message.role === 'system').map((message) => message.content).join('\n\n');
    const contents = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      }));
    return { system, contents };
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    this.assertConfigured();
    const started = Date.now();
    const model = request.model || this.defaultModel;
    const { system, contents } = this.toGeminiContents(request.messages);
    let response: Response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        signal: request.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents,
          generationConfig: { temperature: request.temperature ?? 0.7, maxOutputTokens: request.maxTokens || 700 }
        })
      });
    } catch (error: any) {
      throw new AIProviderError(this.name, error?.message || 'Gemini network error.', 503, 'provider_network_error', true);
    }
    if (!response.ok) {
      if (response.status === 429) throw new AIProviderError(this.name, 'Gemini is rate-limited.', 429, 'provider_rate_limited', true);
      throw new AIProviderError(this.name, `Gemini returned ${response.status}.`, response.status, 'provider_upstream_error', response.status >= 500);
    }
    const data: any = await response.json();
    const reply = (data.candidates?.[0]?.content?.parts || []).map((part: any) => part.text || '').join('');
    if (!reply.trim()) throw new AIProviderError(this.name, 'Gemini returned an empty response.', 502, 'provider_empty_response', true);
    const promptTokens = data.usageMetadata?.promptTokenCount || this.estimateTokens(request.messages);
    const completionTokens = data.usageMetadata?.candidatesTokenCount || this.estimateTokens(reply);
    return {
      reply,
      model,
      provider: this.name,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, estimatedCostUsd: this.estimateCost(promptTokens, completionTokens, model) },
      metadata: { latencyMs: Date.now() - started }
    };
  }

  async stream(request: AIChatRequest, onToken: (token: string) => void): Promise<AIChatResponse> {
    const response = await this.chat(request);
    onToken(response.reply);
    return response;
  }

  async listModels(): Promise<AIModelInfo[]> {
    if (!this.apiKey) return [this.defaultModel, ...this.fallbackModels].map((id) => ({ id, contextLength: this.contextLength, supportsStreaming: true }));
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
    if (!response.ok) return [this.defaultModel, ...this.fallbackModels].map((id) => ({ id, contextLength: this.contextLength, supportsStreaming: true }));
    const data: any = await response.json();
    return (data.models || []).map((model: any) => ({
      id: String(model.name || '').replace('models/', ''),
      name: model.displayName,
      contextLength: model.inputTokenLimit || this.contextLength,
      supportsStreaming: true,
      supportsEmbeddings: true
    })).filter((model: AIModelInfo) => model.id);
  }

  async health(): Promise<AIProviderHealth> {
    return {
      provider: this.name,
      status: this.apiKey ? 'ready' : 'missing_auth',
      authenticated: Boolean(this.apiKey),
      latencyMs: null,
      modelAvailability: this.apiKey ? 'known' : 'unavailable',
      streamingSupported: true,
      embeddingsSupported: true,
      contextLength: this.contextLength,
      estimatedInputCostPer1K: 0,
      estimatedOutputCostPer1K: 0,
      defaultModel: this.defaultModel,
      error: this.apiKey ? undefined : 'API key missing.'
    };
  }

  async embeddings(input: string | string[], model?: string): Promise<AIEmbeddingResponse> {
    this.assertConfigured();
    const values = Array.isArray(input) ? input : [input];
    const embeddings: number[][] = [];
    for (const value of values) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model || 'text-embedding-004'}:embedContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { parts: [{ text: value }] } })
      });
      if (!response.ok) throw new AIProviderError(this.name, `Gemini embeddings returned ${response.status}.`, response.status, 'embeddings_failed', true);
      const data: any = await response.json();
      embeddings.push(data.embedding?.values || []);
    }
    return { embeddings, model: model || 'text-embedding-004', provider: this.name };
  }

  async cancel(_requestId?: string): Promise<void> {
    return;
  }

  estimateTokens(input: string | AIMessage[]): number {
    return estimateTokenCount(input);
  }

  estimateCost(_inputTokens: number, _outputTokens: number, _model?: string): number {
    return 0;
  }
}
