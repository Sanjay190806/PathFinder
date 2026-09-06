import { Router } from 'express';
import { completeTask, generatePlan, getTodayPlan, savePlan } from '../controllers/smartPlanner.controller.js';

const router = Router();

router.get('/smart-planner/today', getTodayPlan);
router.post('/smart-planner/generate', generatePlan);
router.post('/smart-planner/tasks/:id/complete', completeTask);
router.post('/smart-planner/save', savePlan);

export default router;
