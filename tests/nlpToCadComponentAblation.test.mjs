import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateComponentAblation } from '../portfolio/project2424/projects/T2424-0037/benchmark/component_ablation_evaluate.mjs';

test('NeuroCAD component ablation preserves frozen diagnostic contract', async () => {
  const result = await evaluateComponentAblation();
  assert.equal(result.protocol, 'T2424-0037-neurocad-component-ablation-v2-20260814');
  assert.equal(result.protocol_status, 'frozen_before_first_execution');
  assert.deepEqual(result.cases, { total: 20, valid: 12, invalid: 8 });

  for (const key of ['method', 'direct', 'validated_direct']) {
    const system = result.systems[key];
    assert.equal(system.rows.length, 20);
    for (const metric of ['valid_exact_geometry_accuracy', 'invalid_rejection_accuracy', 'overall_success']) {
      assert.equal(Number.isFinite(system.metrics[metric]), true);
      assert.equal(system.metrics[metric] >= 0 && system.metrics[metric] <= 1, true);
    }
  }

  assert.equal(Number.isFinite(result.diagnostics.original_gap), true);
  assert.equal(Number.isFinite(result.diagnostics.remaining_gap), true);
  if (result.diagnostics.validation_recovery_fraction !== null) {
    assert.equal(Number.isFinite(result.diagnostics.validation_recovery_fraction), true);
  }
  assert.equal(
    ['VALIDATION_DOMINANT', 'PARSER_OR_TYPED_PATH_REMAINS_MATERIAL', 'MIXED_OR_UNRESOLVED'].includes(result.diagnostics.interpretation),
    true
  );
});
