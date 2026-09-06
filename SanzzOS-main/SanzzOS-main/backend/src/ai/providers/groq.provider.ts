import { env } from '../../config/env.js';
import { OpenAICompatibleProvider } from './openaiCompatible.provider.js';

export class GroqProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      name: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env.GROQ_API_KEY,
      apiKeyRequired: true,
      defaultModel: env.GROQ_MODEL || 'qwen/qwen3.8-27b',
      fallbackModels: ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'groq/compound'],
      contextLength: 8192,
      streamingSupported: true,
      embeddingsSupported: false,
      inputCostPer1K: 0,
      outputCostPer1K: 0
    });
  }
}
