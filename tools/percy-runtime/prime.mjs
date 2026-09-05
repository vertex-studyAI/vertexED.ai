#!/usr/bin/env node
import { PercyStore, executeBoundedTask } from './core.mjs';
import {
  backupDatabase, ClassLimiter, JsonlLogger, parseClassLimits,
  restoreDatabase, runWorkerLoop, safeSubmit,
} from './advanced.mjs';

const args = process.argv.slice(2);
const cmd = args.shift() ?? 'doctor';
const take = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (i === args.length - 1) throw new Error(`${name} requires a value`);
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const assertNoUnexpectedArgs = () => {
  if (args.length === 0) return;
  throw new Error(`unexpected argument(s): ${args.join(' ')}`);
};
const MAX_TIMER_MS = 2_147_483_647;
const parseTimerMs = (name, rawValue, minimum) => {
  const value = Number(rawValue);
  if (!Number.isSafeInteger(value) || value < minimum || value > MAX_TIMER_MS) {
    throw new RangeError(`${name} must be an integer in [${minimum},${MAX_TIMER_MS}]`);
  }
  return value;
};
const normalizeClassLimitsSpec = (spec) => {
  const normalized = [];
  const seen = new Set();
  for (const raw of String(spec).split(',')) {
    const item = raw.trim();
    if (!item) continue;
    const separator = item.indexOf('=');
    if (separator <= 0 || separator === item.length - 1 || item.indexOf('=', separator + 1) !== -1) {
      throw new RangeError(`invalid class limit: ${item}`);
    }
    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();
    if (!name || !value) throw new RangeError(`invalid class limit: ${item}`);
    if (seen.has(name)) throw new RangeError(`duplicate class limit: ${name}`);
    seen.add(name);
    normalized.push(`${name}=${value}`);
  }
  return normalized.join(',');
};
const dbPath = take('--db', process.env.PERCY_DB ?? '.percy/percy.sqlite');
const maxActive = Number(take('--max-active', process.env.PERCY_MAX_ACTIVE ?? '2'));

if (cmd === 'restore') {
  const from = take('--from');
  if (!from) throw new Error('--from required');
  assertNoUnexpectedArgs();
  const result = await restoreDatabase(from, dbPath);
  console.log(JSON.stringify({ restored: true, ...result }, null, 2));
  process.exit(0);
}

const store = new PercyStore(dbPath, { maxActive });
let closed = false;
const close = () => { if (!closed) { store.close(); closed = true; } };

try {
  if (cmd === 'doctor') {
    assertNoUnexpectedArgs();
    const integrity = store.integrityCheck();
    const ok = integrity.length === 1 && integrity[0] === 'ok';
    console.log(JSON.stringify({ ok, db: store.path, paused: store.isPaused(), maxActive: store.maxActive, counts: store.counts(), integrity }, null, 2));
    if (!ok) process.exitCode = 1;
  } else if (cmd === 'submit') {
    const kind = take('--kind', 'echo');
    const payload = JSON.parse(take('--payload', '{}'));
    const maxAttempts = Number(take('--max-attempts', '3'));
    const maxReady = Number(take('--max-ready', process.env.PERCY_MAX_READY ?? '1000'));
    const maxPayloadBytes = Number(take('--max-payload-bytes', process.env.PERCY_MAX_PAYLOAD_BYTES ?? String(64 * 1024)));
    assertNoUnexpectedArgs();
    console.log(JSON.stringify(safeSubmit(store, { kind, payload, maxAttempts }, { maxReady, maxPayloadBytes }), null, 2));
  } else if (cmd === 'backup') {
    const to = take('--to', `${dbPath}.backup`);
    assertNoUnexpectedArgs();
    const result = await backupDatabase(store.db, to);
    console.log(JSON.stringify({ backedUp: true, ...result }, null, 2));
  } else if (cmd === 'work') {
    const workers = Number(take('--workers', String(maxActive)));
    const leaseMs = parseTimerMs('--lease-ms', take('--lease-ms', '30000'), 100);
    const timeoutMs = parseTimerMs('--timeout-ms', take('--timeout-ms', '10000'), 1);
    const idleMs = parseTimerMs('--idle-ms', take('--idle-ms', process.env.PERCY_IDLE_MS ?? '250'), 1);
    const maxIdleSleepMs = parseTimerMs(
      '--max-idle-sleep-ms',
      take('--max-idle-sleep-ms', process.env.PERCY_MAX_IDLE_SLEEP_MS ?? String(idleMs)),
      1,
    );
    const idleBackoffFactor = Number(take('--idle-backoff-factor', process.env.PERCY_IDLE_BACKOFF_FACTOR ?? '1'));
    const idleJitterRatio = Number(take('--idle-jitter-ratio', process.env.PERCY_IDLE_JITTER_RATIO ?? '0'));
    const maxIdleMs = parseTimerMs('--max-idle-ms', take('--max-idle-ms', '0'), 0);
    const logPath = take('--log', '.percy/logs/percy-runtime.jsonl');
    const classLimits = normalizeClassLimitsSpec(
      take('--class-limits', process.env.PERCY_CLASS_LIMITS ?? 'default=2'),
    );
    assertNoUnexpectedArgs();
    if (!Number.isInteger(workers) || workers < 1 || workers > 4) throw new RangeError('--workers must be in [1,4]');
    const limiter = new ClassLimiter(parseClassLimits(classLimits));
    const logger = new JsonlLogger(logPath);
    let draining = false;
    let signalCount = 0;
    const onSignal = (signal) => {
      signalCount += 1;
      draining = true;
      logger.write('drain_requested', { signal, signalCount });
      if (signalCount >= 2) {
        logger.write('forced_exit', { signal });
        close();
        process.exit(signal === 'SIGTERM' ? 143 : 130);
      }
    };
    process.on('SIGINT', () => onSignal('SIGINT'));
    process.on('SIGTERM', () => onSignal('SIGTERM'));
    logger.write('worker_pool_start', {
      workers,
      maxActive,
      classLimits: Object.fromEntries(limiter.limits),
      idleMs,
      maxIdleSleepMs,
      idleBackoffFactor,
      idleJitterRatio,
      maxIdleMs,
    });
    const rows = await Promise.all(Array.from({ length: workers }, (_, i) => runWorkerLoop({
      store,
      execute: executeBoundedTask,
      workerId: `prime-${process.pid}-${i + 1}`,
      limiter,
      logger,
      leaseMs,
      timeoutMs,
      idleMs,
      maxIdleSleepMs,
      idleBackoffFactor,
      idleJitterRatio,
      maxIdleMs,
      shouldStop: () => draining,
    })));
    logger.write('worker_pool_stop', { rows, draining });
    console.log(JSON.stringify({ workers: rows, counts: store.counts(), draining }, null, 2));
  } else {
    throw new Error(`unknown prime command: ${cmd}`);
  }
} finally {
  close();
}
