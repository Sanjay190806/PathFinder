import { Router } from 'express';
import {
  handleInterviewFinalReview,
  handleInterviewNextQuestion,
  handleInterviewScoreAnswer,
  handleInterviewStart,
} from '../controllers/interview.controller.js';

const router = Router();

router.post('/interview/start', handleInterviewStart);
router.post('/interview/next-question', handleInterviewNextQuestion);
router.post('/interview/score-answer', handleInterviewScoreAnswer);
router.post('/interview/final-review', handleInterviewFinalReview);

export default router;

