const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const root = process.cwd();
const backendDir = path.join(root, 'backend');
const backendEnvPath = path.join(backendDir, '.env');
const fallbackDatabaseUrl = 'postgresql://user:password@localhost:5432/sanju_career_os?schema=public';

const env = { ...process.env };

if (!env.DATABASE_URL && !fs.existsSync(backendEnvPath)) {
  env.DATABASE_URL = fallbackDatabaseUrl;
  console.log('DATABASE_URL not found; using a local placeholder only for prisma validate.');
  console.log('Create backend/.env from backend/.env.example before running migrations or the backend.');
}

const result = spawnSync('npx', ['prisma', 'validate'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env,
});

process.exit(result.status || 0);
