import { z } from 'zod';

export const feedbackRequestSchema = z.object({
  type: z.enum(['bug', 'feature', 'idea', 'issue']),
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().min(1).max(2000),
  severity: z.enum(['low', 'medium', 'high']),
  page: z.string().trim().min(1).max(120),
});

