import { Router } from 'express';
import { getAIBrainProfile, getAIBrainRecommendations, getAIBrainSummaryController, refreshAIBrain } from '../controllers/aiBrain.controller.js';

const router = Router();

router.get('/ai-brain/profile', getAIBrainProfile);
router.get('/ai-brain/summary', getAIBrainSummaryController);
router.get('/ai-brain/recommendations', getAIBrainRecommendations);
router.post('/ai-brain/refresh', refreshAIBrain);

export default router;
