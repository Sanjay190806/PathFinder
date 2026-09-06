import { Router } from 'express';
import {
  handlePullSync,
  handlePullSnapshot,
  handlePushSync,
  handlePushSnapshot,
  handleSyncHealth,
} from '../controllers/sync.controller.js';

const router = Router();

router.get('/sync/health', handleSyncHealth);
router.get('/sync/pull', handlePullSnapshot);
router.post('/sync/push', handlePushSnapshot);

router.get('/sync', handlePullSync);
router.post('/sync', handlePushSync);

export default router;
