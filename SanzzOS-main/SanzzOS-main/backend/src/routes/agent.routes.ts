import { Router } from 'express';
import { handleDailyBriefing, handleEveningReview } from '../controllers/agent.controller.js';

const router = Router();

router.post('/agent/daily-briefing', handleDailyBriefing);
router.post('/agent/evening-review', handleEveningReview);

export default router;
