import { Router } from 'express';
import {
  handleCloudStatus,
  handleCreateBackup,
  handleDeleteBackup,
  handleDeleteDevice,
  handleGetBackup,
  handleGetSnapshot,
  handleListBackups,
  handleListDevices,
  handleMergeSnapshot,
  handlePostSnapshot,
  handleRestoreBackup,
  handleUpdateDevice,
} from '../controllers/cloudSync.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/cloud/sync/status', requireAuth, handleCloudStatus);
router.get('/cloud/snapshot', requireAuth, handleGetSnapshot);
router.post('/cloud/snapshot', requireAuth, handlePostSnapshot);
router.post('/cloud/snapshot/merge', requireAuth, handleMergeSnapshot);
router.post('/cloud/sync/push', requireAuth, handlePostSnapshot);
router.get('/cloud/sync/pull', requireAuth, handleGetSnapshot);
router.get('/cloud/backups', requireAuth, handleListBackups);
router.post('/cloud/backups', requireAuth, handleCreateBackup);
router.post('/cloud/backup', requireAuth, handleCreateBackup);
router.get('/cloud/backups/:id', requireAuth, handleGetBackup);
router.post('/cloud/backups/:id/restore', requireAuth, handleRestoreBackup);
router.delete('/cloud/backups/:id', requireAuth, handleDeleteBackup);
router.get('/cloud/devices', requireAuth, handleListDevices);
router.patch('/cloud/devices/:deviceId', requireAuth, handleUpdateDevice);
router.delete('/cloud/devices/:deviceId', requireAuth, handleDeleteDevice);

export default router;
