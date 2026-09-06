import { env } from '../../config/env.js';
import { OpenAICompatibleProvider } from './openaiCompatible.provider.js';

export class LMStudioProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: 'lmstudio',
      baseUrl: env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
      apiKey: '',
      apiKeyRequired: false,
      defaultModel: env.LMSTUDIO_MODEL || 'local-model',
      fallbackModels: ['qwen2.5-coder', 'llama3', 'deepseek', 'phi'],
      contextLength: 8192,
      streamingSupported: true,
      embeddingsSupported: true
    });
  }
}
