import { env } from '../../config/env.js';
import { OpenAICompatibleProvider } from './openaiCompatible.provider.js';

export class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: env.OPENROUTER_API_KEY,
      apiKeyRequired: true,
      defaultModel: env.OPENROUTER_MODEL || 'qwen/qwen-2.5-coder-32b-instruct',
      fallbackModels: [
        'anthropic/claude-3.5-sonnet',
        'google/gemini-flash-1.5',
        'mistralai/mistral-small',
        'deepseek/deepseek-chat'
      ],
      contextLength: 32768,
      streamingSupported: true,
      embeddingsSupported: false,
      headers: {
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Sanju Career OS'
      }
    });
  }
}
