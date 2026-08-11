import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  recommendPrerequisiteAware,
  simulatePolicy,
  validateLearningGraph,
} from '../portfolio/project2424/projects/T2424-0040/src/core.mjs';
import { frozenFixture } from '../portfolio/project2424/projects/T2424-0040/experiment/run.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = path.join(repoRoot, 'portfolio/project2424/projects/T2424-0040');

test('frozen queue identity maps T2424-0040 to FinanceMeta Learning Graph', () => {
  const queue = fs
    .readFileSync(path.join(repoRoot, 'portfolio/project2424/FIRST_100_QUEUE.ndjson'), 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const entry = queue.find((item) => item.task_id === 'T2424-0040');
  assert.ok(entry);
  assert.equal(entry.project_id, 'P2424-0040');
  assert.equal(entry.project, 'FinanceMeta Learning Graph');
});

test('graph validation fails closed on missing prerequisites and cycles', () => {
  assert.throws(
    () => validateLearningGraph([
      { id: 'a', prerequisites: ['missing'], utility: 1, difficulty: 1 },
    ]),
    /references missing prerequisite missing/,
  );

  assert.throws(
    () => validateLearningGraph([
      { id: 'a', prerequisites: ['b'], utility: 1, difficulty: 1 },
      { id: 'b', prerequisites: ['a'], utility: 1, difficulty: 1 },
    ]),
    /contains a cycle/,
  );
});

test('prerequisite-aware frozen policy has zero violations while utility-only negative control violates ordering', () => {
  const aware = simulatePolicy(frozenFixture.nodes, {
    policy: 'prerequisite-aware',
    threshold: frozenFixture.threshold,
    steps: frozenFixture.steps,
  });
  const baseline = simulatePolicy(frozenFixture.nodes, {
    policy: 'utility-only',
    threshold: frozenFixture.threshold,
    steps: frozenFixture.steps,
  });

  assert.deepEqual(
    aware.selections.map((selection) => selection.conceptId),
    ['budgeting', 'diversification', 'time_value', 'capm', 'bonds', 'options'],
  );
  assert.equal(aware.violatingSelections, 0);
  assert.equal(aware.unmetPrerequisiteEdges, 0);
  assert.equal(aware.completedConcepts, 6);

  assert.deepEqual(
    baseline.selections.map((selection) => selection.conceptId),
    ['options', 'capm', 'bonds', 'diversification', 'time_value', 'budgeting'],
  );
  assert.equal(baseline.violatingSelections, 5);
  assert.equal(baseline.unmetPrerequisiteEdges, 7);
  assert.equal(baseline.completedConcepts, 6);
});

test('partial mastery changes eligibility without bypassing declared prerequisites', () => {
  const selected = recommendPrerequisiteAware(
    frozenFixture.nodes,
    { budgeting: 1, time_value: 0, bonds: 0, diversification: 1, capm: 0, options: 0 },
    frozenFixture.threshold,
  );
  assert.equal(selected?.id, 'time_value');
});

test('documented experiment command reproduces the checked-in raw result exactly', () => {
  const runner = path.join(projectRoot, 'experiment/run.mjs');
  const stdout = execFileSync(process.execPath, [runner], { encoding: 'utf8' });
  const reproduced = JSON.parse(stdout);
  const retained = JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'evidence/results.json'), 'utf8'),
  );
  assert.deepEqual(reproduced, retained);
});
