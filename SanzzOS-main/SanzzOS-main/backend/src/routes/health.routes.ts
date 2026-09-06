import { Router } from 'express';
import { env } from '../config/env.js';
import { checkDatabaseHealth } from '../services/databaseHealth.service.js';

const router = Router();

router.get('/health', async (_req, res) => {
  const timestamp = new Date().toISOString();

  const database = await checkDatabaseHealth();
  res.status(200).json({
    status: 'ok',
    api: { status: 'ok' },
    database: {
      available: database.available,
      status: database.available ? 'connected' : 'unavailable',
      code: database.code,
      message: database.message,
      safeConfig: database.safeConfig,
    },
    groq: { status: env.GROQ_API_KEY?.trim() ? 'configured' : 'missing', model: env.GROQ_MODEL || 'llama-3.1-8b-instant' },
    environment: env.NODE_ENV || 'development',
    uptime: process.uptime(),
    timestamp
  });
});

export default router;
