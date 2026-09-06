import { Request, Response } from 'express';
import { getLearningAnalytics } from '../services/learning.service.js';
import { getPlacementReadiness } from '../services/placement.service.js';

export function getAnalyticsOverview(_req: Request, res: Response) {
  res.json({
    learning: getLearningAnalytics(),
    placement: getPlacementReadiness(),
    note: 'Frontend computes live Analytics 2.0 from local persisted state.'
  });
}

export function getAnalyticsList(_req: Request, res: Response) {
  res.json([]);
}

export function getAnalyticsInsights(_req: Request, res: Response) {
  res.json([
    { id: 'fallback', title: 'Local analytics active', detail: 'Use the frontend Analytics 2.0 page for live data.', severity: 'info' }
  ]);
}
