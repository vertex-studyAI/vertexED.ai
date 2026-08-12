#!/usr/bin/env node
import { PercyStore, executeBoundedTask } from './core.mjs';

const args = process.argv.slice(2);
const cmd = args.shift() ?? 'status';
const take = (name, fallback) => {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const dbPath = take('--db', process.env.PERCY_DB ?? '.percy/percy.sqlite');
const store = new PercyStore(dbPath);

try {
  if (cmd === 'init') {
    console.log(JSON.stringify({ db: store.path, integrity: store.integrityCheck() }, null, 2));
  } else if (cmd === 'submit') {
    const kind = take('--kind', 'echo');
    const payload = JSON.parse(take('--payload', '{}'));
    const maxAttempts = Number(take('--max-attempts', '3'));
    console.log(store.submit({ kind, payload, maxAttempts }));
  } else if (cmd === 'status') {
    console.log(JSON.stringify({ paused: store.isPaused(), counts: store.counts(), tasks: store.list(20) }, null, 2));
  } else if (cmd === 'integrity') {
    const rows = store.integrityCheck();
    console.log(rows.join('\n'));
    process.exitCode = rows.length === 1 && rows[0] === 'ok' ? 0 : 1;
  } else if (cmd === 'pause') {
    store.setPaused(true);
    console.log('paused');
  } else if (cmd === 'resume') {
    store.setPaused(false);
    console.log('resumed');
  } else if (cmd === 'work-one') {
    const workerId = take('--worker-id', `worker-${process.pid}`);
    const leaseMs = Number(take('--lease-ms', '30000'));
    const timeoutMs = Number(take('--timeout-ms', '10000'));
    const task = store.claim(workerId, leaseMs);
    if (!task) {
      console.log(JSON.stringify({ workerId, status: 'idle' }));
    } else {
      const heartbeat = setInterval(
        () => store.heartbeat(task.id, workerId, leaseMs),
        Math.max(100, Math.floor(leaseMs / 3)),
      );
      try {
        const result = await executeBoundedTask(task, { timeoutMs });
        if (!store.complete(task.id, workerId, result)) throw new Error('lost task ownership before completion');
        console.log(JSON.stringify({ workerId, taskId: task.id, status: 'succeeded', result }));
      } catch (error) {
        store.fail(task.id, workerId, error);
        console.error(JSON.stringify({ workerId, taskId: task.id, status: 'failed-or-requeued', error: error.message }));
        process.exitCode = 1;
      } finally {
        clearInterval(heartbeat);
      }
    }
  } else {
    throw new Error(`unknown command: ${cmd}`);
  }
} finally {
  store.close();
}
