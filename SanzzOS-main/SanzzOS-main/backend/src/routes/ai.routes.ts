import { Router } from 'express';
import {
  handleAIChat,
  handleAIChatStream,
  handleAIModels,
  handleAIProviderHealth,
  handleAIStatus,
  handleAITest,
  handleGetMemory,
  handleAddMemory,
  handleUpdateMemory,
  handleDeleteMemory,
  handleResetMemory,
  handleAICompare,
  handleAIBenchmark
} from '../controllers/ai.controller.js';

const router = Router();

router.get('/ai/status', handleAIStatus);
router.get('/ai/providers/health', handleAIProviderHealth);
router.get('/ai/models', handleAIModels);
router.post('/ai/test', handleAITest);
router.post('/ai/chat', handleAIChat);
router.post('/ai/chat/stream', handleAIChatStream);
router.post('/ai/compare', handleAICompare);
router.post('/ai/benchmark', handleAIBenchmark);

// Memory Engine API
router.get('/ai/memory', handleGetMemory);
router.post('/ai/memory', handleAddMemory);
router.put('/ai/memory/:id', handleUpdateMemory);
router.delete('/ai/memory/:id', handleDeleteMemory);
router.post('/ai/memory/reset', handleResetMemory);

export default router;
