import { Router } from 'express';
import {
  handleAnalyzeJob,
  handleGenerateBullets,
  handleInterviewQuestions,
  handleRecruiterReview,
} from '../controllers/resume.controller.js';

const router = Router();

router.post('/resume/analyze-job', handleAnalyzeJob);
router.post('/resume/generate-bullets', handleGenerateBullets);
router.post('/resume/recruiter-review', handleRecruiterReview);
router.post('/resume/interview-questions', handleInterviewQuestions);

export default router;
