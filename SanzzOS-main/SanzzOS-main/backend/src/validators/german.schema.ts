import { z } from 'zod';

export const germanConversationModeSchema = z.enum([
  'English + German help',
  'German only beginner',
  'Interview German',
  'College German',
  'Daily life German',
  'Correct my sentence',
]);

export const germanConversationRequestSchema = z.object({
  mode: germanConversationModeSchema,
  level: z.enum(['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1 Preview']).default('A1.1'),
  userMessage: z.string().trim().min(1).max(3000),
  context: z.record(z.any()).optional().default({}),
  aiSettings: z.object({
    provider: z.enum(['groq', 'openrouter', 'ollama', 'lmstudio', 'openai', 'anthropic', 'gemini']).optional(),
    model: z.string().trim().min(1).max(200).optional(),
  }).optional(),
});

