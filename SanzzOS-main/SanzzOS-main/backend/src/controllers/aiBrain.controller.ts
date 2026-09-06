import { Request, Response } from 'express';
import { defaultAIBrainProfile, getAIBrainSummary } from '../services/aiBrain.service.js';

export function getAIBrainProfile(_req: Request, res: Response) {
  res.json(defaultAIBrainProfile);
}

export function getAIBrainSummaryController(_req: Request, res: Response) {
  res.json(getAIBrainSummary());
}

export function getAIBrainRecommendations(_req: Request, res: Response) {
  res.json(getAIBrainSummary().recommendations);
}

export function refreshAIBrain(_req: Request, res: Response) {
  res.json({ refreshed: true, summary: getAIBrainSummary() });
}
