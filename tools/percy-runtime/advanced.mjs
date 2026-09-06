import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { backup, DatabaseSync } from 'node:sqlite';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
const MAX_TIMER_MS = 2_147_483_647;

// Sub-second leases are useful in direct store tests, but they are too short for
// an event-loop-driven worker under scheduler/CI pressure. The worker loop uses
// this floor while the underlying PercyStore keeps its >=100 ms API so stale
// lease behavior can still be tested independently.
export const MIN_WORKER_LEASE_MS = 1_000;

function validateWorkerTimerCeiling(name, value) {
  if (!Number.isSafeInteger(value) || value > MAX_TIMER_MS) {
    throw new RangeError(`${name} must be a safe integer <= ${MAX_TIMER_MS}`);
  }
  return value;
}

export function parseClassLimits(spec = process.env.PERCY_CLASS_LIMITS ?? 'default=2') {
  const limits = new Map();
  for (const raw of String(spec).split(',')) {
    const item = raw.trim();
    if (!item) continue;
    const separator = item.indexOf('=');
    if (
      separator <= 0 ||
      separator === item.length - 1 ||
      item.indexOf('=', separator + 1) !== -1
    ) {
      throw new RangeError(`invalid class limit: ${item}`);
    }
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    const n = Number(value);
    if (!name || !value || !Number.isInteger(n) || n < 1 || n > 32) {
      throw new RangeError(`invalid class limit: ${item}`);
    }
    if (limits.has(name)) throw new RangeError(`duplicate class limit: ${name}`);
    limits.set(name, n);
  }
  if (!limits.has('default')) limits.set('default', 1);
  return limits;
}

function canonicalClassName(name = 'default') {
  const normalized = String(name ?? 'default').trim();
  return normalized || 'default';
}

function normalizeClassLimitMap(limits) {
  const normalized = new Map();
  for (const [rawName, rawLimit] of limits) {
    const name = String(rawName ?? '').trim();
    const limit = Number(rawLimit);
    if (!name || !Number.isInteger(limit) || limit < 1 || limit > 32) {
      throw new RangeError(`invalid class limit: ${String(rawName)}=${String(rawLimit)}`);
    }
    if (normalized.has(name)) throw new RangeError(`duplicate class limit: ${name}`);
    normalized.set(name, limit);
  }
  if (!normalized.has('default')) normalized.set('default', 1);
  return normalized;
}

export function payloadBytes(payload) {
  return Buffer.byteLength(JSON.stringify(payload ?? null), 'utf8');
}

export function validateSubmission({ kind = 'echo', payload = {}, maxAttempts = 3 } = {}, {
  allowedKinds = ['echo', 'sleep', 'fail'],
  maxPayloadBytes = Number(process.env.PERCY_MAX_PAYLOAD_BYTES ?? 64 * 1024),
} = {}) {
  if (!allowedKinds.includes(kind)) throw new Error(`task kind not allowed: ${kind}`);
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) throw new RangeError('maxAttempts must be in [1,20]');
  if (!Number.isInteger(maxPayloadBytes) || maxPayloadBytes < 1) throw new RangeError('maxPayloadBytes must be >=1');
  const bytes = payloadBytes(payload);
  if (bytes > maxPayloadBytes) throw new RangeError(`payload too large: ${bytes} > ${maxPayloadBytes}`);
  return { kind, payload, maxAttempts, payloadBytes: bytes };
}

export function safeSubmit(store, task, {
  maxReady = Number(process.env.PERCY_MAX_READY ?? 1000),
  maxPayloadBytes = Number(process.env.PERCY_MAX_PAYLOAD_BYTES ?? 64 * 1024),
  allowedKinds,
} = {}) {
  if (!Number.isInteger(maxReady) || maxReady < 1) throw new RangeError('maxReady must be >=1');
  const counts = store.counts();
  const ready = Number(counts.READY ?? 0);
  if (ready >= maxReady) throw new Error(`queue limit reached: READY=${ready}, maxReady=${maxReady}`);
  const checked = validateSubmission(task, { maxPayloadBytes, allowedKinds });
  const id = store.submit({ kind: checked.kind, payload: checked.payload, maxAttempts: checked.maxAttempts });
  return { id, payloadBytes: checked.payloadBytes };
}

function redactString(value) {
  return value
    .replace(/\b(authorization\s*[:=]\s*)(?:bearer\s+)?[^\s,;]+/gi, '$1[REDACTED]')
    .replace(/\b(bearer)\s+[A-Za-z0-9._~+/=-]+/gi, '$1 [REDACTED]')
    .replace(/\b(token|secret|password|api[_-]?key|access[_-]?token|refresh[_-]?token)\s*=\s*([^&\s]+)/gi, '$1=[REDACTED]')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, '[REDACTED]');
}

function redact(value) {
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, val]) => {
      if (/(token|secret|password|authorization|api[_-]?key|cookie)/i.test(key)) return [key, '[REDACTED]'];
      return [key, redact(val)];
    }));
  }
  return value;
}

export class JsonlLogger {
  constructor(path) {
    this.path = resolve(path);
    mkdirSync(dirname(this.path), { recursive: true });
  }

  write(event, data = {}) {
    const row = { at: new Date().toISOString(), event, ...redact(data) };
    appendFileSync(this.path, `${JSON.stringify(row)}\n`, 'utf8');
    return row;
  }
}

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export async function backupDatabase(sourceDb, destination) {
  if (!sourceDb || typeof sourceDb.prepare !== 'function') throw new TypeError('open DatabaseSync source required');
  const dest = resolve(destination);
  mkdirSync(dirname(dest), { recursive: true });
  const pages = await backup(sourceDb, dest);
  return { path: dest, bytes: statSync(dest).size, sha256: sha256File(dest), pages };
}

export async function restoreDatabase(backupPath, destination) {
  const source = resolve(backupPath);
  const dest = resolve(destination);
  if (!existsSync(source)) throw new Error(`backup not found: ${source}`);
  mkdirSync(dirname(dest), { recursive: true });
  const sourceDb = new DatabaseSync(source, { readOnly: true });
  try {
    const pages = await backup(sourceDb, dest);
    return { path: dest, bytes: statSync(dest).size, sha256: sha256File(dest), pages };
  } finally {
    sourceDb.close();
  }
}

export class ClassLimiter {
  constructor(limits = parseClassLimits()) {
    this.limits = limits instanceof Map ? normalizeClassLimitMap(limits) : parseClassLimits(limits);
    this.active = new Map();
    this.waiters = new Map();
  }

  limitFor(name) {
    const className = canonicalClassName(name);
    return this.limits.get(className) ?? this.limits.get('default') ?? 1;
  }

  activeFor(name) {
    return this.active.get(canonicalClassName(name)) ?? 0;
  }

  releaseHandle(name) {
    const className = canonicalClassName(name);
    let released = false;
    return () => {
      if (released) return false;
      released = true;
      this.release(className);
      return true;
    };
  }

  async acquire(name = 'default') {
    const className = canonicalClassName(name);
    if (this.activeFor(className) < this.limitFor(className)) {
      this.active.set(className, this.activeFor(className) + 1);
      return this.releaseHandle(className);
    }
    await new Promise((resolveWaiter) => {
      const queue = this.waiters.get(className) ?? [];
      queue.push(resolveWaiter);
      this.waiters.set(className, queue);
    });
    return this.releaseHandle(className);
  }

  release(name = 'default') {
    const className = canonicalClassName(name);
    const queue = this.waiters.get(className) ?? [];
    const waiter = queue.shift();
    if (waiter) {
      if (queue.length) this.waiters.set(className, queue); else this.waiters.delete(className);
      queueMicrotask(waiter);
      return;
    }
    this.active.set(className, Math.max(0, this.activeFor(className) - 1));
    this.waiters.delete(className);
  }
}

function nextIdleDelay(baseMs, maxMs, jitterRatio, random) {
  const sample = Number(random());
  if (!Number.isFinite(sample) || sample < 0 || sample > 1) {
    throw new RangeError('random() must return a number in [0,1]');
  }
  const jitter = baseMs * jitterRatio * ((sample * 2) - 1);
  return Math.max(1, Math.min(maxMs, Math.round(baseMs + jitter)));
}

export async function runWorkerLoop({
  store,
  execute,
  workerId,
  limiter = new ClassLimiter(),
  logger,
  leaseMs = 30_000,
  timeoutMs = 10_000,
  idleMs = 250,
  maxIdleSleepMs = idleMs,
  idleBackoffFactor = 1,
  idleJitterRatio = 0,
  maxIdleMs = 0,
  shouldStop = () => false,
  sleepFn = sleep,
  random = Math.random,
  nowFn = Date.now,
} = {}) {
  if (!store || typeof store.claim !== 'function') throw new TypeError('store required');
  if (typeof execute !== 'function') throw new TypeError('execute required');
  if (!workerId) throw new TypeError('workerId required');
  if (!Number.isFinite(leaseMs) || leaseMs < 100) throw new RangeError('leaseMs must be >=100');
  validateWorkerTimerCeiling('leaseMs', leaseMs);
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1) throw new RangeError('timeoutMs must be >=1');
  validateWorkerTimerCeiling('timeoutMs', timeoutMs);
  if (!Number.isFinite(idleMs) || idleMs < 1) throw new RangeError('idleMs must be >=1');
  validateWorkerTimerCeiling('idleMs', idleMs);
  if (!Number.isFinite(maxIdleSleepMs) || maxIdleSleepMs < idleMs) throw new RangeError('maxIdleSleepMs must be >= idleMs');
  validateWorkerTimerCeiling('maxIdleSleepMs', maxIdleSleepMs);
  if (!Number.isFinite(idleBackoffFactor) || idleBackoffFactor < 1 || idleBackoffFactor > 10) {
    throw new RangeError('idleBackoffFactor must be in [1,10]');
  }
  if (!Number.isFinite(idleJitterRatio) || idleJitterRatio < 0 || idleJitterRatio > 1) {
    throw new RangeError('idleJitterRatio must be in [0,1]');
  }
  if (!Number.isFinite(maxIdleMs) || maxIdleMs < 0) throw new RangeError('maxIdleMs must be >=0');
  validateWorkerTimerCeiling('maxIdleMs', maxIdleMs);
  if (typeof shouldStop !== 'function') throw new TypeError('shouldStop must be a function');
  if (typeof sleepFn !== 'function') throw new TypeError('sleepFn must be a function');
  if (typeof random !== 'function') throw new TypeError('random must be a function');
  if (typeof nowFn !== 'function') throw new TypeError('nowFn must be a function');

  const readNow = () => {
    const now = Number(nowFn());
    if (!Number.isFinite(now)) throw new RangeError('nowFn() must return a finite number');
    return now;
  };

  const effectiveLeaseMs = Math.max(leaseMs, MIN_WORKER_LEASE_MS);
  let lastWorkAt = readNow();
  let currentIdleMs = idleMs;
  let completed = 0;
  let failed = 0;

  logger?.write('worker_loop_start', {
    workerId,
    requestedLeaseMs: leaseMs,
    effectiveLeaseMs,
    timeoutMs,
    idleMs,
    maxIdleSleepMs,
    idleBackoffFactor,
    idleJitterRatio,
    maxIdleMs,
  });

  while (!shouldStop()) {
    const task = store.claim(workerId, effectiveLeaseMs);
    if (!task) {
      const idleForMs = Math.max(0, readNow() - lastWorkAt);
      if (maxIdleMs > 0 && idleForMs >= maxIdleMs) {
        logger?.write('worker_idle_timeout', { workerId, idleForMs, maxIdleMs });
        break;
      }

      const baseDelay = Math.min(maxIdleSleepMs, currentIdleMs);
      let waitMs = nextIdleDelay(baseDelay, maxIdleSleepMs, idleJitterRatio, random);
      if (maxIdleMs > 0) {
        waitMs = Math.min(waitMs, Math.max(1, maxIdleMs - idleForMs));
      }
      await sleepFn(waitMs);
      currentIdleMs = Math.min(maxIdleSleepMs, Math.max(idleMs, currentIdleMs * idleBackoffFactor));
      continue;
    }

    lastWorkAt = readNow();
    currentIdleMs = idleMs;
    const rawClassName = String(task.payload?.providerClass ?? task.payload?.taskClass ?? 'default').trim();
    const className = rawClassName || 'default';
    let release;
    let heartbeat;
    try {
      heartbeat = setInterval(() => {
        const owned = store.heartbeat(task.id, workerId, effectiveLeaseMs);
        if (!owned) logger?.write('heartbeat_ownership_lost', { workerId, taskId: task.id, className });
      }, Math.max(50, Math.floor(effectiveLeaseMs / 3)));
      heartbeat.unref?.();

      release = await limiter.acquire(className);
      if (!store.heartbeat(task.id, workerId, effectiveLeaseMs)) {
        logger?.write('ownership_lost_at_provider_handoff', { workerId, taskId: task.id, className });
        continue;
      }
      if (!store.start(task.id, workerId)) {
        logger?.write('ownership_lost_before_start', { workerId, taskId: task.id, className });
        continue;
      }
      logger?.write('task_start', {
        workerId,
        taskId: task.id,
        kind: task.kind,
        className,
        requestedLeaseMs: leaseMs,
        effectiveLeaseMs,
      });
      const result = await execute(task, { timeoutMs });
      if (!store.heartbeat(task.id, workerId, effectiveLeaseMs)) throw new Error('lost task ownership before evidence commit');
      store.addEvidence(task.id, 'bounded-task-result', result, { workerId, kind: task.kind, className });
      if (!store.markVerifying(task.id, workerId, result)) throw new Error('lost task ownership before verification');
      if (!store.verifyComplete(task.id)) throw new Error('evidence gate rejected completion');
      completed += 1;
      logger?.write('task_complete', { workerId, taskId: task.id, className });
    } catch (error) {
      failed += 1;
      const failedTransition = store.fail(task.id, workerId, error);
      logger?.write('task_failed', { workerId, taskId: task.id, className, failedTransition, error: String(error?.message ?? error) });
    } finally {
      clearInterval(heartbeat);
      release?.();
      lastWorkAt = readNow();
    }
  }

  const result = { workerId, completed, failed };
  logger?.write('worker_loop_stop', result);
  return result;
}
