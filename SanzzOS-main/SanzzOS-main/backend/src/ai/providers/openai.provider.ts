import { env } from '../../config/env.js';
import { OpenAICompatibleProvider } from './openaiCompatible.provider.js';

export class OpenAIProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: env.OPENAI_API_KEY,
      apiKeyRequired: true,
      defaultModel: env.OPENAI_MODEL || 'gpt-4o-mini',
      fallbackModels: ['gpt-4o', 'gpt-4.1-mini'],
      contextLength: 128000,
      streamingSupported: true,
      embeddingsSupported: true,
      inputCostPer1K: 0.00015,
      outputCostPer1K: 0.0006
    });
  }
}
