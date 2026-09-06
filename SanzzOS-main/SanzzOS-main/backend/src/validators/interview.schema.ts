import { z } from 'zod';

const interviewProviderSchema = z.enum(['groq', 'openrouter', 'ollama', 'lmstudio', 'openai', 'anthropic', 'gemini']);

export const interviewModeSchema = z.enum([
  'HR',
  'Technical',
  'Behavioral',
  'Product/Analyst',
  'German',
  'Company-Specific',
  'Resume-Based',
  'Rapid Fire',
]);

export const interviewDifficultySchema = z.enum(['easy', 'medium', 'hard']);

export const interviewAiSettingsSchema = z.object({
  provider: interviewProviderSchema.optional(),
  model: z.string().trim().min(1).max(200).optional(),
});

export const interviewVoiceStatsSchema = z.object({
  speakingDurationMs: z.number().min(0).optional(),
  wordCount: z.number().min(0).optional(),
  wordsPerMinute: z.number().min(0).optional(),
  fillerWordCount: z.number().min(0).optional(),
  confidenceRating: z.number().min(1).max(5).optional(),
  transcriptPreview: z.string().max(500).optional(),
}).partial().optional();

export const interviewContextSchema = z.record(z.any()).optional().default({});

export const interviewStartRequestSchema = z.object({
  mode: interviewModeSchema,
  difficulty: interviewDifficultySchema.default('medium'),
  durationMinutes: z.number().int().min(5).max(120).optional().default(20),
  companyName: z.string().trim().max(120).optional().default('General placement target'),
  roleTitle: z.string().trim().max(120).optional().default('SWE'),
  language: z.enum(['en', 'de']).optional().default('en'),
  questionCount: z.number().int().min(1).max(10).optional().default(1),
  resumeState: z.record(z.any()).optional().default({}),
  context: interviewContextSchema,
  aiSettings: interviewAiSettingsSchema.optional(),
});

export const interviewNextQuestionRequestSchema = z.object({
  mode: interviewModeSchema,
  difficulty: interviewDifficultySchema.default('medium'),
  companyName: z.string().trim().max(120).optional().default('General placement target'),
  roleTitle: z.string().trim().max(120).optional().default('SWE'),
  language: z.enum(['en', 'de']).optional().default('en'),
  question: z.string().trim().min(1).max(2000),
  answer: z.string().trim().min(1).max(4000),
  context: interviewContextSchema,
  history: z.array(z.object({
    question: z.string().trim().min(1).max(2000),
    answer: z.string().trim().min(1).max(4000).optional(),
    score: z.number().min(0).max(100).optional(),
  })).optional().default([]),
  aiSettings: interviewAiSettingsSchema.optional(),
});

export const interviewScoreRequestSchema = z.object({
  mode: interviewModeSchema,
  difficulty: interviewDifficultySchema.default('medium'),
  companyName: z.string().trim().max(120).optional().default('General placement target'),
  roleTitle: z.string().trim().max(120).optional().default('SWE'),
  language: z.enum(['en', 'de']).optional().default('en'),
  question: z.string().trim().min(1).max(2000),
  answer: z.string().trim().min(1).max(4000),
  context: interviewContextSchema,
  history: z.array(z.object({
    question: z.string().trim().min(1).max(2000),
    answer: z.string().trim().min(1).max(4000).optional(),
    score: z.number().min(0).max(100).optional(),
  })).optional().default([]),
  voiceStats: interviewVoiceStatsSchema,
  aiSettings: interviewAiSettingsSchema.optional(),
});

export const interviewFinalReviewRequestSchema = z.object({
  mode: interviewModeSchema,
  difficulty: interviewDifficultySchema.default('medium'),
  companyName: z.string().trim().max(120).optional().default('General placement target'),
  roleTitle: z.string().trim().max(120).optional().default('SWE'),
  language: z.enum(['en', 'de']).optional().default('en'),
  context: interviewContextSchema,
  history: z.array(z.object({
    question: z.string().trim().min(1).max(2000),
    answer: z.string().trim().min(1).max(4000).optional(),
    score: z.number().min(0).max(100).optional(),
  })).optional().default([]),
  scores: z.array(z.object({
    question: z.string().trim().min(1).max(2000),
    score: z.number().min(0).max(100),
  })).optional().default([]),
  voiceStats: interviewVoiceStatsSchema,
  aiSettings: interviewAiSettingsSchema.optional(),
});

export type InterviewMode = z.infer<typeof interviewModeSchema>;
export type InterviewDifficulty = z.infer<typeof interviewDifficultySchema>;

