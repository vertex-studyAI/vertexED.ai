#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ITERATION_RE = /^PERCY-(\d{5})$/;
const DEFAULT_MAX_AGE_HOURS = 72;

function parseDate(value, label, errors) {
  const parsed = new Date(value);
  if (typeof value !== 'string' || Number.isNaN(parsed.getTime())) {
    errors.push(`${label} must be a valid timestamp`);
    return null;
  }
  return parsed;
}

function parseIteration(value, label, errors) {
  const match = typeof value === 'string' ? ITERATION_RE.exec(value) : null;
  if (!match) {
    errors.push(`${label} must match PERCY-00000 format`);
    return null;
  }
  return Number(match[1]);
}

function unique(values) {
  return new Set(values).size === values.length;
}

export function diagnosePercySnapshots({
  state,
  queue,
  blockers,
  now = new Date(),
  maxAgeHours = DEFAULT_MAX_AGE_HOURS,
} = {}) {
  const errors = [];
  const warnings = [];

  if (!state || typeof state !== 'object') errors.push('state snapshot is required');
  if (!queue || typeof queue !== 'object') errors.push('task queue snapshot is required');
  if (!blockers || typeof blockers !== 'object') errors.push('blocker snapshot is required');

  if (errors.length) {
    return {
      verdict: 'INVALID',
      errors,
      warnings,
      freshness: { status: 'UNKNOWN', ageHours: null, maxAgeHours },
      runtimeEvidence: false,
    };
  }

  for (const [label, snapshot] of [['state', state], ['queue', queue], ['blockers', blockers]]) {
    if (snapshot.schema_version !== 1) errors.push(`${label}.schema_version must equal 1`);
  }

  if (state.engine !== 'PERCY 16384X') {
    warnings.push(`unexpected Percy engine label: ${String(state.engine)}`);
  }

  if (!Number.isInteger(state.completed_iterations) || state.completed_iterations < 0) {
    errors.push('state.completed_iterations must be a non-negative integer');
  }

  const lastIteration = parseIteration(state.last_completed_iteration, 'state.last_completed_iteration', errors);
  const nextIteration = parseIteration(state.next_iteration, 'state.next_iteration', errors);

  if (Number.isInteger(state.completed_iterations) && lastIteration !== null && state.completed_iterations !== lastIteration) {
    errors.push(`completed iteration count ${state.completed_iterations} does not match ${state.last_completed_iteration}`);
  }
  if (lastIteration !== null && nextIteration !== null && nextIteration !== lastIteration + 1) {
    errors.push(`${state.next_iteration} must immediately follow ${state.last_completed_iteration}`);
  }

  const tasks = Array.isArray(queue.tasks) ? queue.tasks : [];
  if (!Array.isArray(queue.tasks)) errors.push('queue.tasks must be an array');
  const taskRanks = tasks.map((task) => task?.rank);
  if (taskRanks.some((rank) => !Number.isInteger(rank) || rank < 1)) {
    errors.push('every queue task rank must be a positive integer');
  }
  if (!unique(taskRanks)) errors.push('queue task ranks must be unique');
  const sortedRanks = [...taskRanks].sort((a, b) => a - b);
  for (let i = 0; i < sortedRanks.length; i += 1) {
    if (sortedRanks[i] !== i + 1) {
      warnings.push('queue task ranks are not contiguous from 1');
      break;
    }
  }

  const blockerList = Array.isArray(blockers.blockers) ? blockers.blockers : [];
  if (!Array.isArray(blockers.blockers)) errors.push('blockers.blockers must be an array');
  const blockerIds = blockerList.map((blocker) => blocker?.id);
  if (blockerIds.some((id) => typeof id !== 'string' || !id.trim())) {
    errors.push('every blocker must have a non-empty string id');
  }
  if (!unique(blockerIds)) errors.push('blocker ids must be unique');

  const stateTime = parseDate(state.run_started_at, 'state.run_started_at', errors);
  const queueTime = parseDate(queue.as_of, 'queue.as_of', errors);
  const blockerTime = parseDate(blockers.as_of, 'blockers.as_of', errors);
  const nowDate = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(nowDate.getTime())) errors.push('now must be a valid Date');

  const times = [stateTime, queueTime, blockerTime].filter(Boolean);
  const newestSnapshot = times.length ? new Date(Math.max(...times.map((date) => date.getTime()))) : null;
  const oldestSnapshot = times.length ? new Date(Math.min(...times.map((date) => date.getTime()))) : null;

  if (newestSnapshot && oldestSnapshot) {
    const skewHours = (newestSnapshot.getTime() - oldestSnapshot.getTime()) / 3_600_000;
    if (skewHours > 1) warnings.push(`Percy snapshots disagree by ${skewHours.toFixed(2)} hours`);
  }

  let ageHours = null;
  let freshnessStatus = 'UNKNOWN';
  if (newestSnapshot && !Number.isNaN(nowDate.getTime())) {
    ageHours = (nowDate.getTime() - newestSnapshot.getTime()) / 3_600_000;
    if (ageHours < -1) {
      errors.push('Percy snapshot timestamp is materially in the future');
    } else if (ageHours > maxAgeHours) {
      freshnessStatus = 'STALE';
      warnings.push(`Percy durable state is stale by policy: ${ageHours.toFixed(1)}h old > ${maxAgeHours}h`);
    } else {
      freshnessStatus = 'FRESH';
    }
  }

  const verdict = errors.length
    ? 'INVALID'
    : freshnessStatus === 'STALE'
      ? 'STALE_SNAPSHOT'
      : 'VALID_SNAPSHOT';

  return {
    verdict,
    errors,
    warnings,
    freshness: {
      status: freshnessStatus,
      ageHours: ageHours === null ? null : Number(ageHours.toFixed(2)),
      maxAgeHours,
      newestSnapshotAt: newestSnapshot?.toISOString() ?? null,
    },
    iteration: {
      completed: state.completed_iterations,
      last: state.last_completed_iteration,
      next: state.next_iteration,
    },
    queue: {
      taskCount: tasks.length,
      topTask: tasks[0]?.action ?? null,
    },
    blockers: {
      count: blockerList.length,
      open: blockerList.filter((blocker) => blocker?.status === 'OPEN').length,
    },
    // These JSON files are durable control snapshots. They do not prove that a
    // worker, heartbeat, lease, process or local queue is alive right now.
    runtimeEvidence: false,
  };
}

export function exitCodeForDiagnosis(diagnosis, { requireFresh = false } = {}) {
  if (diagnosis.verdict === 'INVALID') return 1;
  if (requireFresh && diagnosis.freshness.status !== 'FRESH') return 2;
  return 0;
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(path), 'utf8'));
}

function readArgValue(prefix) {
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

async function run() {
  const requireFresh = process.argv.includes('--require-fresh');
  const maxAgeRaw = readArgValue('--max-age-hours=');
  const maxAgeHours = maxAgeRaw === null ? DEFAULT_MAX_AGE_HOURS : Number(maxAgeRaw);
  if (!Number.isFinite(maxAgeHours) || maxAgeHours < 0) {
    throw new Error('--max-age-hours must be a non-negative number');
  }

  const [state, queue, blockers] = await Promise.all([
    readJson('.percy/state.json'),
    readJson('.percy/task_queue.json'),
    readJson('.percy/blockers.json'),
  ]);
  const diagnosis = diagnosePercySnapshots({ state, queue, blockers, maxAgeHours });
  console.log(JSON.stringify(diagnosis, null, 2));
  process.exitCode = exitCodeForDiagnosis(diagnosis, { requireFresh });
}

const invoked = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invoked) {
  run().catch((error) => {
    console.error(`[percy-state-doctor] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
