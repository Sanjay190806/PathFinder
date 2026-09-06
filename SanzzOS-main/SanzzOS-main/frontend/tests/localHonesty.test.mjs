import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const careerStore = readFileSync(join(root, 'src/app/store/useCareerStore.ts'), 'utf8');
const migrations = readFileSync(join(root, 'src/app/store/migrations.ts'), 'utf8');
const placementService = readFileSync(join(root, 'src/services/placementService.ts'), 'utf8');
const topCommandStrip = readFileSync(join(root, 'src/components/dashboard/TopCommandStrip.tsx'), 'utf8');
const commandHero = readFileSync(join(root, 'src/components/dashboard/CommandHeroPanel.tsx'), 'utf8');
const topbar = readFileSync(join(root, 'src/components/layout/Topbar.tsx'), 'utf8');
const recommendations = readFileSync(join(root, 'src/services/adaptiveRecommendationService.ts'), 'utf8');
const smartPlanner = readFileSync(join(root, 'src/services/smartPlannerService.ts'), 'utf8');

test('career store starts with empty real-data defaults', () => {
  assert.match(careerStore, /projects: \{\}/);
  assert.match(careerStore, /atsScore: 0/);
  assert.match(careerStore, /version: 142/);
  assert.doesNotMatch(careerStore, /atsScore: 70/);
});

test('career migration removes seeded demo projects and scores', () => {
  assert.match(migrations, /resetSeededCareerDefaults/);
  assert.match(migrations, /next\.projects = \{\}/);
  assert.match(migrations, /atsScore:\s*0/);
});

test('placement OS no longer creates fake application readiness', () => {
  assert.match(placementService, /applications: \[\]/);
  assert.match(placementService, /onePage: false/);
  assert.doesNotMatch(placementService, /priority === 'high' \? 'preparing'/);
});

test('dashboard removes commander wording from main greeting surfaces', () => {
  assert.doesNotMatch(topCommandStrip, /Commander/);
  assert.doesNotMatch(commandHero, /Commander/);
});

test('topbar checks localhost API health directly', () => {
  assert.match(topbar, /checkBackendHealth/);
  assert.match(topbar, /setBackendOnline\(status\.online\)/);
});

test('recommendations and planner do not inject named demo projects', () => {
  assert.doesNotMatch(recommendations, /CareSync AI README|SmartEdu AI/);
  assert.match(smartPlanner, /summary\.projects\.length > 0/);
  assert.doesNotMatch(smartPlanner, /Improve CareSync AI, SmartEdu AI/);
});
