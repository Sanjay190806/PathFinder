import { z } from 'zod';

const aiProviderSchema = z.enum(['groq', 'openrouter', 'ollama', 'lmstudio', 'openai', 'anthropic', 'gemini']);

export const resumeStudioContextSchema = z.record(z.any());

export const resumeAISettingsSchema = z.object({
  provider: aiProviderSchema.optional(),
  model: z.string().trim().min(1).max(200).optional(),
  mode: z.string().optional(),
  streaming: z.boolean().optional(),
});

export const analyzeJobRequestSchema = z.object({
  jobDescription: z.string().min(1).max(6000),
  resumeState: resumeStudioContextSchema,
  aiSettings: resumeAISettingsSchema.optional(),
});

export const bulletGenerationRequestSchema = z.object({
  input: z.object({
    projectName: z.string().min(1).max(160),
    actionVerb: z.string().min(1).max(80),
    techStack: z.string().max(220).optional().default(''),
    problemSolved: z.string().min(1).max(260),
    measurableImpact: z.string().max(160).optional().default(''),
    roleType: z.string().max(120).optional().default('SWE'),
    targetCompany: z.string().max(120).optional().default(''),
    tone: z.enum(['concise', 'strong', 'ATS', 'recruiter-friendly']),
  }),
  aiSettings: resumeAISettingsSchema.optional(),
});

export const recruiterReviewRequestSchema = z.object({
  jobDescription: z.string().max(6000).optional().default(''),
  resumeState: resumeStudioContextSchema,
  aiSettings: resumeAISettingsSchema.optional(),
});

export const interviewQuestionsRequestSchema = z.object({
  resumeState: resumeStudioContextSchema,
  aiSettings: resumeAISettingsSchema.optional(),
});
