import { Request, Response } from 'express';
import { feedbackRequestSchema } from '../validators/feedback.schema.js';

const store: Array<{ id: string; type: string; title: string; description: string; severity: string; page: string; createdAt: string }> = [];

export async function handleCreateFeedback(req: Request, res: Response) {
  const parsed = feedbackRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid feedback payload.' });
  }

  const item = {
    id: `feedback-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  store.unshift(item);
  return res.status(201).json({ ok: true, id: item.id, createdAt: item.createdAt });
}

