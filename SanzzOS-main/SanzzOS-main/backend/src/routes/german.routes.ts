import { Router } from 'express';
import { handleGermanConversation } from '../controllers/german.controller.js';

const router = Router();

router.post('/german/conversation', handleGermanConversation);

export default router;

