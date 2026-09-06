import { Router } from 'express';
import { getAnalyticsInsights, getAnalyticsList, getAnalyticsOverview } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/analytics/overview', getAnalyticsOverview);
router.get('/analytics/weekly', getAnalyticsList);
router.get('/analytics/monthly', getAnalyticsList);
router.get('/analytics/skills', getAnalyticsList);
router.get('/analytics/readiness', getAnalyticsOverview);
router.get('/analytics/insights', getAnalyticsInsights);

export default router;
