import { env } from '../../config/env.js';
import {
  AIChatRequest,
  AIChatResponse,
  AIMessage,
  AIProvider,
  AIProviderError,
  AIProviderMetadata,
  AIProviderName
} from '../interfaces/AIProvider.js';
import { AnthropicProvider } from '../providers/anthropic.provider.js';
import { GeminiProvider } from '../providers/gemini.provider.js';
import { GroqProvider } from '../providers/groq.provider.js';
import { LMStudioProvider } from '../providers/lmstudio.provider.js';
import { OllamaProvider } from '../providers/ollama.provider.js';
import { OpenAIProvider } from '../providers/openai.provider.js';
import { OpenRouterProvider } from '../providers/openrouter.provider.js';
import { orderProviders, shouldFallback } from '../utils/fallbackManager.js';
import { getProviderHealth } from '../health/providerHealth.js';

interface RouterRequest extends AIChatRequest {
  preferredProvider?: AIProviderName;
}

export class AIProviderRouter {
  private providers: AIProvider[];

  constructor(providers: AIProvider[]) {
    this.providers = providers;
  }

  static createDefault(): AIProviderRouter {
    return new AIProviderRouter([
      new GroqProvider(),
      new OpenRouterProvider(),
      new OllamaProvider(),
      new LMStudioProvider(),
      new OpenAIProvider(),
      new AnthropicProvider(),
      new GeminiProvider()
    ]);
  }

  private preferredProvider(): AIProviderName | undefined {
    const configured = (env.AI_PROVIDER || '').trim().toLowerCase();
    if (!configured) return undefined;
    const valid = ['groq', 'openrouter', 'ollama', 'lmstudio', 'openai', 'anthropic', 'gemini'];
    return valid.includes(configured) ? configured as AIProviderName : undefined;
  }

  private modelFor(provider: AIProvider, requestedModel?: string, isPrimaryAttempt = false): string {
    if (isPrimaryAttempt && requestedModel) return requestedModel;
    if (env.AI_MODEL?.trim()) return env.AI_MODEL.trim();
    return provider.defaultModel;
  }

  async chat(request: RouterRequest): Promise<AIChatResponse & { metadata: AIProviderMetadata }> {
    const started = Date.now();
    const attempts: AIProviderMetadata['attempts'] = [];
    const ordered = orderProviders(this.providers, request.preferredProvider || this.preferredProvider());
    let lastError: unknown = null;

    for (const provider of ordered) {
      const model = this.modelFor(provider, request.model, provider === ordered[0]);
      try {
        const response = await provider.chat({ ...request, model });
        attempts.push({ provider: provider.name, model, status: 'success' });
        return {
          ...response,
          metadata: {
            provider: provider.name,
            model: response.model || model,
            latencyMs: Date.now() - started,
            fallbackUsed: attempts.length > 1,
            attempts,
            usage: response.usage
          }
        };
      } catch (error: any) {
        console.error(`[AI Provider Failure] ${provider.name} failed:`, error?.message || error);
        lastError = error;
        attempts.push({ provider: provider.name, model, status: 'failed', error: error?.message || 'Provider failed.' });
        if (!shouldFallback(error)) break;
      }
    }

    throw this.toRouterError(lastError, attempts);
  }

  async stream(request: RouterRequest, onToken: (token: string) => void): Promise<AIChatResponse & { metadata: AIProviderMetadata }> {
    const started = Date.now();
    const attempts: AIProviderMetadata['attempts'] = [];
    const ordered = orderProviders(this.providers, request.preferredProvider || this.preferredProvider());
    let lastError: unknown = null;

    for (const provider of ordered) {
      const model = this.modelFor(provider, request.model, provider === ordered[0]);
      try {
        const response = provider.streamingSupported
          ? await provider.stream({ ...request, model }, onToken)
          : await provider.chat({ ...request, model });

        if (!provider.streamingSupported) onToken(response.reply);
        attempts.push({ provider: provider.name, model, status: 'success' });
        return {
          ...response,
          metadata: {
            provider: provider.name,
            model: response.model || model,
            latencyMs: Date.now() - started,
            fallbackUsed: attempts.length > 1,
            attempts,
            usage: response.usage
          }
        };
      } catch (error: any) {
        lastError = error;
        attempts.push({ provider: provider.name, model, status: 'failed', error: error?.message || 'Provider failed.' });
        if (!shouldFallback(error)) break;
      }
    }

    throw this.toRouterError(lastError, attempts);
  }

  async listModels() {
    const result: Record<string, unknown> = {};
    await Promise.all(this.providers.map(async (provider) => {
      try {
        result[provider.name] = await provider.listModels();
      } catch (error: any) {
        result[provider.name] = { error: error?.message || 'Unable to list models.' };
      }
    }));
    return result;
  }

  async health() {
    return getProviderHealth(this.providers);
  }

  async embeddings(input: string | string[], model?: string, preferredProvider?: AIProviderName) {
    const ordered = orderProviders(this.providers, preferredProvider || this.preferredProvider());
    let lastError: unknown = null;
    for (const provider of ordered) {
      if (!provider.embeddingsSupported) continue;
      try {
        return await provider.embeddings(input, model);
      } catch (error) {
        lastError = error;
        if (!shouldFallback(error)) break;
      }
    }
    throw this.toRouterError(lastError, []);
  }

  estimateTokens(input: string | AIMessage[]): number {
    return this.providers[0]?.estimateTokens(input) || 0;
  }

  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const provider = orderProviders(this.providers, this.preferredProvider())[0] || this.providers[0];
    return provider?.estimateCost(inputTokens, outputTokens, model) || 0;
  }

  async cancel(requestId?: string): Promise<void> {
    await Promise.all(this.providers.map((provider) => provider.cancel(requestId)));
  }

  private toRouterError(error: unknown, attempts: AIProviderMetadata['attempts']): AIProviderError {
    if (error instanceof AIProviderError) {
      if (error.code === 'provider_rate_limited') {
        return new AIProviderError(error.provider, 'All configured AI providers are rate-limited or unavailable. Try again shortly.', 429, 'ai_rate_limited', true);
      }
      if (error.code === 'missing_api_key' || attempts.some((attempt) => attempt.error?.toLowerCase().includes('api key is missing'))) {
        return new AIProviderError(
          error.provider,
          'No configured AI provider is ready yet. Add a key in backend/.env or switch to a provider that is already configured.',
          503,
          'missing_api_key',
          true
        );
      }
      return error;
    }

    return new AIProviderError(
      attempts[0]?.provider || 'groq',
      'All configured AI providers failed.',
      502,
      'ai_all_providers_failed',
      true
    );
  }
}

export const providerRouter = AIProviderRouter.createDefault();
