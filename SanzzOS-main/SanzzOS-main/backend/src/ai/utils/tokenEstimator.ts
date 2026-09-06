import { AIMessage } from '../interfaces/AIProvider.js';

export function estimateTokens(input: string | AIMessage[]): number {
  const text = typeof input === 'string'
    ? input
    : input.map((message) => `${message.role}: ${message.content}`).join('\n');

  return Math.max(1, Math.ceil(text.length / 4));
}
