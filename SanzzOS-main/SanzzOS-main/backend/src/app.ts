import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import aiRoutes from './routes/ai.routes.js';
import agentRoutes from './routes/agent.routes.js';
import germanRoutes from './routes/german.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import syncRoutes from './routes/sync.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import integrationRoutes from './routes/integration.routes.js';
import resumeUploadRoutes from './routes/resumeUpload.routes.js';
import aiBrainRoutes from './routes/aiBrain.routes.js';
import smartPlannerRoutes from './routes/smartPlanner.routes.js';
import placementRoutes from './routes/placement.routes.js';
import learningRoutes from './routes/learning.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import authRoutes from './routes/auth.routes.js';
import cloudSyncRoutes from './routes/cloudSync.routes.js';

const app = express();

const cleanFrontendUrl = env.FRONTEND_URL.replace(/\/$/, '');
const allowedOrigins = [
  cleanFrontendUrl,
  `${cleanFrontendUrl}/`,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
  },
  credentials: true
}));

app.use(express.json({ limit: '7mb' }));

// Custom in-memory lightweight rate-limiting middleware for API security
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const rateLimitMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
  const now = Date.now();
  const limit = 45; // Max 45 API calls per minute
  const windowMs = 60000;

  const client = rateLimits.get(ip);
  if (!client || now > client.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + windowMs });
    return next();
  }

  client.count++;
  if (client.count > limit) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please retry in a minute.' });
  }
  next();
};

// Routes
app.use('/api', healthRoutes);
app.use('/api', rateLimitMiddleware, authRoutes);
app.use('/api', rateLimitMiddleware, aiRoutes); // Mount rate-limiting on AI mentor routes
app.use('/api', rateLimitMiddleware, agentRoutes);
app.use('/api', rateLimitMiddleware, germanRoutes);
app.use('/api', rateLimitMiddleware, interviewRoutes);
app.use('/api', rateLimitMiddleware, resumeRoutes);
app.use('/api', rateLimitMiddleware, resumeUploadRoutes);
app.use('/api', rateLimitMiddleware, integrationRoutes);
app.use('/api', rateLimitMiddleware, feedbackRoutes);
app.use('/api', rateLimitMiddleware, aiBrainRoutes);
app.use('/api', rateLimitMiddleware, smartPlannerRoutes);
app.use('/api', rateLimitMiddleware, placementRoutes);
app.use('/api', rateLimitMiddleware, learningRoutes);
app.use('/api', rateLimitMiddleware, analyticsRoutes);
app.use('/api', rateLimitMiddleware, cloudSyncRoutes);
app.use('/api', syncRoutes);

// General 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint Not Found' });
});

// Global 500 exception handler (prevents trace leakage in production env)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Server Exception:", err.message || err);
  res.status(err.status || 500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error occurred' : err.message || 'Internal server error'
  });
});

export default app;
