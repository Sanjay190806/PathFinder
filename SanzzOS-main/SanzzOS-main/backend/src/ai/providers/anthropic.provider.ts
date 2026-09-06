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
import { estimateCost as estimateCostUsd } from '../utils/costEstimator.js';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic' as const;
  defaultModel = env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest';
  fallbackModels = ['claude-3-5-sonnet-latest'];
  contextLength = 200000;
  streamingSupported = true;
  embeddingsSupported = false;
  private apiKey = env.ANTHROPIC_API_KEY?.trim() || '';

  private splitMessages(messages: AIMessage[]) {
    const system = messages.filter((message) => message.role === 'system').map((message) => message.content).join('\n\n');
    const chatMessages = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: message.content }));
    return { system, chatMessages };
  }

  private headers() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01'
    };
  }

  private assertConfigured() {
    if (!this.apiKey) throw new AIProviderError(this.name, 'Anthropic API key is missing.', 503, 'missing_api_key', true);
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    this.assertConfigured();
    const started = Date.now();
    const model = request.model || this.defaultModel;
    const { system, chatMessages } = this.splitMessages(request.messages);
    let response: Response;
    try {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: request.signal,
        headers: this.headers(),
        body: JSON.stringify({ model, system: system || undefined, messages: chatMessages, max_tokens: request.maxTokens || 700, temperature: request.temperature ?? 0.7 })
      });
    } catch (error: any) {
      throw new AIProviderError(this.name, error?.message || 'Anthropic network error.', 503, 'provider_network_error', true);
    }
    if (!response.ok) {
      if (response.status === 429) throw new AIProviderError(this.name, 'Anthropic is rate-limited.', 429, 'provider_rate_limited', true);
      throw new AIProviderError(this.name, `Anthropic returned ${response.status}.`, response.status, 'provider_upstream_error', response.status >= 500);
    }
    const data: any = await response.json();
    const reply = (data.content || []).map((item: any) => item.text || '').join('');
    if (!reply.trim()) throw new AIProviderError(this.name, 'Anthropic returned an empty response.', 502, 'provider_empty_response', true);
    const promptTokens = data.usage?.input_tokens || this.estimateTokens(request.messages);
    const completionTokens = data.usage?.output_tokens || this.estimateTokens(reply);
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
    return [this.defaultModel, ...this.fallbackModels].map((id) => ({ id, contextLength: this.contextLength, supportsStreaming: true }));
  }

  async health(): Promise<AIProviderHealth> {
    return {
      provider: this.name,
      status: this.apiKey ? 'ready' : 'missing_auth',
      authenticated: Boolean(this.apiKey),
      latencyMs: null,
      modelAvailability: this.apiKey ? 'known' : 'unavailable',
      streamingSupported: true,
      embeddingsSupported: false,
      contextLength: this.contextLength,
      estimatedInputCostPer1K: 0.0008,
      estimatedOutputCostPer1K: 0.004,
      defaultModel: this.defaultModel,
      error: this.apiKey ? undefined : 'API key missing.'
    };
  }

  async embeddings(_input: string | string[], _model?: string): Promise<AIEmbeddingResponse> {
    throw new AIProviderError(this.name, 'Anthropic embeddings are not supported by this adapter.', 501, 'embeddings_unsupported', false);
  }

  async cancel(_requestId?: string): Promise<void> {
    return;
  }

  estimateTokens(input: string | AIMessage[]): number {
    return estimateTokenCount(input);
  }

  estimateCost(inputTokens: number, outputTokens: number, _model?: string): number {
    return estimateCostUsd(inputTokens, outputTokens, { inputCostPer1K: 0.0008, outputCostPer1K: 0.004 });
  }
}
