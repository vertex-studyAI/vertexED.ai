import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkpointUrl = new URL('../portfolio/checkpoints/2026-08-05-execution.json', import.meta.url);
const reportUrl = new URL('../portfolio/checkpoints/2026-08-05-execution.md', import.meta.url);
const checkpoint = JSON.parse(await readFile(checkpointUrl, 'utf8'));
const report = await readFile(reportUrl, 'utf8');

test('execution checkpoint preserves the product and research truth boundary', () => {
  assert.equal(checkpoint.as_of, '2026-08-05');
  assert.equal(checkpoint.summary.active_products, 3);
  assert.equal(checkpoint.summary.active_research, 0);

  const project2424 = checkpoint.research.find((project) => project.name === 'Project 2424 / Typhon');
  assert.ok(project2424, 'Project 2424 must remain represented');
  assert.equal(project2424.state, 'BLOCKED');
  assert.match(project2424.claim_boundary, /No benchmark.*novelty claim is upgraded/i);
});

test('FinanceMeta checkpoint distinguishes certification from target publication', () => {
  const financeMeta = checkpoint.products.find((product) => product.name === 'FinanceMeta');
  assert.ok(financeMeta, 'FinanceMeta must remain represented');
  assert.equal(financeMeta.certification, 'passed');
  assert.equal(financeMeta.target_modified, false);
  assert.match(financeMeta.blockers.join(' '), /403/);
  assert.ok(financeMeta.evidence.includes('merged PR 57'));
});

test('Bu1LD checkpoint limits monitoring claims to public route availability', () => {
  const bu1ld = checkpoint.products.find((product) => product.name === 'The Bu1LD');
  assert.ok(bu1ld, 'The Bu1LD must remain represented');
  assert.equal(bu1ld.public_route_availability, 'verified');
  assert.equal(bu1ld.authenticated_release, 'blocked');
  assert.ok(bu1ld.evidence.includes('monitor run 31019722714'));
});

test('human checkpoint contains durable evidence and explicit external dependencies', () => {
  for (const marker of [
    'merge commit `473ac1f75104137762b9120b519c1669f4f83dca`',
    'merge commit `132ed55104548b9a97448ebde739b40a5eb0c3d1`',
    'artifact `8936058991`',
    'restore_project2424_to_inkling.sh --verify --keep-local-package',
  ]) {
    assert.match(report, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
