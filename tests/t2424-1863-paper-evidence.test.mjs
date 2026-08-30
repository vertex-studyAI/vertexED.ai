import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../portfolio/new-projects/t2424-1863-local-diffusion-operator/paper/evidence/', import.meta.url);
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const sampleSd = (values) => {
  const average = mean(values);
  return Math.sqrt(values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1));
};
const close = (actual, expected, tolerance = 1e-15) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
};

test('T2424-1863 paper evidence is digest-bound and recomputes from all fixed seeds', async () => {
  const [rawBuffer, uncertaintyBuffer, manifestBuffer] = await Promise.all([
    readFile(new URL('raw_metrics.json', root)),
    readFile(new URL('uncertainty_metrics.json', root)),
    readFile(new URL('EVIDENCE_MANIFEST.json', root)),
  ]);
  const raw = JSON.parse(rawBuffer);
  const uncertainty = JSON.parse(uncertaintyBuffer);
  const manifest = JSON.parse(manifestBuffer);

  assert.equal(sha256(rawBuffer), manifest.files['raw_metrics.json'].sha256);
  assert.equal(sha256(uncertaintyBuffer), manifest.files['uncertainty_metrics.json'].sha256);
  assert.equal(manifest.artifact.id, 9720891119);
  assert.equal(manifest.artifact.workflow_run, 33273832236);
  assert.equal(manifest.artifact.workflow_head, 'abf8fdef9294e096ce364f6bfe8558fa3bd00439');
  assert.equal(manifest.artifact.archive_sha256, '481d366c7cabab099378aeb1347400e4d68f72a416213f409e000ae6e011d7c1');
  assert.equal(manifest.protocol_change, false);
  assert.equal(manifest.scientific_verdict, 'NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE');

  for (const condition of ['diffusion', 'zero_diffusion']) {
    const trials = raw[condition].trials;
    assert.deepEqual(trials.map(({ seed }) => seed), Array.from({ length: 20 }, (_, seed) => seed));
    assert.equal(uncertainty.conditions[condition].n, 20);

    for (const metric of ['learned_coefficient', 'persistence_rmse', 'operator_rmse', 'relative_improvement']) {
      const values = trials.map((trial) => trial[metric]);
      const retained = uncertainty.conditions[condition][metric];
      close(mean(values), retained.mean);
      close(Math.min(...values), retained.min);
      close(Math.max(...values), retained.max);
      close(sampleSd(values), retained.sample_sd);
    }
  }

  assert.ok(uncertainty.conditions.diffusion.relative_improvement.max < 0.75);
  assert.equal(uncertainty.protocol_change, false);
  assert.equal(uncertainty.reporting_only, true);
});
