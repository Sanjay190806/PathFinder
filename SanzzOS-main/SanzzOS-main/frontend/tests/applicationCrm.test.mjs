import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const crmUtils = readFileSync(join(root, 'src/utils/applicationCrmUtils.ts'), 'utf8');
const appTypes = readFileSync(join(root, 'src/types/applications.ts'), 'utf8');
const applicationsPage = readFileSync(join(root, 'src/pages/ApplicationsPage.tsx'), 'utf8');
const drawer = readFileSync(join(root, 'src/components/applications/ApplicationDrawer.tsx'), 'utf8');
const mobileDock = readFileSync(join(root, 'src/components/mobile/MobileApplicationDock.tsx'), 'utf8');
const todayPage = readFileSync(join(root, 'src/pages/TodayPage.tsx'), 'utf8');
const commandParser = readFileSync(join(root, 'src/utils/commandParser.ts'), 'utf8');
const commandExecutor = readFileSync(join(root, 'src/utils/commandExecutor.ts'), 'utf8');
const backupService = readFileSync(join(root, 'src/services/sync/backupService.ts'), 'utf8');

test('application CRM model includes local-first v2 fields', () => {
  for (const field of ['jobUrl', 'deadline', 'resumeVersion', 'jdText', 'referralContact', 'nextFollowUpDate', 'timeline', 'rounds']) {
    assert.match(appTypes, new RegExp(`${field}\\??:`), `missing ${field}`);
  }
});

test('application CRM utilities include reminders, prep, resume analytics, and backup nudge helpers', () => {
  for (const fn of ['getApplicationReminders', 'getCompanyPrepPlan', 'getResumeVersionMetrics', 'shouldShowWeeklyBackupReminder', 'markBackupExported']) {
    assert.match(crmUtils, new RegExp(`function ${fn}`), `missing ${fn}`);
  }
});

test('applications page exposes reminder center resume analytics and weekly backup prompt', () => {
  assert.match(applicationsPage, /Reminder Center/);
  assert.match(applicationsPage, /Resume Version Analytics/);
  assert.match(applicationsPage, /Weekly Backup/);
  assert.match(applicationsPage, /backupService\.exportData/);
});

test('application drawer exposes company prep dashboard', () => {
  assert.match(drawer, /Company Prep Dashboard/);
  assert.match(drawer, /getCompanyPrepPlan/);
});

test('mobile CRM dock is wired into Today page', () => {
  assert.match(mobileDock, /MobileApplicationDock/);
  assert.match(mobileDock, /getApplicationReminders/);
  assert.match(mobileDock, /backupService\.exportData/);
  assert.match(todayPage, /<MobileApplicationDock \/>/);
});

test('Shayla command path supports application follow-up and stale application checks', () => {
  assert.match(commandParser, /showApplicationFollowUps/);
  assert.match(commandParser, /showStaleApplications/);
  assert.match(commandExecutor, /case 'showApplicationFollowUps'/);
  assert.match(commandExecutor, /case 'showStaleApplications'/);
});

test('backup export records local backup timestamp', () => {
  assert.match(backupService, /markBackupExported/);
});
