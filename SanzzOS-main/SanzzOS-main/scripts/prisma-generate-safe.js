const { spawnSync } = require('node:child_process');
const path = require('node:path');
const process = require('node:process');

const root = process.cwd();
const backendDir = path.join(root, 'backend');

console.log('Prisma generate safe mode');
console.log('This command runs Prisma from backend/ so backend/.env is loaded.');
console.log('Before running, stop any backend dev server that may be holding the Prisma query engine DLL.');

if (process.platform === 'win32') {
  const tasklist = spawnSync('tasklist', ['/FI', 'IMAGENAME eq node.exe'], { encoding: 'utf8' });
  if (tasklist.status === 0 && tasklist.stdout.includes('node.exe')) {
    console.log('\nDetected running node.exe processes. If Prisma generate fails with EPERM, stop backend/dev Node processes first.');
  }
}

const result = spawnSync('npx', ['prisma', 'generate'], {
  cwd: backendDir,
  stdio: 'pipe',
  shell: process.platform === 'win32',
  encoding: 'utf8',
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status !== 0) {
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (/EPERM|query_engine-windows\.dll\.node/i.test(output)) {
    console.error('\nWindows Prisma EPERM recovery steps:');
    console.error('1. Stop backend dev/start processes and any terminal running Prisma client code.');
    console.error('2. Close editors or terminals watching node_modules/.prisma if needed.');
    console.error('3. Re-run: npm run prisma:generate:safe');
    console.error('4. If it is still locked, manually run: taskkill /IM node.exe /F');
    console.error('5. As a last resort, reboot Windows and rerun this command.');
  }
  process.exit(result.status || 1);
}

console.log('\nPrisma generate completed successfully.');
