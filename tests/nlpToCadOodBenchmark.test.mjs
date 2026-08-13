import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { evaluateOodBenchmark } from '../portfolio/project2424/projects/T2424-0037/benchmark/ood_evaluate.mjs';

const dataPath = new URL('../portfolio/project2424/projects/T2424-0037/benchmark/ood_prompts_v1.json', import.meta.url);

function boundedRate(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

test('held-out NeuroCAD benchmark remains frozen at 20 cases', async () => {
  const rows = JSON.parse(await fs.readFile(dataPath, 'utf8'));
  assert.equal(rows.length, 20);
  assert.equal(rows.filter((row) => row.kind === 'valid').length, 12);
  assert.equal(rows.filter((row) => row.kind === 'invalid').length, 8);
  assert.equal(new Set(rows.map((row) => row.id)).size, 20);
});

test('OOD evaluator reports both frozen systems without treating a negative scientific gate as CI failure', async () => {
  const result = await evaluateOodBenchmark();
  assert.equal(result.protocol, 'T2424-0037-held-out-linguistic-template-v1');
  assert.equal(result.cases.total, 20);
  assert.equal(result.method.rows.length, 20);
  assert.equal(result.baseline.rows.length, 20);
  for (const system of [result.method, result.baseline]) {
    assert.ok(boundedRate(system.metrics.valid_exact_geometry_accuracy));
    assert.ok(boundedRate(system.metrics.invalid_rejection_accuracy));
    assert.ok(boundedRate(system.metrics.overall_success));
    assert.ok(Number.isInteger(system.metrics.accepted_invalid_count));
  }
  assert.ok(Number.isFinite(result.delta_overall));
  assert.ok(['PASS_HELD_OUT_TEMPLATE_GATE', 'FAIL_HELD_OUT_TEMPLATE_GATE'].includes(result.verdict));
  assert.deepEqual(result.frozen_criteria, {
    valid_exact_geometry_accuracy_min: 0.80,
    invalid_rejection_accuracy_min: 0.80,
    delta_overall_min: 0.15
  });
});
