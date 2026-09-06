import { AIProvider, AIProviderName } from '../interfaces/AIProvider.js';

const DEFAULT_ORDER: AIProviderName[] = ['groq', 'openrouter', 'ollama', 'lmstudio', 'openai', 'anthropic', 'gemini'];

export function orderProviders(providers: AIProvider[], preferred?: AIProviderName): AIProvider[] {
  const byName = new Map(providers.map((provider) => [provider.name, provider]));
  const orderedNames = preferred
    ? [preferred, ...DEFAULT_ORDER.filter((name) => name !== preferred)]
    : DEFAULT_ORDER;

  return orderedNames
    .map((name) => byName.get(name))
    .filter((provider): provider is AIProvider => Boolean(provider));
}

export function shouldFallback(error: unknown): boolean {
  if (!error || typeof error !== 'object') return true;
  const maybe = error as { retryable?: boolean; status?: number };
  if (typeof maybe.retryable === 'boolean') return maybe.retryable;
  if (typeof maybe.status === 'number') return maybe.status === 429 || maybe.status >= 500 || maybe.status === 401 || maybe.status === 403;
  return true;
}
