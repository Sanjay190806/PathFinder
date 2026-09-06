import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registrySource = readFileSync(join(root, 'src/services/backup/backupRegistry.ts'), 'utf8');
const navigationSource = readFileSync(join(root, 'src/utils/navigation.ts'), 'utf8');
const parserSource = readFileSync(join(root, 'src/utils/commandParser.ts'), 'utf8');

test('backup registry registers all 11 new portfolio & mentor keys', () => {
  const keys = [
    'sanzz_os_portfolio_os_v1',
    'sanzz_os_public_portfolio_snapshots_v1',
    'sanzz_os_github_os_v1',
    'sanzz_os_linkedin_drafts_v1',
    'sanzz_os_ai_mentor_v3',
    'sanzz_os_mentor_reviews_v1',
    'sanzz_os_automation_rules_v1',
    'sanzz_os_automation_runs_v1',
    'sanzz_os_mentor_missions_v1',
    'sanzz_os_portfolio_settings_v1',
    'sanzz_os_ai_mentor_settings_v1',
  ];
  for (const key of keys) {
    assert.match(registrySource, new RegExp(`'${key}'`), `missing key: ${key}`);
  }
});

test('backup schema version is upgraded to 5', () => {
  assert.match(registrySource, /BACKUP_SCHEMA_VERSION = 5/);
});

test('navigation maps path to section for portfolio and mentor OS', () => {
  assert.match(navigationSource, /'portfolio_os': '\/portfolio-os'/);
  assert.match(navigationSource, /'ai_mentor': '\/ai-mentor'/);
});

test('commandParser parses offline actions for portfolio and mentor OS', () => {
  assert.match(parserSource, /'showPortfolioOS'/);
  assert.match(parserSource, /'showAIMentor'/);
  assert.match(parserSource, /'runAutomationCheck'/);
});
