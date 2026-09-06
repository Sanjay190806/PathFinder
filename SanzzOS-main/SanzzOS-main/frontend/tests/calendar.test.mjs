import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registrySource = readFileSync(join(root, 'src/services/backup/backupRegistry.ts'), 'utf8');
const streakSource = readFileSync(join(root, 'src/utils/streakFreezeUtils.ts'), 'utf8');

test('backup registry registers calendar events and notification store keys', () => {
  assert.match(registrySource, /'calendarEvents'/, 'calendarEvents key should be registered');
  assert.match(registrySource, /'notificationStore'/, 'notificationStore key should be registered');
});

test('streak preservation logic checks rescueCompleted flag', () => {
  // Verify that streak calculations examine the rescueCompleted property
  assert.match(streakSource, /rescueCompleted === true/, 'streak calculation must check rescueCompleted');
});

test('calendar store has correct import path and persistence keys', () => {
  const storeSource = readFileSync(join(root, 'src/app/store/useCalendarStore.ts'), 'utf8');
  assert.match(storeSource, /sanzz_os_calendar_events_v1/, 'calendar events store key is correct');
});
