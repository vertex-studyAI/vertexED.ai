import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkpointsDir = new URL('../portfolio/checkpoints/', import.meta.url);
const currentPointer = (await readFile(new URL('CURRENT', checkpointsDir), 'utf8')).trim();
const checkpointUrl = new URL(currentPointer, checkpointsDir);
const checkpoint = JSON.parse(await readFile(checkpointUrl, 'utf8'));
const byId = new Map(checkpoint.finish_lines.map((item) => [item.id, item]));

const allowedStatuses = new Set(['DONE', 'PARTIAL', 'BLOCKED', 'INVALID', 'UNKNOWN']);
const combinedText = (item) => [...(item.evidence || []), ...(item.blockers || []), item.next_action || ''].join(' ');

test('CURRENT resolves exactly one versioned canonical command checkpoint', () => {
  assert.match(
    currentPointer,
    /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.json$/i,
    'CURRENT must name one versioned checkpoint file',
  );
  assert.ok(!currentPointer.includes('/') && !currentPointer.includes('\\'), 'CURRENT must not escape the checkpoint directory');
  assert.ok(Number.isFinite(Date.parse(checkpoint.as_of)), 'checkpoint as_of must be an ISO-like parseable timestamp');
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
  assert.equal(vertexed.real_user_journey_verified, false);
  assert.equal(vertexed.deployed_sha_verified, false);
  assert.match(combinedText(vertexed), /(authenticated.*(production|golden journey)|(production|golden journey).*authenticated|saved.*artifact.*return|return.*saved.*artifact)/i);

  assert.equal(financeMeta.status, 'BLOCKED');
  assert.equal(financeMeta.classification, 'CERTIFIED_UNAPPLIED');
  assert.equal(financeMeta.real_user_journey_verified, false);
  assert.match(combinedText(financeMeta), /(privilege|role|authorization)/i);
  assert.match(combinedText(financeMeta), /(escalat|denial|harden|member)/i);
  assert.match(combinedText(financeMeta), /(apply|canonical target|unapplied)/i);

  assert.equal(bu1ld.status, 'BLOCKED');
  assert.equal(bu1ld.classification, 'STAGING_READY_CERTIFIED_UNAPPLIED');
  assert.equal(bu1ld.real_user_journey_verified, false);
  assert.match(combinedText(bu1ld), /(hydration|deployment|canonical target|artifact)/i);
  assert.match(combinedText(bu1ld), /(apply|unapplied|canonical target)/i);

  assert.equal(checkpoint.truth_guards.build_pass_is_not_launch_ready, true);
  assert.equal(checkpoint.truth_guards.launch_ready_requires_real_user_journey, true);
});

test('Project 2424 remains below RESEARCH_COMPLETE until restoration and independent reproduction are evidenced', () => {
  const project2424 = byId.get('project2424');
  assert.equal(project2424.status, 'BLOCKED');
  assert.equal(project2424.classification, 'ENGINEERING_INCOMPLETE');
  assert.equal(project2424.independent_reproduction_verified, false);
  assert.match(combinedText(project2424), /canonical.*restor|restor.*canonical/i);
  assert.match(combinedText(project2424), /baseline.*reproduc|reproduc.*baseline/i);
  assert.equal(checkpoint.truth_guards.research_complete_requires_independent_reproduction, true);
});

test('Percy cannot be called healthy without fresh runtime evidence', () => {
  const percy = byId.get('percy');
  assert.equal(percy.status, 'BLOCKED');
  assert.equal(percy.runtime_liveness_verified, false);
  assert.match(combinedText(percy), /(heartbeat|lease|worker liveness)/i);
  assert.match(combinedText(percy), /(snapshot|schema|DB compatibility|preflight)/i);
  assert.equal(checkpoint.truth_guards.unknown_is_required_when_current_runtime_evidence_is_unavailable, true);
});

test('all eight Percy worker lanes have unique explicit allocations', () => {
  const expected = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'));
  const lanes = checkpoint.agents.map((agent) => agent.lane);
  assert.equal(lanes.length, 8);
  assert.equal(new Set(lanes).size, 8);
  assert.deepEqual([...lanes].sort(), expected);

  for (const agent of checkpoint.agents) {
    assert.ok(typeof agent.role === 'string' && agent.role.length > 0, `lane ${agent.lane} needs a role`);
    assert.ok(typeof agent.allocation === 'string' && agent.allocation.length > 20, `lane ${agent.lane} needs an exact task`);
    assert.equal(agent.current_status, 'IDLE', `lane ${agent.lane} must not be represented as executing without runtime evidence`);
  }

  assert.equal(checkpoint.coordinator.lane, '00');
  assert.equal(checkpoint.coordinator.runtime_status, 'UNKNOWN');
  assert.match(checkpoint.coordinator.truth_boundary, /does not prove a live Percy coordinator process/i);

  const independentQa = checkpoint.agents.find((agent) => agent.lane === '08');
  assert.match(independentQa.allocation, /reproduce immutable claims/i);
});

test('command center maintains a bounded globally ordered closure queue', () => {
  assert.ok(checkpoint.top_actions.length >= 8 && checkpoint.top_actions.length <= 12, 'closure queue must remain focused');
  assert.equal(new Set(checkpoint.top_actions).size, checkpoint.top_actions.length, 'closure queue actions must be unique');
  assert.match(checkpoint.top_actions[0], /Percy/i);
  assert.match(checkpoint.top_actions[0], /(snapshot|schema|liveness|preflight)/i);
  assert.match(checkpoint.top_actions[1], /VertexED/i);
  assert.match(checkpoint.top_actions[1], /(production identity|authenticated|golden journey)/i);
  assert.match(checkpoint.top_actions[2], /FinanceMeta/i);
  assert.match(checkpoint.top_actions[2], /(role|privilege|authorization|overlay)/i);
  assert.match(checkpoint.top_actions[3], /Bu1LD/i);
  assert.match(checkpoint.top_actions[3], /(deployment|hydration|apply|artifact)/i);
  assert.match(checkpoint.top_actions.at(-1), /Coordinator/i);
});
