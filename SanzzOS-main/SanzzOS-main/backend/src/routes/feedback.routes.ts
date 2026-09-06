import { Router } from 'express';
import { handleCreateFeedback } from '../controllers/feedback.controller.js';

const router = Router();

router.post('/feedback', handleCreateFeedback);

export default router;

