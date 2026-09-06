import { Request, Response } from 'express';
import { DEFAULT_LEARNING_PATHS, getLearningAnalytics } from '../services/learning.service.js';

export function getLearningPaths(_req: Request, res: Response) {
  res.json(DEFAULT_LEARNING_PATHS);
}

export function getLearningPath(req: Request, res: Response) {
  const path = DEFAULT_LEARNING_PATHS.find((item) => item.id === req.params.id);
  if (!path) return res.status(404).json({ error: 'Learning path not found' });
  res.json(path);
}

export function upsertLearningPayload(req: Request, res: Response) {
  res.status(201).json({ saved: true, payload: req.body });
}

export function patchLearningPath(req: Request, res: Response) {
  res.json({ updated: true, id: req.params.id, payload: req.body });
}

export function getLearningRecommendations(_req: Request, res: Response) {
  res.json([
    { id: 'sql', title: 'Practice SQL joins', priority: 'high' },
    { id: 'java', title: 'Solve one Java DSA problem', priority: 'high' }
  ]);
}

export function getLearningAnalyticsController(_req: Request, res: Response) {
  res.json(getLearningAnalytics());
}
