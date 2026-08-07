import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkpointsDir = new URL('../portfolio/checkpoints/', import.meta.url);
const currentPointer = (await readFile(new URL('CURRENT', checkpointsDir), 'utf8')).trim();
const checkpointUrl = new URL(currentPointer, checkpointsDir);
const checkpoint = JSON.parse(await readFile(checkpointUrl, 'utf8'));
const byId = new Map(checkpoint.finish_lines.map((item) => [item.id, item]));

const allowedStatuses = new Set(['DONE', 'PARTIAL', 'BLOCKED', 'INVALID', 'UNKNOWN']);

test('CURRENT resolves exactly one canonical command checkpoint', () => {
  assert.equal(currentPointer, '2026-08-07-command.json');
  assert.equal(checkpoint.as_of, '2026-08-07T18:54:00+05:30');
});

test('command checkpoint covers every portfolio finish line with controlled statuses', () => {
  assert.deepEqual(
    new Set(checkpoint.finish_lines.map((item) => item.id)),
    new Set(['percy', 'project2424', 'vertexed', 'financemeta', 'the-bu1ld']),
  );

  for (const item of checkpoint.finish_lines) {
    assert.ok(allowedStatuses.has(item.status), `${item.id} status must use the command enum`);
    if (item.status === 'DONE') {
      assert.ok(item.evidence.length >= 2, `${item.id} cannot be DONE without evidence`);
      assert.equal(item.blockers.length, 0, `${item.id} cannot be DONE with blockers`);
    }
  }
});

test('known release blockers cannot be hidden behind passing builds', () => {
  const vertexed = byId.get('vertexed');
  const financeMeta = byId.get('financemeta');
  const bu1ld = byId.get('the-bu1ld');

  assert.equal(vertexed.status, 'PARTIAL');
  assert.equal(vertexed.classification, 'LIVE_VERIFICATION_REQUIRED');
  assert.match(vertexed.blockers.join(' '), /authenticated production golden journey/i);

  assert.equal(financeMeta.status, 'BLOCKED');
  assert.equal(financeMeta.classification, 'LOCAL_ONLY');
  assert.match(financeMeta.blockers.join(' '), /Privilege-escalation/i);

  assert.equal(bu1ld.status, 'BLOCKED');
  assert.equal(bu1ld.classification, 'STAGING_READY');
  assert.match(bu1ld.blockers.join(' '), /hydration\/deployment skew/i);

  assert.equal(checkpoint.truth_guards.build_pass_is_not_launch_ready, true);
  assert.equal(checkpoint.truth_guards.launch_ready_requires_real_user_journey, true);
});

test('Project 2424 remains below RESEARCH_COMPLETE until restoration and reproduction are evidenced', () => {
  const project2424 = byId.get('project2424');
  assert.equal(project2424.status, 'BLOCKED');
  assert.equal(project2424.classification, 'ENGINEERING_INCOMPLETE');
  assert.match(project2424.blockers.join(' '), /Canonical source restoration/i);
  assert.match(project2424.blockers.join(' '), /independently reproduced/i);
  assert.equal(checkpoint.truth_guards.research_complete_requires_independent_reproduction, true);
});

test('Percy cannot be called healthy without fresh runtime evidence', () => {
  const percy = byId.get('percy');
  assert.equal(percy.status, 'BLOCKED');
  assert.match(percy.blockers.join(' '), /heartbeat/i);
  assert.match(percy.next_action, /read-only Percy preflight/i);
  assert.equal(checkpoint.truth_guards.unknown_is_required_when_current_runtime_evidence_is_unavailable, true);
});

test('all eight Percy lanes have unique collision-safe allocations', () => {
  const expected = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'));
  const lanes = checkpoint.agents.map((agent) => agent.lane);
  assert.equal(lanes.length, 8);
  assert.equal(new Set(lanes).size, 8);
  assert.deepEqual([...lanes].sort(), expected);

  for (const agent of checkpoint.agents) {
    assert.ok(agent.allocation.length > 20, `lane ${agent.lane} needs an exact task`);
    assert.ok(agent.write_scope.length > 0, `lane ${agent.lane} needs an isolated write scope`);
    assert.ok(agent.must_not_overlap.length > 0, `lane ${agent.lane} needs an explicit collision boundary`);
  }

  const independentQa = checkpoint.agents.find((agent) => agent.lane === '08');
  assert.match(independentQa.allocation, /Independently reproduce/i);
  assert.match(independentQa.must_not_overlap.join(' '), /primary implementation ownership/i);
});

test('command center maintains exactly ten globally ordered next actions', () => {
  assert.equal(checkpoint.top_actions.length, 10);
  assert.match(checkpoint.top_actions[0], /Percy read-only system preflight/i);
  assert.match(checkpoint.top_actions[2], /FinanceMeta privilege escalation/i);
  assert.match(checkpoint.top_actions[3], /Bu1LD.*hydration skew/i);
});
