import { AIProvider, AIProviderHealth } from '../interfaces/AIProvider.js';

export async function getProviderHealth(providers: AIProvider[]): Promise<AIProviderHealth[]> {
  return Promise.all(providers.map((provider) => provider.health()));
}
