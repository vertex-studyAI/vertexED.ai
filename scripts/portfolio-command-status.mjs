#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const checkpointUrl = new URL('../portfolio/checkpoints/2026-08-07-command.json', import.meta.url);
const allowedStatuses = new Set(['DONE', 'PARTIAL', 'BLOCKED', 'INVALID', 'UNKNOWN']);
const expectedFinishLines = new Set(['percy', 'project2424', 'vertexed', 'financemeta', 'the-bu1ld']);
const expectedLanes = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validate(checkpoint) {
  assert(checkpoint.schema_version === 1, 'unsupported command checkpoint schema');
  assert(typeof checkpoint.as_of === 'string' && checkpoint.as_of.length > 0, 'checkpoint timestamp is required');
  assert(Array.isArray(checkpoint.finish_lines), 'finish_lines must be an array');
  assert(Array.isArray(checkpoint.agents), 'agents must be an array');
  assert(Array.isArray(checkpoint.p0_blockers), 'p0_blockers must be an array');
  assert(Array.isArray(checkpoint.top_actions) && checkpoint.top_actions.length === 10, 'exactly 10 top actions are required');

  const seenFinishLines = new Set();
  for (const item of checkpoint.finish_lines) {
    assert(expectedFinishLines.has(item.id), `unexpected finish line: ${item.id}`);
    assert(!seenFinishLines.has(item.id), `duplicate finish line: ${item.id}`);
    seenFinishLines.add(item.id);
    assert(allowedStatuses.has(item.status), `${item.id} has invalid status ${item.status}`);
    assert(Array.isArray(item.evidence), `${item.id} evidence must be an array`);
    assert(Array.isArray(item.blockers), `${item.id} blockers must be an array`);
    assert(typeof item.next_action === 'string' && item.next_action.length > 0, `${item.id} needs a next action`);

    if (item.status === 'DONE') {
      assert(item.evidence.length >= 2, `${item.id} cannot be DONE without at least two evidence items`);
      assert(item.blockers.length === 0, `${item.id} cannot be DONE with open blockers`);
    }
  }
  assert(seenFinishLines.size === expectedFinishLines.size, 'all five portfolio finish lines must be represented');

  const project2424 = checkpoint.finish_lines.find((item) => item.id === 'project2424');
  assert(project2424, 'Project 2424 finish line is required');
  assert(
    !(project2424.classification === 'RESEARCH_COMPLETE' && project2424.status !== 'DONE'),
    'RESEARCH_COMPLETE requires DONE command status',
  );
  assert(
    project2424.classification !== 'RESEARCH_COMPLETE',
    'Project 2424 cannot be RESEARCH_COMPLETE while the August 7 command checkpoint records no accepted independent reproduction',
  );

  for (const id of ['vertexed', 'financemeta', 'the-bu1ld']) {
    const product = checkpoint.finish_lines.find((item) => item.id === id);
    assert(product, `${id} finish line is required`);
    if (['LAUNCH_READY', 'DEPLOYED_VERIFIED'].includes(product.classification)) {
      assert(product.status === 'DONE', `${id} launch classification requires DONE command status`);
      assert(product.blockers.length === 0, `${id} launch classification requires zero blockers`);
    }
  }

  const actualLanes = checkpoint.agents.map((agent) => agent.lane);
  assert(actualLanes.length === 8, 'exactly eight Percy allocations are required');
  assert(new Set(actualLanes).size === 8, 'Percy lane allocation must be unique');
  assert(
    expectedLanes.every((lane) => actualLanes.includes(lane)),
    'Percy allocation must cover lanes 01 through 08 exactly once',
  );

  for (const agent of checkpoint.agents) {
    assert(allowedStatuses.has(agent.current_status), `lane ${agent.lane} has invalid current status`);
    assert(typeof agent.allocation === 'string' && agent.allocation.length > 20, `lane ${agent.lane} needs an executable allocation`);
    assert(Array.isArray(agent.write_scope) && agent.write_scope.length > 0, `lane ${agent.lane} needs a write scope`);
    assert(Array.isArray(agent.must_not_overlap), `lane ${agent.lane} must declare collision boundaries`);
  }

  const p0Owners = new Set(checkpoint.p0_blockers.map((blocker) => blocker.owner_lane));
  for (const blocker of checkpoint.p0_blockers) {
    assert(expectedLanes.includes(blocker.owner_lane), `${blocker.id} has invalid owner lane`);
    assert(typeof blocker.acceptance === 'string' && blocker.acceptance.length > 20, `${blocker.id} needs acceptance criteria`);
  }
  assert(p0Owners.has('02') && p0Owners.has('03') && p0Owners.has('04'), 'P0 ownership must include FinanceMeta, Bu1LD and Percy lanes');

  const guards = checkpoint.truth_guards || {};
  for (const requiredGuard of [
    'done_requires_evidence',
    'research_complete_requires_independent_reproduction',
    'launch_ready_requires_real_user_journey',
    'build_pass_is_not_launch_ready',
    'plans_and_prompts_do_not_count_as_engineering_progress',
    'unknown_is_required_when_current_runtime_evidence_is_unavailable',
  ]) {
    assert(guards[requiredGuard] === true, `truth guard ${requiredGuard} must remain enabled`);
  }

  return checkpoint;
}

function printSummary(checkpoint) {
  console.log(`Portfolio command checkpoint: ${checkpoint.as_of}`);
  console.log(`Control commit: ${checkpoint.control_commit}`);
  console.log('');
  console.log('FINISH LINES');
  for (const item of checkpoint.finish_lines) {
    console.log(`${item.status.padEnd(8)} ${item.name.padEnd(14)} ${item.classification}`);
  }
  console.log('');
  console.log('P0 BLOCKERS');
  for (const blocker of checkpoint.p0_blockers) {
    console.log(`${blocker.id} -> lane ${blocker.owner_lane}: ${blocker.project}`);
  }
  console.log('');
  console.log('PERCY ALLOCATION');
  for (const agent of checkpoint.agents) {
    console.log(`${agent.lane} ${agent.role}: ${agent.allocation}`);
  }
}

try {
  const checkpoint = validate(JSON.parse(await readFile(checkpointUrl, 'utf8')));
  printSummary(checkpoint);
} catch (error) {
  console.error(`[portfolio-command] INVALID: ${error.message}`);
  process.exit(1);
}
