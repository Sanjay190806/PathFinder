import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registrySource = readFileSync(join(root, 'src/services/backup/backupRegistry.ts'), 'utf8');
const swSource = readFileSync(join(root, 'public/sw.js'), 'utf8');
const rootPkg = JSON.parse(readFileSync(join(root, '..', 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8'));

test('backup registry includes core module keys', () => {
  const required = [
    'sanju-career-os-persist',
    'sanzz_os_learning_os_v1',
    'sanzz_os_smart_planner_v1',
    'sanzz_os_placement_os_v1',
    'sanzz_os_ai_brain_v1',
    'sanju-interview-coach-v1',
  ];
  for (const key of required) {
    assert.match(registrySource, new RegExp(`'${key}'`), `missing ${key}`);
  }
});

test('backup schema version is 5', () => {
  assert.match(registrySource, /BACKUP_SCHEMA_VERSION = 5/);
});

test('backup export skips secret-like data', () => {
  assert.match(registrySource, /EXCLUDED_BACKUP_IDS = new Set\(\['aiSettings', 'preRestoreBackup'\]\)/);
  assert.match(registrySource, /detectSecretInStoredValue/);
  assert.match(registrySource, /\.env\|api\[_-\]\?key\|secret\|token\|password/);
});

test('service worker skips API caching', () => {
  assert.match(swSource, /\/api\//);
  assert.doesNotMatch(swSource, /cache\.put\(event\.request.*api/s);
});

test('root build script exists', () => {
  assert.equal(rootPkg.scripts.build, 'npm run build:all');
});

test('manifest is canonical webmanifest with png icons', () => {
  assert.equal(manifest.short_name, 'Career OS');
  assert.ok(manifest.icons.some((icon) => icon.src.endsWith('.png')));
});

test('cloud sync health route exists in backend routes', () => {
  const routes = readFileSync(join(root, '..', 'backend/src/routes/sync.routes.ts'), 'utf8');
  assert.match(routes, /\/sync\/health/);
  assert.match(routes, /\/sync\/push/);
  assert.match(routes, /\/sync\/pull/);
});

test('v1.7.2 root scripts route Prisma commands through backend', () => {
  assert.equal(rootPkg.version, '1.7.2');
  assert.equal(rootPkg.scripts['prisma:validate'], 'node scripts/prisma-validate-safe.js');
  assert.equal(rootPkg.scripts['prisma:generate:safe'], 'node scripts/prisma-generate-safe.js');
  assert.equal(rootPkg.scripts['db:doctor'], 'node scripts/db-doctor.js');
});

test('database error classifier maps common Prisma failures safely', () => {
  const source = readFileSync(join(root, '..', 'backend/src/utils/databaseError.ts'), 'utf8');
  assert.match(source, /invalid_credentials/);
  assert.match(source, /connection_refused/);
  assert.match(source, /database_not_found/);
  assert.match(source, /missing_database_url/);
  assert.doesNotMatch(source, /password:|DATABASE_URL.*password/i);
});

test('auth and cloud controllers handle database failures without crashing', () => {
  const authController = readFileSync(join(root, '..', 'backend/src/controllers/auth.controller.ts'), 'utf8');
  const cloudController = readFileSync(join(root, '..', 'backend/src/controllers/cloudSync.controller.ts'), 'utf8');
  assert.match(authController, /sendDatabaseUnavailable/);
  assert.match(authController, /handleAuthError/);
  assert.match(cloudController, /sendDatabaseUnavailable/);
  assert.match(cloudController, /handleCloudError/);
});

test('auth config route exposes provider availability', () => {
  const routes = readFileSync(join(root, '..', 'backend/src/routes/auth.routes.ts'), 'utf8');
  const controller = readFileSync(join(root, '..', 'backend/src/controllers/auth.controller.ts'), 'utf8');
  assert.match(routes, /\/auth\/config/);
  assert.match(controller, /providers/);
  assert.match(controller, /google: isGoogleConfigured/);
});
