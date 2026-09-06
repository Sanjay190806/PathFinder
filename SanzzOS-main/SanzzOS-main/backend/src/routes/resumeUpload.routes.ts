import { Router } from 'express';
import { handleLinkedInAnalyzeProfileText, handleResumeAIReview, handleResumeScore, handleResumeUploadParse } from '../controllers/resumeUpload.controller.js';

const router = Router();

router.post('/resume/upload-parse', handleResumeUploadParse);
router.post('/resume/score', handleResumeScore);
router.post('/resume/ai-review', handleResumeAIReview);
router.post('/linkedin/analyze-profile-text', handleLinkedInAnalyzeProfileText);

export default router;
