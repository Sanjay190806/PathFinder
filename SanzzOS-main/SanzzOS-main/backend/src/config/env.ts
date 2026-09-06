import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const backendEnvPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');
const rootEnvPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../.env');

dotenv.config({ path: backendEnvPath });
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_only_replace_with_secure_secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  AI_PROVIDER: process.env.AI_PROVIDER || '',
  AI_MODEL: process.env.AI_MODEL || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || '',
  LMSTUDIO_BASE_URL: process.env.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
  LMSTUDIO_MODEL: process.env.LMSTUDIO_MODEL || ''
};
