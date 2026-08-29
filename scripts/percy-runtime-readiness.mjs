#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { diagnosePercySnapshots } from './percy-state-doctor.mjs';

const DEFAULT_MAX_AGE_HOURS = 24;

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function pushBlocker(blockers, code, detail) {
  blockers.push({ code, detail });
}

function diagnoseResourceHardStops(runtime, blockers) {
  const freeBytes = runtime.disk?.free_bytes;
  const diskHardStopBytes = runtime.disk?.hard_stop_free_bytes;
  if (!finiteNumber(freeBytes) || freeBytes < 0 || !finiteNumber(diskHardStopBytes) || diskHardStopBytes <= 0) {
    pushBlocker(blockers, 'DISK_EVIDENCE_INVALID', 'free_bytes must be non-negative and hard_stop_free_bytes must be positive');
  } else if (freeBytes < diskHardStopBytes) {
    pushBlocker(blockers, 'DISK_HARD_STOP', `${freeBytes} free bytes is below hard stop ${diskHardStopBytes}`);
  }

  const physicalBytes = runtime.memory?.physical_bytes;
  const availableBytes = runtime.memory?.available_bytes;
  const memoryHardStopBytes = runtime.memory?.hard_stop_available_bytes;
  if (
    !finiteNumber(physicalBytes) || physicalBytes <= 0 ||
    !finiteNumber(availableBytes) || availableBytes < 0 || availableBytes > physicalBytes ||
    !finiteNumber(memoryHardStopBytes) || memoryHardStopBytes <= 0 || memoryHardStopBytes > physicalBytes
  ) {
    pushBlocker(
      blockers,
      'MEMORY_EVIDENCE_INVALID',
      'physical_bytes must be positive; available_bytes and hard_stop_available_bytes must be within physical memory',
    );
  } else if (availableBytes < memoryHardStopBytes) {
    pushBlocker(
      blockers,
      'MEMORY_HARD_STOP',
      `${availableBytes} available bytes is below hard stop ${memoryHardStopBytes}`,
    );
  }

  const swapUsedBytes = runtime.memory?.swap_used_bytes;
  const swapHardStopBytes = runtime.memory?.hard_stop_swap_used_bytes;
  if (!finiteNumber(swapUsedBytes) || swapUsedBytes < 0 || !finiteNumber(swapHardStopBytes) || swapHardStopBytes <= 0) {
    pushBlocker(
      blockers,
      'SWAP_EVIDENCE_INVALID',
      'swap_used_bytes must be non-negative and hard_stop_swap_used_bytes must be positive',
    );
  } else if (swapUsedBytes >= swapHardStopBytes) {
    pushBlocker(
      blockers,
      'SWAP_HARD_STOP',
      `${swapUsedBytes} swap-used bytes reached hard stop ${swapHardStopBytes}`,
    );
  }

  return {
    disk: {
      freeBytes: finiteNumber(freeBytes) ? freeBytes : null,
      hardStopFreeBytes: finiteNumber(diskHardStopBytes) ? diskHardStopBytes : null,
    },
    memory: {
      physicalBytes: finiteNumber(physicalBytes) ? physicalBytes : null,
      availableBytes: finiteNumber(availableBytes) ? availableBytes : null,
      hardStopAvailableBytes: finiteNumber(memoryHardStopBytes) ? memoryHardStopBytes : null,
      swapUsedBytes: finiteNumber(swapUsedBytes) ? swapUsedBytes : null,
      hardStopSwapUsedBytes: finiteNumber(swapHardStopBytes) ? swapHardStopBytes : null,
    },
  };
}

export function diagnosePercyRuntimeReadiness({
  state,
  queue,
  blockers: blockerSnapshot,
  runtime,
  now = new Date(),
  maxAgeHours = DEFAULT_MAX_AGE_HOURS,
} = {}) {
  const durable = diagnosePercySnapshots({ state, queue, blockers: blockerSnapshot, now, maxAgeHours });
  const blockers = [];
  const warnings = [...durable.warnings];

  if (durable.verdict === 'INVALID') {
    pushBlocker(blockers, 'INVALID_DURABLE_STATE', durable.errors.join('; '));
  }
  if (durable.freshness.status !== 'FRESH') {
    pushBlocker(blockers, 'STALE_DURABLE_STATE', `freshness=${durable.freshness.status}`);
  }

  if (!runtime || typeof runtime !== 'object') {
    pushBlocker(blockers, 'MISSING_RUNTIME_EVIDENCE', 'runtime evidence JSON is required');
    return { verdict: 'BLOCKED_RUNTIME_EVIDENCE', blockers, warnings, durable, runtimeEvidence: false };
  }

  if (runtime.schema_version !== 1) {
    pushBlocker(blockers, 'UNSUPPORTED_RUNTIME_SCHEMA', `expected 1, received ${String(runtime.schema_version)}`);
  }
  if (runtime.source?.available !== true) {
    pushBlocker(blockers, 'RUNTIME_SOURCE_UNAVAILABLE', 'runtime source checkout was not verified as available');
  }
  if (typeof runtime.source?.head !== 'string' || !runtime.source.head.trim()) {
    pushBlocker(blockers, 'RUNTIME_HEAD_UNKNOWN', 'runtime source HEAD is required');
  }

  const processState = runtime.process?.state;
  if (processState !== 'RUNNING') {
    pushBlocker(blockers, 'WORKER_NOT_RUNNING', `process state=${String(processState ?? 'UNKNOWN')}`);
  }
  if (!Number.isInteger(runtime.process?.pid) || runtime.process.pid <= 0) {
    pushBlocker(blockers, 'WORKER_PID_INVALID', 'positive worker pid is required');
  }
  if (typeof runtime.process?.command !== 'string' || !runtime.process.command.trim()) {
    pushBlocker(blockers, 'WORKER_COMMAND_UNKNOWN', 'worker command is required');
  }

  if (runtime.database?.reachable !== true) {
    pushBlocker(blockers, 'DATABASE_UNREACHABLE', 'control database must be reachable');
  }
  if (runtime.database?.migration_state !== 'CURRENT') {
    pushBlocker(blockers, 'DATABASE_SCHEMA_NOT_CURRENT', `migration_state=${String(runtime.database?.migration_state ?? 'UNKNOWN')}`);
  }
  if (runtime.queue?.persistent !== true) {
    pushBlocker(blockers, 'QUEUE_NOT_PERSISTENT', 'task queue persistence must be verified');
  }
  if (runtime.heartbeat?.fresh !== true) {
    pushBlocker(blockers, 'HEARTBEAT_STALE', 'worker heartbeat must be fresh');
  }

  const resources = diagnoseResourceHardStops(runtime, blockers);

  const providerStates = Array.isArray(runtime.providers) ? runtime.providers : [];
  if (!providerStates.length) warnings.push('no provider availability evidence supplied');
  for (const provider of providerStates.filter((provider) => provider?.required === true && provider?.available !== true)) {
    pushBlocker(blockers, 'REQUIRED_PROVIDER_UNAVAILABLE', String(provider?.name ?? 'unknown-provider'));
  }

  const runtimeEvidence = blockers.every((item) => ![
    'MISSING_RUNTIME_EVIDENCE', 'UNSUPPORTED_RUNTIME_SCHEMA', 'RUNTIME_SOURCE_UNAVAILABLE', 'RUNTIME_HEAD_UNKNOWN',
    'WORKER_NOT_RUNNING', 'WORKER_PID_INVALID', 'WORKER_COMMAND_UNKNOWN', 'DATABASE_UNREACHABLE',
    'DATABASE_SCHEMA_NOT_CURRENT', 'QUEUE_NOT_PERSISTENT', 'HEARTBEAT_STALE', 'DISK_EVIDENCE_INVALID',
    'DISK_HARD_STOP', 'MEMORY_EVIDENCE_INVALID', 'MEMORY_HARD_STOP', 'SWAP_EVIDENCE_INVALID', 'SWAP_HARD_STOP',
    'REQUIRED_PROVIDER_UNAVAILABLE',
  ].includes(item.code));

  return {
    verdict: blockers.length ? 'BLOCKED_RUNTIME_EVIDENCE' : 'READY_TO_RESUME',
    blockers,
    warnings,
    durable,
    runtimeEvidence,
    runtime: {
      sourceHead: runtime.source?.head ?? null,
      processState: processState ?? 'UNKNOWN',
      pid: runtime.process?.pid ?? null,
      databaseReachable: runtime.database?.reachable === true,
      migrationState: runtime.database?.migration_state ?? 'UNKNOWN',
      queuePersistent: runtime.queue?.persistent === true,
      heartbeatFresh: runtime.heartbeat?.fresh === true,
      ...resources,
    },
  };
}

export function exitCodeForRuntimeReadiness(diagnosis) {
  return diagnosis.verdict === 'READY_TO_RESUME' ? 0 : 2;
}

async function readJson(path) {
  return JSON.parse(await readFile(resolve(path), 'utf8'));
}

function readArgValue(prefix) {
  const arg = process.argv.find((value) => value.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

async function run() {
  const runtimePath = readArgValue('--runtime-evidence=');
  const maxAgeRaw = readArgValue('--max-age-hours=');
  const maxAgeHours = maxAgeRaw === null ? DEFAULT_MAX_AGE_HOURS : Number(maxAgeRaw);
  if (!Number.isFinite(maxAgeHours) || maxAgeHours < 0) throw new Error('--max-age-hours must be a non-negative number');

  const [state, queue, blockerSnapshot, runtime] = await Promise.all([
    readJson('.percy/state.json'),
    readJson('.percy/task_queue.json'),
    readJson('.percy/blockers.json'),
    runtimePath ? readJson(runtimePath) : Promise.resolve(null),
  ]);

  const diagnosis = diagnosePercyRuntimeReadiness({ state, queue, blockers: blockerSnapshot, runtime, maxAgeHours });
  console.log(JSON.stringify(diagnosis, null, 2));
  process.exitCode = exitCodeForRuntimeReadiness(diagnosis);
}

const invoked = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invoked) {
  run().catch((error) => {
    console.error(`[percy-runtime-readiness] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
