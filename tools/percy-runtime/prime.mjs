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
const dbPath = take('--db', process.env.PERCY_DB ?? '.percy/percy.sqlite');
const maxActive = Number(take('--max-active', process.env.PERCY_MAX_ACTIVE ?? '2'));

if (cmd === 'restore') {
  const from = take('--from');
  if (!from) throw new Error('--from required');
  const result = await restoreDatabase(from, dbPath);
  console.log(JSON.stringify({ restored: true, ...result }, null, 2));
  process.exit(0);
}

const store = new PercyStore(dbPath, { maxActive });
let closed = false;
const close = () => { if (!closed) { store.close(); closed = true; } };

try {
  if (cmd === 'doctor') {
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
    console.log(JSON.stringify(safeSubmit(store, { kind, payload, maxAttempts }, { maxReady, maxPayloadBytes }), null, 2));
  } else if (cmd === 'backup') {
    const to = take('--to', `${dbPath}.backup`);
    const result = await backupDatabase(store.db, to);
    console.log(JSON.stringify({ backedUp: true, ...result }, null, 2));
  } else if (cmd === 'work') {
    const workers = Number(take('--workers', String(maxActive)));
    const leaseMs = Number(take('--lease-ms', '30000'));
    const timeoutMs = Number(take('--timeout-ms', '10000'));
    const idleMs = Number(take('--idle-ms', '250'));
    const maxIdleMs = Number(take('--max-idle-ms', '0'));
    const logPath = take('--log', '.percy/logs/percy-runtime.jsonl');
    if (!Number.isInteger(workers) || workers < 1 || workers > 4) throw new RangeError('--workers must be in [1,4]');
    const limiter = new ClassLimiter(parseClassLimits(take('--class-limits', process.env.PERCY_CLASS_LIMITS ?? 'default=2')));
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
    logger.write('worker_pool_start', { workers, maxActive, classLimits: Object.fromEntries(limiter.limits) });
    const rows = await Promise.all(Array.from({ length: workers }, (_, i) => runWorkerLoop({
      store,
      execute: executeBoundedTask,
      workerId: `prime-${process.pid}-${i + 1}`,
      limiter,
      logger,
      leaseMs,
      timeoutMs,
      idleMs,
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
