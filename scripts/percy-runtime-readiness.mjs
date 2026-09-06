#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { classifyPercyProcess } from './percy-process-liveness.mjs';
import { diagnosePercySnapshots } from './percy-state-doctor.mjs';

const DEFAULT_MAX_AGE_HOURS = 24;
const RUNTIME_FUTURE_SKEW_MS = 5 * 60 * 1000;
const STRICT_UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const STRICT_GIT_SHA = /^[0-9a-f]{40}$/;

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function pushBlocker(blockers, code, detail) {
  blockers.push({ code, detail });
}

function diagnoseRuntimeFreshness(runtime, now, maxAgeHours, blockers) {
  const observedAt = runtime.as_of;
  if (typeof observedAt !== 'string' || !observedAt.trim()) {
    pushBlocker(blockers, 'RUNTIME_TIMESTAMP_MISSING', 'runtime evidence requires canonical UTC as_of timestamp');
    return { observedAt: null, ageHours: null, maxAgeHours, futureSkewToleranceMinutes: 5 };
  }

  const normalized = observedAt.trim();
  const observedMs = Date.parse(normalized);
  if (
    !STRICT_UTC_TIMESTAMP.test(normalized) ||
    !Number.isFinite(observedMs) ||
    new Date(observedMs).toISOString() !== normalized
  ) {
    pushBlocker(
      blockers,
      'RUNTIME_TIMESTAMP_INVALID',
      'runtime as_of must be a real canonical UTC timestamp in YYYY-MM-DDTHH:mm:ss.sssZ form',
    );
    return { observedAt: normalized, ageHours: null, maxAgeHours, futureSkewToleranceMinutes: 5 };
  }

  const nowMs = now instanceof Date ? now.getTime() : Number.NaN;
  if (!Number.isFinite(nowMs)) {
    pushBlocker(blockers, 'RUNTIME_NOW_INVALID', 'readiness evaluation time must be a valid Date');
    return { observedAt: normalized, ageHours: null, maxAgeHours, futureSkewToleranceMinutes: 5 };
  }

  const ageMs = nowMs - observedMs;
  const ageHours = ageMs / (60 * 60 * 1000);
  if (ageMs < -RUNTIME_FUTURE_SKEW_MS) {
    pushBlocker(
      blockers,
      'RUNTIME_TIMESTAMP_FUTURE',
      `runtime evidence is ${Math.abs(ageHours).toFixed(3)} hours in the future; tolerance is 5 minutes`,
    );
  } else if (ageMs > maxAgeHours * 60 * 60 * 1000) {
    pushBlocker(
      blockers,
      'RUNTIME_EVIDENCE_STALE',
      `runtime evidence age ${ageHours.toFixed(3)} hours exceeds maxAgeHours=${maxAgeHours}`,
    );
  }

  return {
    observedAt: normalized,
    ageHours,
    maxAgeHours,
    futureSkewToleranceMinutes: 5,
  };
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

  const runtimeFreshness = diagnoseRuntimeFreshness(runtime, now, maxAgeHours, blockers);

  if (runtime.schema_version !== 1) {
    pushBlocker(blockers, 'UNSUPPORTED_RUNTIME_SCHEMA', `expected 1, received ${String(runtime.schema_version)}`);
  }
  if (runtime.source?.available !== true) {
    pushBlocker(blockers, 'RUNTIME_SOURCE_UNAVAILABLE', 'runtime source checkout was not verified as available');
  }
  if (typeof runtime.source?.head !== 'string' || !runtime.source.head.trim()) {
    pushBlocker(blockers, 'RUNTIME_HEAD_UNKNOWN', 'runtime source HEAD is required');
  } else if (runtime.source.head !== runtime.source.head.trim() || !STRICT_GIT_SHA.test(runtime.source.head)) {
    pushBlocker(
      blockers,
      'RUNTIME_HEAD_NOT_IMMUTABLE',
      'runtime source HEAD must be an exact lowercase 40-character Git commit SHA with no surrounding whitespace',
    );
  }

  const processClassification = classifyPercyProcess(runtime.process);
  const processState = processClassification.state;
  if (processState !== 'RUNNING') {
    pushBlocker(
      blockers,
      'WORKER_NOT_RUNNING',
      `process state=${String(processState)}; reported=${String(processClassification.reportedState)}`,
    );
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
    'MISSING_RUNTIME_EVIDENCE', 'RUNTIME_TIMESTAMP_MISSING', 'RUNTIME_TIMESTAMP_INVALID', 'RUNTIME_NOW_INVALID',
    'RUNTIME_TIMESTAMP_FUTURE', 'RUNTIME_EVIDENCE_STALE', 'UNSUPPORTED_RUNTIME_SCHEMA', 'RUNTIME_SOURCE_UNAVAILABLE',
    'RUNTIME_HEAD_UNKNOWN', 'RUNTIME_HEAD_NOT_IMMUTABLE', 'WORKER_NOT_RUNNING', 'WORKER_PID_INVALID', 'WORKER_COMMAND_UNKNOWN',
    'DATABASE_UNREACHABLE', 'DATABASE_SCHEMA_NOT_CURRENT', 'QUEUE_NOT_PERSISTENT', 'HEARTBEAT_STALE',
    'DISK_EVIDENCE_INVALID', 'DISK_HARD_STOP', 'MEMORY_EVIDENCE_INVALID', 'MEMORY_HARD_STOP',
    'SWAP_EVIDENCE_INVALID', 'SWAP_HARD_STOP', 'REQUIRED_PROVIDER_UNAVAILABLE',
  ].includes(item.code));

  return {
    verdict: blockers.length ? 'BLOCKED_RUNTIME_EVIDENCE' : 'READY_TO_RESUME',
    blockers,
    warnings,
    durable,
    runtimeEvidence,
    runtime: {
      observedAt: runtimeFreshness.observedAt,
      evidenceAgeHours: runtimeFreshness.ageHours,
      maxAgeHours: runtimeFreshness.maxAgeHours,
      futureSkewToleranceMinutes: runtimeFreshness.futureSkewToleranceMinutes,
      sourceHead: runtime.source?.head ?? null,
      processState,
      reportedProcessState: processClassification.reportedState,
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
