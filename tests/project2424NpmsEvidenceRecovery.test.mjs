import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateNpmsRecovery } from '../portfolio/project2424/projects/T2424-0019/src/recovery_gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.join(
  here,
  '..',
  'portfolio',
  'project2424',
  'projects',
  'T2424-0019',
  'evidence',
  'recovered_experiment_report.json',
);
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

function mutateFinding(id, patch) {
  return report.negative_findings.map((finding) =>
    finding.id === id ? { ...finding, ...patch } : finding,
  );
}

test('recovered NPMS report validates without inflating completion', () => {
  const summary = validateNpmsRecovery(report);
  assert.equal(summary.canonicalProjectId, 'T2424-0019');
  assert.equal(summary.recoveredProjectId, 'MODEL-NPMS');
  assert.equal(summary.testsPassedInRecoveredBundle, 17);
  assert.equal(summary.compactRuns, 15);
  assert.equal(summary.ablationRecords, 36);
  assert.equal(summary.robustnessRecords, 45);
  assert.equal(summary.certifiedComplete, false);
  assert.equal(summary.externalBenchmarkExecuted, false);
  assert.equal(summary.sourceMigrationComplete, false);
});

test('external benchmark status cannot be promoted without evidence', () => {
  assert.throws(
    () => validateNpmsRecovery({ ...report, external_benchmark_executed: true }),
    /must remain false/,
  );
});

test('source migration cannot be silently marked complete', () => {
  assert.throws(
    () => validateNpmsRecovery({ ...report, source_migration_complete: true }),
    /must remain false until canonical source migration occurs/,
  );
});

test('matched-eigenvalue metric defect must remain explicit', () => {
  const negative_findings = mutateFinding('NPMS-N004', {
    required_boundary: 'PRESERVE',
    finding: 'A generic implementation note with no mode-matching limitation.',
  });
  assert.throws(
    () => validateNpmsRecovery({ ...report, negative_findings }),
    /PRESERVE_METRIC_DEFECT|matched-eigenvalue metric defect/,
  );
});

test('conjugate-group truncation limitation must remain explicit', () => {
  const negative_findings = mutateFinding('NPMS-N005', {
    required_boundary: 'PRESERVE',
    finding: 'A generic truncation note with no grouped-mode limitation.',
  });
  assert.throws(
    () => validateNpmsRecovery({ ...report, negative_findings }),
    /PRESERVE_IMPLEMENTATION_LIMITATION|conjugate-group/,
  );
});

test('frequency response cannot be upgraded to a full transfer function', () => {
  const negative_findings = mutateFinding('NPMS-N006', {
    required_boundary: 'PRESERVE',
    finding: 'Frequency analysis is reported without an interpretation limitation.',
  });
  assert.throws(
    () => validateNpmsRecovery({ ...report, negative_findings }),
    /PRESERVE_INTERPRETATION_LIMIT|frequency-response/,
  );
});

test('NPMS identity must remain diagnostic rather than generic forecasting', () => {
  assert.throws(
    () => validateNpmsRecovery({ ...report, identity_boundary: 'generic forecasting architecture' }),
    /must preserve NPMS as a diagnostic/,
  );
});

test('canonical aggregate metrics are preserved numerically', () => {
  const summary = validateNpmsRecovery(report);
  assert.equal(summary.compactMeanEigenvalueMae, 0.21398422742689097);
  assert.equal(summary.compactMeanTargetPredictionMse, 0.029106375131836094);
  assert.equal(summary.negativeFindingsPreserved, 6);
});
