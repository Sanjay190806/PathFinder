import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const registrySource = readFileSync(join(root, 'src/services/backup/backupRegistry.ts'), 'utf8');
const navigationSource = readFileSync(join(root, 'src/utils/navigation.ts'), 'utf8');

test('backup registry registers mock interview and company intelligence keys', () => {
  const keys = [
    'sanzz_os_mock_interview_v1',
    'sanzz_os_interview_questions_v1',
    'sanzz_os_communication_practice_v1',
    'sanzz_os_project_explanation_practice_v1',
    'sanzz_os_company_intelligence_v1',
    'sanzz_os_company_prep_plans_v1',
    'sanzz_os_company_readiness_v1',
    'sanzz_os_oa_attempts_v1',
    'sanzz_os_placement_strategy_v1',
  ];
  for (const key of keys) {
    assert.match(registrySource, new RegExp(`'${key}'`), `missing key: ${key}`);
  }
});

test('backup schema version is upgraded to 5', () => {
  assert.match(registrySource, /BACKUP_SCHEMA_VERSION = 5/);
});

test('navigation maps path to section for placements OS', () => {
  assert.match(navigationSource, /'mock_interview_os': '\/mock-interview-os'/);
  assert.match(navigationSource, /'company_intelligence': '\/company-intelligence'/);
});

test('default questions file exists and parses', () => {
  const qSource = readFileSync(join(root, 'src/data/defaultInterviewQuestions.ts'), 'utf8');
  assert.match(qSource, /DEFAULT_INTERVIEW_QUESTIONS/);
  assert.match(qSource, /Tell me about yourself/);
});

test('default company profiles exists and parses', () => {
  const compSource = readFileSync(join(root, 'src/data/defaultCompanyProfiles.ts'), 'utf8');
  assert.match(compSource, /DEFAULT_COMPANY_PROFILES/);
  assert.match(compSource, /Zoho/);
  assert.match(compSource, /Fractal Analytics/);
});
