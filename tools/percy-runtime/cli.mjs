#!/usr/bin/env node
import { PercyStore, executeBoundedTask } from './core.mjs';
import { createVerifiedBackup } from './backup.mjs';

const args = process.argv.slice(2);
const cmd = args.shift() ?? 'status';
const take = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const flag = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
};
const dbPath = take('--db', process.env.PERCY_DB ?? '.percy/percy.sqlite');
const maxActive = Number(take('--max-active', process.env.PERCY_MAX_ACTIVE ?? '2'));
const maxQueued = Number(take('--max-queued', process.env.PERCY_MAX_QUEUED ?? '500'));
const maxPayloadBytes = Number(take('--max-payload-bytes', process.env.PERCY_MAX_PAYLOAD_BYTES ?? '65536'));
const store = new PercyStore(dbPath, { maxActive, maxQueued, maxPayloadBytes });
let closed = false;
const close = () => { if (!closed) { store.close(); closed = true; } };

try {
  if (cmd === 'init') {
    console.log(JSON.stringify({
      db: store.path,
      maxActive: store.maxActive,
      maxQueued: store.maxQueued,
      maxPayloadBytes: store.maxPayloadBytes,
      integrity: store.integrityCheck(),
    }, null, 2));
  } else if (cmd === 'submit') {
    const kind = take('--kind', 'echo');
    const payload = JSON.parse(take('--payload', '{}'));
    const maxAttempts = Number(take('--max-attempts', '3'));
    console.log(store.submit({ kind, payload, maxAttempts }));
  } else if (cmd === 'status') {
    console.log(JSON.stringify({
      paused: store.isPaused(),
      maxActive: store.maxActive,
      maxQueued: store.maxQueued,
      maxPayloadBytes: store.maxPayloadBytes,
      active: store.activeCount(),
      queued: store.queueDepth(),
      counts: store.counts(),
      tasks: store.list(20),
    }, null, 2));
  } else if (cmd === 'integrity') {
    const rows = store.integrityCheck();
    console.log(rows.join('\n'));
    process.exitCode = rows.length === 1 && rows[0] === 'ok' ? 0 : 1;
  } else if (cmd === 'backup') {
    const output = take('--output');
    if (!output) throw new Error('--output required');
    const overwrite = flag('--overwrite');
    const result = await createVerifiedBackup(store.db, store.path, output, { overwrite });
    console.log(JSON.stringify({ status: 'BACKUP_VERIFIED', ...result }, null, 2));
  } else if (cmd === 'pause') {
    store.setPaused(true);
    console.log('paused');
  } else if (cmd === 'resume') {
    store.setPaused(false);
    console.log(JSON.stringify({ resumed: true, staleRecovered: store.resumeStale() }));
  } else if (cmd === 'verify') {
    const taskId = take('--task-id');
    if (!taskId) throw new Error('--task-id required');
    const ok = store.verifyComplete(taskId);
    console.log(JSON.stringify({ taskId, complete: ok, evidence: store.listEvidence(taskId) }, null, 2));
    if (!ok) process.exitCode = 2;
  } else if (cmd === 'work-one') {
    const workerId = take('--worker-id', `worker-${process.pid}`);
    const leaseMs = Number(take('--lease-ms', '30000'));
    const timeoutMs = Number(take('--timeout-ms', '10000'));
    const task = store.claim(workerId, leaseMs);
    if (!task) {
      console.log(JSON.stringify({ workerId, status: 'idle' }));
    } else {
      if (!store.start(task.id, workerId)) throw new Error('lost task ownership before start');
      let heartbeat;
      const stop = (signal) => {
        try { store.markStale(task.id, workerId, `worker received ${signal}`); }
        finally { clearInterval(heartbeat); close(); }
        process.exit(signal === 'SIGTERM' ? 143 : 130);
      };
      process.once('SIGINT', () => stop('SIGINT'));
      process.once('SIGTERM', () => stop('SIGTERM'));
      heartbeat = setInterval(() => store.heartbeat(task.id, workerId, leaseMs), Math.max(100, Math.floor(leaseMs / 3)));
      try {
        const result = await executeBoundedTask(task, { timeoutMs });
        store.addEvidence(task.id, 'bounded-task-result', result, { workerId, kind: task.kind });
        if (!store.markVerifying(task.id, workerId, result)) throw new Error('lost task ownership before verification');
        if (!store.verifyComplete(task.id)) throw new Error('evidence gate rejected completion');
        console.log(JSON.stringify({ workerId, taskId: task.id, status: 'COMPLETE', result }));
      } catch (error) {
        if (!store.fail(task.id, workerId, error) && store.get(task.id)?.status !== 'VERIFYING') {
          console.error(JSON.stringify({ workerId, taskId: task.id, status: store.get(task.id)?.status, error: error.message }));
        }
        process.exitCode = 1;
      } finally {
        clearInterval(heartbeat);
      }
    }
  } else {
    throw new Error(`unknown command: ${cmd}`);
  }
} finally {
  close();
}
