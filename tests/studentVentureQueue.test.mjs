import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const queueUrl = new URL('../portfolio/opportunities/2026-08-05-student-venture-queue.json', import.meta.url);
const queue = JSON.parse(await readFile(queueUrl, 'utf8'));

test('venture queue remains focused and current-dated', () => {
  assert.equal(queue.last_verified, '2026-08-05');
  assert.equal(queue.active_target_limit, 2);
  assert.equal(queue.active_targets.length, 2);
  assert.ok(queue.active_targets.length <= queue.active_target_limit);
});

test('active targets are global, age-compatible, and mapped to active products', () => {
  const expected = new Map([
    ['Diamond Challenge 2027', 'VertexED.ai'],
    ['Blue Ocean Student Entrepreneur Competition 2027', 'FinanceMeta'],
  ]);

  for (const target of queue.active_targets) {
    assert.equal(target.portfolio_candidate, expected.get(target.name));
    assert.match(target.eligibility.geography, /global/i);
    assert.match(target.eligibility.age, /14-18/);
    assert.match(target.official_url, /^https:\/\//);
    assert.ok(Date.parse(target.deadline) > Date.parse('2026-08-05T00:00:00Z'));
    assert.ok(target.required_materials.length >= 5);
    assert.ok(target.evidence_rules.length >= 3);
  }
});

test('queue excludes ineligible or forced applications', () => {
  const exclusions = new Map(queue.excluded_after_verification.map((entry) => [entry.name, entry.reason]));
  assert.match(exclusions.get('Regeneron Science Talent Search 2027') || '', /last year of secondary school/i);
  assert.match(exclusions.get('MIT THINK 2026-27') || '', /no current 2026-27 application window is verified/i);
  assert.match(exclusions.get('The Earth Prize 2027') || '', /no verified environmental-sustainability product/i);
});
