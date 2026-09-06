const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const process = require('node:process');

const envPath = path.join(process.cwd(), 'backend', '.env');

function parseEnv(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, '');
    out[key] = value;
  }
  return out;
}

function safeConfig(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    return {
      provider: url.protocol.replace(':', ''),
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.replace(/^\//, ''),
      user: decodeURIComponent(url.username || ''),
    };
  } catch {
    return null;
  }
}

function checkTcp(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port: Number(port), timeout: 2500 });
    socket.on('connect', () => {
      socket.destroy();
      resolve({ ok: true });
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, message: 'TCP timeout' });
    });
    socket.on('error', (error) => resolve({ ok: false, message: error.message }));
  });
}

async function main() {
  console.log('Sanju Career OS DB Doctor');

  if (!fs.existsSync(envPath)) {
    console.log('backend/.env: missing');
    console.log('Create backend/.env from backend/.env.example and set DATABASE_URL.');
    process.exit(1);
  }

  const env = parseEnv(fs.readFileSync(envPath, 'utf8'));
  if (!env.DATABASE_URL) {
    console.log('DATABASE_URL: missing');
    process.exit(1);
  }

  const config = safeConfig(env.DATABASE_URL);
  if (!config) {
    console.log('DATABASE_URL: invalid URL format');
    process.exit(1);
  }

  console.log('Safe DATABASE_URL config:');
  console.log(JSON.stringify(config, null, 2));

  const tcp = await checkTcp(config.host, config.port);
  if (tcp.ok) {
    console.log(`TCP check: connected to ${config.host}:${config.port}`);
    console.log('If Prisma still fails, verify username/password and database name.');
    return;
  }

  console.log(`TCP check: failed to reach ${config.host}:${config.port} (${tcp.message})`);
  console.log('Start PostgreSQL service or fix host/port in backend/.env.');
  process.exit(1);
}

main().catch((error) => {
  console.error('DB doctor failed:', error.message);
  process.exit(1);
});
