import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkpointUrl = new URL('../portfolio/checkpoints/2026-08-05-execution.json', import.meta.url);
const reportUrl = new URL('../portfolio/checkpoints/2026-08-05-execution.md', import.meta.url);
const checkpoint = JSON.parse(await readFile(checkpointUrl, 'utf8'));
const report = await readFile(reportUrl, 'utf8');

test('execution checkpoint preserves product, deployment, and research truth boundaries', () => {
  assert.equal(checkpoint.schema_version, 2);
  assert.equal(checkpoint.as_of, '2026-08-05');
  assert.equal(checkpoint.summary.evidence_backed_deliverables, 7);
  assert.equal(checkpoint.summary.active_products, 3);
  assert.equal(checkpoint.summary.active_research, 0);
  assert.equal(checkpoint.summary.certified_research_artifacts, 1);

  const vertex = checkpoint.products.find((product) => product.name === 'VertexED.ai');
  assert.ok(vertex, 'VertexED.ai must remain represented');
  assert.equal(vertex.repository_release_gate, 'passed');
  assert.equal(vertex.latest_main_deployed, false);
  assert.equal(vertex.authenticated_release, 'blocked');
  assert.ok(vertex.evidence.includes('merged PR 76'));
  assert.ok(vertex.evidence.includes('merged PR 80'));
  assert.ok(vertex.evidence.includes('merged PR 77'));
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

test('FI-JEPA remains a certified unpublished synthetic artifact', () => {
  const fiJepa = checkpoint.research.find((project) => project.name === 'FI-JEPA');
  assert.ok(fiJepa, 'FI-JEPA must remain represented');
  assert.equal(fiJepa.state, 'CERTIFIED_ARTIFACT');
  assert.equal(fiJepa.target_modified, false);
  assert.match(fiJepa.claim_boundary, /No novelty.*real-market.*profitability/i);
  assert.ok(fiJepa.evidence.includes('merged PR 72'));
});

test('Project 2424 recovery safety can pass while restoration remains blocked', () => {
  const project2424 = checkpoint.research.find((project) => project.name === 'Project 2424 / Typhon');
  assert.ok(project2424, 'Project 2424 must remain represented');
  assert.equal(project2424.state, 'BLOCKED');
  assert.equal(project2424.safety_verification, 'passed');
  assert.match(project2424.claim_boundary, /No benchmark.*completion.*novelty claim is upgraded/i);
  assert.ok(project2424.evidence.includes('merged PR 81'));
});

test('human checkpoint contains current durable evidence and explicit dependencies', () => {
  for (const marker of [
    'merge commit `01f85e2c9f4824a0081d39a3fd5d9b11876dab75`',
    'merge commit `8cbbd9dbffa7cc0bf1b90eb3a86035afa0f85a78`',
    'merge commit `e0acbd48817e08d10ae3c486d72dafe785cc3d1f`',
    'artifact `8936630062`',
    'merge commit `473ac1f75104137762b9120b519c1669f4f83dca`',
    'merge commit `132ed55104548b9a97448ebde739b40a5eb0c3d1`',
    'merge commit `72c38b75ba7fafa6df0725f8ceacc51487b63335`',
    'merge commit `6458616b619554f9b332edaa8eddd50f5ffd2339`',
    'restore_project2424_to_inkling.sh --verify --keep-local-package',
  ]) {
    assert.match(report, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
