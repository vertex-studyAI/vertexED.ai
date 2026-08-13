import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { backup, DatabaseSync } from 'node:sqlite';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

// Sub-second leases are useful in direct store tests, but they are too short for
// an event-loop-driven worker under scheduler/CI pressure. The worker loop uses
// this floor while the underlying PercyStore keeps its >=100 ms API so stale
// lease behavior can still be tested independently.
export const MIN_WORKER_LEASE_MS = 1_000;

export function parseClassLimits(spec = process.env.PERCY_CLASS_LIMITS ?? 'default=2') {
  const limits = new Map();
  for (const raw of String(spec).split(',')) {
    const item = raw.trim();
    if (!item) continue;
    const [name, value] = item.split('=', 2);
    const n = Number(value);
    if (!name || !Number.isInteger(n) || n < 1 || n > 32) throw new RangeError(`invalid class limit: ${item}`);
    limits.set(name, n);
  }
  if (!limits.has('default')) limits.set('default', 1);
  return limits;
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

function redact(value) {
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
    this.limits = limits instanceof Map ? limits : parseClassLimits(limits);
    this.active = new Map();
    this.waiters = new Map();
  }

  limitFor(name) { return this.limits.get(name) ?? this.limits.get('default') ?? 1; }
  activeFor(name) { return this.active.get(name) ?? 0; }

  async acquire(name = 'default') {
    if (this.activeFor(name) < this.limitFor(name)) {
      this.active.set(name, this.activeFor(name) + 1);
      return () => this.release(name);
    }
    await new Promise((resolveWaiter) => {
      const queue = this.waiters.get(name) ?? [];
      queue.push(resolveWaiter);
      this.waiters.set(name, queue);
    });
    // release() transfers an existing occupied slot directly to this waiter.
    // Do not increment active here or a release/acquire handoff can briefly
    // exceed the declared provider-class limit.
    return () => this.release(name);
  }

  release(name = 'default') {
    const queue = this.waiters.get(name) ?? [];
    const waiter = queue.shift();
    if (waiter) {
      if (queue.length) this.waiters.set(name, queue); else this.waiters.delete(name);
      // Keep active unchanged: the slot is reserved for the queued waiter.
      queueMicrotask(waiter);
      return;
    }
    this.active.set(name, Math.max(0, this.activeFor(name) - 1));
    this.waiters.delete(name);
  }
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
  maxIdleMs = 0,
  shouldStop = () => false,
} = {}) {
  if (!store || typeof store.claim !== 'function') throw new TypeError('store required');
  if (typeof execute !== 'function') throw new TypeError('execute required');
  if (!workerId) throw new TypeError('workerId required');
  if (!Number.isFinite(leaseMs) || leaseMs < 100) throw new RangeError('leaseMs must be >=100');
  const effectiveLeaseMs = Math.max(leaseMs, MIN_WORKER_LEASE_MS);
  let lastWorkAt = Date.now();
  let completed = 0;
  let failed = 0;

  while (!shouldStop()) {
    const task = store.claim(workerId, effectiveLeaseMs);
    if (!task) {
      if (maxIdleMs > 0 && Date.now() - lastWorkAt >= maxIdleMs) break;
      await sleep(idleMs);
      continue;
    }
    lastWorkAt = Date.now();
    const className = String(task.payload?.providerClass ?? task.payload?.taskClass ?? 'default');
    let release;
    let heartbeat;
    try {
      // A claimed task can wait behind a stricter provider/class limiter. Keep the
      // ownership lease alive while queued for that slot so another worker cannot
      // reclaim the task and create duplicate execution. The scheduler-safe lease
      // floor protects this timer from ordinary CI/event-loop jitter; production's
      // default 30 s lease remains unchanged.
      heartbeat = setInterval(() => {
        const owned = store.heartbeat(task.id, workerId, effectiveLeaseMs);
        if (!owned) logger?.write('heartbeat_ownership_lost', { workerId, taskId: task.id, className });
      }, Math.max(50, Math.floor(effectiveLeaseMs / 3)));
      heartbeat.unref?.();

      release = await limiter.acquire(className);
      // Refresh immediately at provider-slot handoff before changing CLAIMED -> RUNNING.
      // If ownership was actually lost, fail closed and never execute the task.
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
    }
  }
  return { workerId, completed, failed };
}
