#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const checkpointsDir = new URL('../portfolio/checkpoints/', import.meta.url);
const currentPointerUrl = new URL('CURRENT', checkpointsDir);
const portfolioStatuses = new Set(['DONE', 'PARTIAL', 'BLOCKED', 'INVALID', 'UNKNOWN']);
const workerStatuses = new Set(['WORKING', 'VERIFYING', 'BLOCKED', 'IDLE', 'FAILED', 'FINISHED', 'UNKNOWN']);
const expectedFinishLines = new Set(['percy', 'project2424', 'vertexed', 'financemeta', 'the-bu1ld']);
const expectedLanes = Array.from({ length: 8 }, (_, index) => String(index + 1).padStart(2, '0'));
const productIds = ['vertexed', 'financemeta', 'the-bu1ld'];
const launchClassifications = new Set(['LAUNCH_READY', 'DEPLOYED_VERIFIED']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function loadCurrentCheckpoint() {
  const pointer = (await readFile(currentPointerUrl, 'utf8')).trim();
  assert(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.json$/i.test(pointer), 'CURRENT must contain one checkpoint filename');
  const checkpointUrl = new URL(pointer, checkpointsDir);
  return { pointer, checkpoint: JSON.parse(await readFile(checkpointUrl, 'utf8')) };
}

function validate(checkpoint) {
  assert([1, 2].includes(checkpoint.schema_version), 'unsupported command checkpoint schema');
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
    assert(portfolioStatuses.has(item.status), `${item.id} has invalid portfolio status ${item.status}`);
    assert(Array.isArray(item.evidence) && item.evidence.length > 0, `${item.id} needs evidence`);
    assert(Array.isArray(item.blockers), `${item.id} blockers must be an array`);
    assert(typeof item.next_action === 'string' && item.next_action.length > 0, `${item.id} needs a next action`);

    if (item.status === 'DONE') {
      assert(item.evidence.length >= 2, `${item.id} cannot be DONE without at least two evidence items`);
      assert(item.blockers.length === 0, `${item.id} cannot be DONE with open blockers`);
    }
  }
  assert(seenFinishLines.size === expectedFinishLines.size, 'all five portfolio finish lines must be represented');

  const percy = checkpoint.finish_lines.find((item) => item.id === 'percy');
  assert(percy, 'Percy finish line is required');
  if (percy.status === 'DONE' || percy.classification === 'HEALTHY') {
    assert(percy.runtime_liveness_verified === true, 'Percy HEALTHY/DONE requires verified runtime liveness');
    assert(percy.blockers.length === 0, 'Percy HEALTHY/DONE requires zero blockers');
  }

  const project2424 = checkpoint.finish_lines.find((item) => item.id === 'project2424');
  assert(project2424, 'Project 2424 finish line is required');
  if (project2424.classification === 'RESEARCH_COMPLETE') {
    assert(project2424.status === 'DONE', 'RESEARCH_COMPLETE requires DONE command status');
    assert(project2424.independent_reproduction_verified === true, 'RESEARCH_COMPLETE requires accepted independent reproduction');
    assert(project2424.blockers.length === 0, 'RESEARCH_COMPLETE requires zero blockers');
    assert(project2424.evidence.length >= 2, 'RESEARCH_COMPLETE requires durable evidence');
  }

  for (const id of productIds) {
    const product = checkpoint.finish_lines.find((item) => item.id === id);
    assert(product, `${id} finish line is required`);
    if (launchClassifications.has(product.classification)) {
      assert(product.status === 'DONE', `${id} launch classification requires DONE command status`);
      assert(product.real_user_journey_verified === true, `${id} launch classification requires a verified real-user journey`);
      assert(product.blockers.length === 0, `${id} launch classification requires zero blockers`);
      assert(product.evidence.length >= 2, `${id} launch classification requires durable evidence`);
    }
  }

  const lanes = checkpoint.agents.map((agent) => agent.lane);
  assert(lanes.length === 8, 'exactly eight Percy allocations are required');
  assert(new Set(lanes).size === 8, 'Percy lane allocation must be unique');
  assert(expectedLanes.every((lane) => lanes.includes(lane)), 'Percy allocation must cover lanes 01 through 08 exactly once');

  for (const agent of checkpoint.agents) {
    assert(workerStatuses.has(agent.current_status), `lane ${agent.lane} has invalid worker status ${agent.current_status}`);
    assert(typeof agent.allocation === 'string' && agent.allocation.length > 20, `lane ${agent.lane} needs an executable allocation`);
    assert(Array.isArray(agent.write_scope) && agent.write_scope.length > 0, `lane ${agent.lane} needs a write scope`);
    assert(Array.isArray(agent.must_not_overlap) && agent.must_not_overlap.length > 0, `lane ${agent.lane} needs explicit collision boundaries`);
  }

  const p0Ids = checkpoint.p0_blockers.map((blocker) => blocker.id);
  assert(new Set(p0Ids).size === p0Ids.length, 'P0 blocker ids must be unique');
  for (const blocker of checkpoint.p0_blockers) {
    assert(expectedLanes.includes(blocker.owner_lane), `${blocker.id} has invalid owner lane`);
    assert(typeof blocker.acceptance === 'string' && blocker.acceptance.length > 20, `${blocker.id} needs acceptance criteria`);
  }

  const guards = checkpoint.truth_guards || {};
  for (const requiredGuard of [
    'done_requires_evidence',
    'research_complete_requires_independent_reproduction',
    'launch_ready_requires_real_user_journey',
    'healthy_percy_requires_runtime_liveness',
    'build_pass_is_not_launch_ready',
    'plans_and_prompts_do_not_count_as_engineering_progress',
    'unknown_is_required_when_current_runtime_evidence_is_unavailable',
  ]) {
    assert(guards[requiredGuard] === true, `truth guard ${requiredGuard} must remain enabled`);
  }

  return checkpoint;
}

function printSummary(pointer, checkpoint) {
  console.log(`Portfolio command checkpoint: ${checkpoint.as_of}`);
  console.log(`Canonical checkpoint: ${pointer}`);
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
    console.log(`${agent.current_status.padEnd(9)} lane ${agent.lane} ${agent.role}: ${agent.allocation}`);
  }
}

try {
  const { pointer, checkpoint } = await loadCurrentCheckpoint();
  printSummary(pointer, validate(checkpoint));
} catch (error) {
  console.error(`[portfolio-command] INVALID: ${error.message}`);
  process.exit(1);
}
