import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkpointsDir = new URL('../portfolio/checkpoints/', import.meta.url);
const currentPointer = (await readFile(new URL('CURRENT', checkpointsDir), 'utf8')).trim();
const checkpointUrl = new URL(currentPointer, checkpointsDir);
const checkpoint = JSON.parse(await readFile(checkpointUrl, 'utf8'));
const byId = new Map(checkpoint.finish_lines.map((item) => [item.id, item]));

const portfolioStatuses = new Set(['DONE', 'PARTIAL', 'BLOCKED', 'INVALID', 'UNKNOWN']);
const workerStatuses = new Set(['WORKING', 'VERIFYING', 'BLOCKED', 'IDLE', 'FAILED', 'FINISHED', 'UNKNOWN']);

test('CURRENT resolves exactly one versioned canonical command checkpoint', () => {
  assert.match(currentPointer, /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.json$/i);
  assert.ok(!currentPointer.includes('/') && !currentPointer.includes('\\'));
  assert.ok(Number.isFinite(Date.parse(checkpoint.as_of)), 'checkpoint as_of must be parseable');
});

test('command checkpoint covers all five finish lines with portfolio statuses', () => {
  assert.deepEqual(
    new Set(checkpoint.finish_lines.map((item) => item.id)),
    new Set(['percy', 'project2424', 'vertexed', 'financemeta', 'the-bu1ld']),
  );

  for (const item of checkpoint.finish_lines) {
    assert.ok(portfolioStatuses.has(item.status), `${item.id} must use the portfolio status enum`);
    assert.ok(item.evidence.length > 0, `${item.id} must retain evidence`);
    if (item.status === 'DONE') {
      assert.ok(item.evidence.length >= 2, `${item.id} DONE needs durable evidence`);
      assert.equal(item.blockers.length, 0, `${item.id} DONE cannot retain blockers`);
    }
  }
});

test('current product release blockers remain explicit', () => {
  const vertexed = byId.get('vertexed');
  const financeMeta = byId.get('financemeta');
  const bu1ld = byId.get('the-bu1ld');

  assert.equal(vertexed.status, 'PARTIAL');
  assert.equal(vertexed.classification, 'LIVE_VERIFICATION_REQUIRED');
  assert.equal(vertexed.real_user_journey_verified, false);
  assert.match(vertexed.blockers.join(' '), /production.*(SHA|Vercel)|Vercel.*production/i);

  assert.equal(financeMeta.status, 'BLOCKED');
  assert.equal(financeMeta.classification, 'LOCAL_ONLY');
  assert.equal(financeMeta.real_user_journey_verified, false);
  assert.match(financeMeta.blockers.join(' '), /(privilege|role).*escalat|escalat.*(privilege|role)/i);

  assert.equal(bu1ld.status, 'PARTIAL');
  assert.equal(bu1ld.classification, 'STAGING_READY');
  assert.equal(bu1ld.real_user_journey_verified, false);
  assert.match(bu1ld.blockers.join(' '), /#104|target write|hydration/i);

  assert.equal(checkpoint.truth_guards.build_pass_is_not_launch_ready, true);
  assert.equal(checkpoint.truth_guards.launch_ready_requires_real_user_journey, true);
});

test('future product completion cannot be achieved by relabeling', () => {
  for (const id of ['vertexed', 'financemeta', 'the-bu1ld']) {
    const product = byId.get(id);
    if (['LAUNCH_READY', 'DEPLOYED_VERIFIED'].includes(product.classification)) {
      assert.equal(product.status, 'DONE');
      assert.equal(product.real_user_journey_verified, true);
      assert.equal(product.blockers.length, 0);
      assert.ok(product.evidence.length >= 2);
    }
  }
});

test('Project 2424 remains below RESEARCH_COMPLETE until restoration and independent reproduction are evidenced', () => {
  const project2424 = byId.get('project2424');
  assert.equal(project2424.status, 'BLOCKED');
  assert.equal(project2424.classification, 'ENGINEERING_INCOMPLETE');
  assert.equal(project2424.independent_reproduction_verified, false);
  assert.match(project2424.blockers.join(' '), /canonical.*restor|restor.*canonical/i);
  assert.match(project2424.blockers.join(' '), /independent.*reproduc|reproduc.*independent/i);

  if (project2424.classification === 'RESEARCH_COMPLETE') {
    assert.equal(project2424.status, 'DONE');
    assert.equal(project2424.independent_reproduction_verified, true);
    assert.equal(project2424.blockers.length, 0);
  }
});

test('Percy fails closed while DB compatibility and runtime liveness are unverified', () => {
  const percy = byId.get('percy');
  assert.equal(percy.status, 'BLOCKED');
  assert.equal(percy.runtime_liveness_verified, false);
  assert.match(percy.evidence.join(' '), /no such column: title/i);
  assert.match(percy.evidence.join(' '), /only zsh/i);

  if (percy.classification === 'HEALTHY' || percy.status === 'DONE') {
    assert.equal(percy.runtime_liveness_verified, true);
    assert.equal(percy.blockers.length, 0);
  }
});

test('all eight Percy lanes use worker runtime statuses and isolated scopes', () => {
  const expected = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'));
  const lanes = checkpoint.agents.map((agent) => agent.lane);
  assert.equal(lanes.length, 8);
  assert.equal(new Set(lanes).size, 8);
  assert.deepEqual([...lanes].sort(), expected);

  for (const agent of checkpoint.agents) {
    assert.ok(workerStatuses.has(agent.current_status), `lane ${agent.lane} has invalid worker runtime status`);
    assert.ok(agent.allocation.length > 20, `lane ${agent.lane} needs an executable allocation`);
    assert.ok(agent.write_scope.length > 0, `lane ${agent.lane} needs an isolated write scope`);
    assert.ok(agent.must_not_overlap.length > 0, `lane ${agent.lane} needs collision boundaries`);
  }

  assert.equal(checkpoint.agents.find((agent) => agent.lane === '01').current_status, 'VERIFYING');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '03').current_status, 'VERIFYING');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '04').current_status, 'BLOCKED');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '06').current_status, 'UNKNOWN');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '07').current_status, 'WORKING');
  assert.equal(checkpoint.agents.find((agent) => agent.lane === '08').current_status, 'VERIFYING');
});

test('command center keeps exactly ten live globally ordered actions', () => {
  assert.equal(checkpoint.top_actions.length, 10);
  assert.match(checkpoint.top_actions[0], /Percy.*snapshot|snapshot.*Percy/i);
  assert.match(checkpoint.top_actions[1], /Bu1LD.*#104|#104.*Bu1LD/i);
  assert.match(checkpoint.top_actions[2], /VertexED.*Vercel|Vercel.*VertexED/i);
  assert.match(checkpoint.top_actions[4], /FinanceMeta.*privilege|privilege.*FinanceMeta/i);
  assert.match(checkpoint.top_actions[7], /LAM-JEPA.*#10|#10.*LAM-JEPA/i);
  assert.match(checkpoint.top_actions[9], /independent QA.*#98|#98.*independent QA/i);
});

test('truth guards remain enabled', () => {
  for (const value of Object.values(checkpoint.truth_guards)) assert.equal(value, true);
});
