import { Router } from 'express';
import { handleGitHubManualSync, handleIntegrationStatus, handleLeetCodeManualSync, handleLinkedInManualSync, handleValidateUrl, handleYouTubeManualSync } from '../controllers/integration.controller.js';

const router = Router();

router.get('/integrations/status', handleIntegrationStatus);
router.post('/integrations/validate-url', handleValidateUrl);
router.post('/integrations/leetcode/manual-sync', handleLeetCodeManualSync);
router.post('/integrations/linkedin/manual-sync', handleLinkedInManualSync);
router.post('/integrations/github/manual-sync', handleGitHubManualSync);
router.post('/integrations/youtube/manual-sync', handleYouTubeManualSync);

export default router;
