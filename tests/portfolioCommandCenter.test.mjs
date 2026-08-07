import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkpointsDir = new URL('../portfolio/checkpoints/', import.meta.url);
const currentPointer = (await readFile(new URL('CURRENT', checkpointsDir), 'utf8')).trim();
const checkpointUrl = new URL(currentPointer, checkpointsDir);
const checkpoint = JSON.parse(await readFile(checkpointUrl, 'utf8'));
const byId = new Map(checkpoint.finish_lines.map((item) => [item.id, item]));

const allowedPortfolioStatuses = new Set(['DONE', 'PARTIAL', 'BLOCKED', 'INVALID', 'UNKNOWN']);
const allowedWorkerStatuses = new Set(['WORKING', 'VERIFYING', 'BLOCKED', 'IDLE', 'FAILED', 'FINISHED', 'UNKNOWN']);

test('CURRENT resolves the live command checkpoint', () => {
  assert.equal(currentPointer, '2026-08-07-command-live.json');
  assert.equal(checkpoint.as_of, '2026-08-07T19:15:00+05:30');
});

test('all five finish lines use controlled command statuses', () => {
  assert.deepEqual(
    new Set(checkpoint.finish_lines.map((item) => item.id)),
    new Set(['percy', 'project2424', 'vertexed', 'financemeta', 'the-bu1ld']),
  );
  for (const item of checkpoint.finish_lines) {
    assert.ok(allowedPortfolioStatuses.has(item.status), `${item.id} has an invalid portfolio status`);
    assert.ok(item.evidence.length > 0, `${item.id} needs evidence`);
    if (item.status === 'DONE') {
      assert.ok(item.evidence.length >= 2, `${item.id} DONE needs durable evidence`);
      assert.equal(item.blockers.length, 0, `${item.id} DONE cannot retain blockers`);
    }
  }
});

test('current product classifications preserve live release blockers', () => {
  const vertexed = byId.get('vertexed');
  const financeMeta = byId.get('financemeta');
  const bu1ld = byId.get('the-bu1ld');

  assert.equal(vertexed.status, 'PARTIAL');
  assert.equal(vertexed.classification, 'LIVE_VERIFICATION_REQUIRED');
  assert.equal(vertexed.real_user_journey_verified, false);
  assert.match(vertexed.blockers.join(' '), /production SHA|deployed SHA|production/i);

  assert.equal(financeMeta.status, 'BLOCKED');
  assert.equal(financeMeta.classification, 'LOCAL_ONLY');
  assert.equal(financeMeta.real_user_journey_verified, false);
  assert.match(financeMeta.blockers.join(' '), /Privilege escalation/i);

  assert.equal(bu1ld.status, 'PARTIAL');
  assert.equal(bu1ld.classification, 'STAGING_READY');
  assert.equal(bu1ld.real_user_journey_verified, false);
  assert.match(bu1ld.blockers.join(' '), /patches are not yet applied/i);
});

test('Project 2424 remains engineering-incomplete until restoration and reproduction are real', () => {
  const project2424 = byId.get('project2424');
  assert.equal(project2424.status, 'BLOCKED');
  assert.equal(project2424.classification, 'ENGINEERING_INCOMPLETE');
  assert.equal(project2424.independent_reproduction_verified, false);
  assert.match(project2424.blockers.join(' '), /Canonical restored repository/i);
});

test('Percy remains blocked while snapshot and worker liveness are unverified', () => {
  const percy = byId.get('percy');
  assert.equal(percy.status, 'BLOCKED');
  assert.equal(percy.classification, 'BLOCKED');
  assert.equal(percy.runtime_liveness_verified, false);
  assert.match(percy.evidence.join(' '), /no such column: title/i);
  assert.match(percy.evidence.join(' '), /only zsh/i);
});

test('future completion flags require real evidence, not relabeling', () => {
  for (const id of ['vertexed', 'financemeta', 'the-bu1ld']) {
    const product = byId.get(id);
    if (['LAUNCH_READY', 'DEPLOYED_VERIFIED'].includes(product.classification)) {
      assert.equal(product.status, 'DONE');
      assert.equal(product.real_user_journey_verified, true);
      assert.equal(product.blockers.length, 0);
    }
  }

  const project2424 = byId.get('project2424');
  if (project2424.classification === 'RESEARCH_COMPLETE') {
    assert.equal(project2424.status, 'DONE');
    assert.equal(project2424.independent_reproduction_verified, true);
    assert.equal(project2424.blockers.length, 0);
  }

  const percy = byId.get('percy');
  if (percy.classification === 'HEALTHY' || percy.status === 'DONE') {
    assert.equal(percy.runtime_liveness_verified, true);
    assert.equal(percy.blockers.length, 0);
  }
});

test('eight Percy lanes have valid runtime states and isolated ownership', () => {
  const expected = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'));
  const lanes = checkpoint.agents.map((agent) => agent.lane);
  assert.equal(checkpoint.agents.length, 8);
  assert.deepEqual([...lanes].sort(), expected);
  assert.equal(new Set(lanes).size, 8);

  for (const agent of checkpoint.agents) {
    assert.ok(allowedWorkerStatuses.has(agent.current_status), `lane ${agent.lane} has invalid worker state`);
    assert.ok(agent.allocation.length > 20, `lane ${agent.lane} needs an executable allocation`);
    assert.ok(agent.write_scope.length > 0, `lane ${agent.lane} needs a write scope`);
    assert.ok(agent.must_not_overlap.length > 0, `lane ${agent.lane} needs collision boundaries`);
  }

  assert.equal(checkpoint.agents.find((agent) => agent.lane === '01').current_status, 'VERIFYING');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '04').current_status, 'BLOCKED');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '07').current_status, 'WORKING');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '08').current_status, 'VERIFYING');
});

test('live command queue stays globally bounded to ten actions', () => {
  assert.equal(checkpoint.top_actions.length, 10);
  assert.match(checkpoint.top_actions[0], /Percy snapshot schema compatibility/i);
  assert.match(checkpoint.top_actions[1], /VertexED post-merge Vercel failures/i);
  assert.match(checkpoint.top_actions[3], /FinanceMeta privilege escalation/i);
  assert.match(checkpoint.top_actions[7], /LAM-JEPA issue #10/i);
  assert.match(checkpoint.top_actions[9], /issue #98/i);
});

test('truth guards remain enabled', () => {
  for (const value of Object.values(checkpoint.truth_guards)) assert.equal(value, true);
});
