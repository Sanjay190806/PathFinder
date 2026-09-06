import { Router } from 'express';
import { getLearningAnalyticsController, getLearningPath, getLearningPaths, getLearningRecommendations, patchLearningPath, upsertLearningPayload } from '../controllers/learning.controller.js';

const router = Router();

router.get('/learning/paths', getLearningPaths);
router.get('/learning/paths/:id', getLearningPath);
router.post('/learning/paths', upsertLearningPayload);
router.patch('/learning/paths/:id', patchLearningPath);
router.post('/learning/sessions', upsertLearningPayload);
router.get('/learning/recommendations', getLearningRecommendations);
router.get('/learning/analytics', getLearningAnalyticsController);
router.post('/learning/revision-items', upsertLearningPayload);

export default router;
