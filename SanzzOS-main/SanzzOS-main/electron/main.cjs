const { app, BrowserWindow, dialog, shell } = require('electron');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { pathToFileURL } = require('url');

const APP_NAME = 'SanzzOS';
const FRONTEND_PORT = 5174;
const BACKEND_PORT = 5000;

let mainWindow = null;
let frontendServer = null;
let backendServer = null;
let ownsBackendServer = false;

const isDev = !app.isPackaged;

function getAppRoot() {
  return isDev ? path.resolve(__dirname, '..') : app.getAppPath();
}

function getBackendRoot() {
  return isDev ? path.resolve(__dirname, '..') : path.join(process.resourcesPath, 'app.asar.unpacked');
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function ensureUserEnvFile() {
  const userEnvPath = path.join(app.getPath('userData'), '.env');
  if (!fs.existsSync(userEnvPath)) {
    fs.writeFileSync(
      userEnvPath,
      [
        'NODE_ENV=development',
        `PORT=${BACKEND_PORT}`,
        `FRONTEND_URL="http://127.0.0.1:${FRONTEND_PORT}"`,
        'DATABASE_URL=',
        'JWT_SECRET="local_desktop_secret_change_me"',
        'GROQ_API_KEY=',
        'GROQ_MODEL="llama-3.1-8b-instant"',
        '',
      ].join('\n'),
      'utf8'
    );
  }
  return userEnvPath;
}

function loadDesktopEnv() {
  const root = getAppRoot();
  const userEnvPath = ensureUserEnvFile();
  const projectEnvPath = isDev ? path.join(root, 'backend', '.env') : '';
  const merged = {
    ...parseEnvFile(userEnvPath),
    ...parseEnvFile(projectEnvPath),
  };

  process.env.NODE_ENV = merged.NODE_ENV || 'development';
  process.env.PORT = String(merged.PORT || BACKEND_PORT);
  process.env.FRONTEND_URL = merged.FRONTEND_URL || `http://127.0.0.1:${FRONTEND_PORT}`;
  process.env.DATABASE_URL = merged.DATABASE_URL || '';
  process.env.JWT_SECRET = merged.JWT_SECRET || 'local_desktop_secret_change_me';
  process.env.GROQ_API_KEY = merged.GROQ_API_KEY || '';
  process.env.GROQ_MODEL = merged.GROQ_MODEL || 'llama-3.1-8b-instant';
  process.env.OPENROUTER_API_KEY = merged.OPENROUTER_API_KEY || '';
  process.env.OPENAI_API_KEY = merged.OPENAI_API_KEY || '';
  process.env.ANTHROPIC_API_KEY = merged.ANTHROPIC_API_KEY || '';
  process.env.GEMINI_API_KEY = merged.GEMINI_API_KEY || '';
}

function getFrontendDistPath() {
  return path.join(getAppRoot(), 'frontend', 'dist');
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json',
  };
  return types[ext] || 'application/octet-stream';
}

function startFrontendServer() {
  const distPath = getFrontendDistPath();
  if (!fs.existsSync(path.join(distPath, 'index.html'))) {
    throw new Error('Frontend build is missing. Run npm run build:frontend before starting SanzzOS desktop.');
  }

  frontendServer = http.createServer((req, res) => {
    const rawUrl = decodeURIComponent((req.url || '/').split('?')[0]);
    const safeUrl = rawUrl.replace(/^\/+/, '');
    const requestedPath = path.normalize(path.join(distPath, safeUrl));
    const isInsideDist = requestedPath.startsWith(distPath);
    const filePath = isInsideDist && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()
      ? requestedPath
      : path.join(distPath, 'index.html');

    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve, reject) => {
    frontendServer.once('error', reject);
    frontendServer.listen(FRONTEND_PORT, '127.0.0.1', resolve);
  });
}

async function startBackendServer() {
  loadDesktopEnv();
  const existingBackend = await isBackendReachable();
  if (existingBackend) {
    console.log(`SanzzOS using existing backend on port ${BACKEND_PORT}`);
    return;
  }

  const backendAppPath = path.join(getAppRoot(), 'backend', 'build', 'app.js');
  if (!fs.existsSync(backendAppPath)) {
    throw new Error('Backend build is missing. Run npm run build:backend before starting SanzzOS desktop.');
  }

  const backendModule = await import(pathToFileURL(backendAppPath).href);
  const expressApp = backendModule.default;
  backendServer = expressApp.listen(BACKEND_PORT, () => {
    ownsBackendServer = true;
    console.log(`SanzzOS backend started on port ${BACKEND_PORT}`);
    console.log(`Groq configured: ${Boolean(process.env.GROQ_API_KEY?.trim())}`);
  });

  return new Promise((resolve, reject) => {
    backendServer.once('listening', resolve);
    backendServer.once('error', reject);
  });
}

async function isBackendReachable() {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${BACKEND_PORT}/api/health`, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const ok = await isBackendReachable();
      if (ok) return;
    } catch {
      // keep waiting
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

function createWindow() {
  const iconPath = isDev
    ? path.join(getAppRoot(), 'frontend', 'public', 'icons', 'icon-512.png')
    : path.join(process.resourcesPath, 'icon.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    title: APP_NAME,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#060611',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(`http://127.0.0.1:${FRONTEND_PORT}`);
}

async function shutdown() {
  if (frontendServer) {
    frontendServer.close();
    frontendServer = null;
  }
  if (backendServer && ownsBackendServer) {
    backendServer.close();
    backendServer = null;
    ownsBackendServer = false;
  }
}

app.whenReady().then(async () => {
  app.setName(APP_NAME);
  try {
    await startBackendServer();
    await waitForBackend();
    await startFrontendServer();
    createWindow();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    dialog.showErrorBox(`${APP_NAME} startup failed`, message);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('before-quit', () => {
  shutdown();
});

app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
});
