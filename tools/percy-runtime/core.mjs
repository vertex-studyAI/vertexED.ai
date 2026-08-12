import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const now = () => Date.now();
const json = (value) => JSON.stringify(value ?? null);
const parse = (value) => value == null ? null : JSON.parse(value);

export class PercyStore {
  constructor(path = '.percy/percy.sqlite') {
    this.path = resolve(path);
    mkdirSync(dirname(this.path), { recursive: true });
    this.db = new DatabaseSync(this.path);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    this.migrate();
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT OR IGNORE INTO meta(key, value) VALUES ('paused', '0');
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('queued','running','succeeded','failed')),
        attempts INTEGER NOT NULL DEFAULT 0,
        max_attempts INTEGER NOT NULL DEFAULT 3,
        owner_id TEXT,
        lease_expires_at INTEGER,
        heartbeat_at INTEGER,
        available_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        result TEXT,
        error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_tasks_claim
        ON tasks(status, available_at, lease_expires_at, created_at);
    `);
  }

  close() { this.db.close(); }
  integrityCheck() { return this.db.prepare('PRAGMA integrity_check').all().map(r => r.integrity_check); }
  isPaused() { return this.db.prepare("SELECT value FROM meta WHERE key='paused'").get()?.value === '1'; }
  setPaused(paused) { this.db.prepare("UPDATE meta SET value=? WHERE key='paused'").run(paused ? '1' : '0'); }

  submit({ id = randomUUID(), kind = 'echo', payload = {}, maxAttempts = 3, availableAt = now() } = {}) {
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) throw new RangeError('maxAttempts must be in [1,20]');
    const t = now();
    this.db.prepare(`INSERT INTO tasks(id,kind,payload,status,attempts,max_attempts,available_at,created_at,updated_at)
      VALUES(?,?,?,'queued',0,?,?,?,?)`).run(id, kind, json(payload), maxAttempts, availableAt, t, t);
    return id;
  }

  claim(workerId, leaseMs = 30_000) {
    if (!workerId) throw new TypeError('workerId required');
    if (this.isPaused()) return null;
    const t = now();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const row = this.db.prepare(`
        SELECT * FROM tasks
        WHERE available_at <= ? AND (
          status='queued' OR (status='running' AND lease_expires_at IS NOT NULL AND lease_expires_at <= ?)
        ) AND attempts < max_attempts
        ORDER BY created_at, id LIMIT 1
      `).get(t, t);
      if (!row) { this.db.exec('COMMIT'); return null; }
      const updated = this.db.prepare(`
        UPDATE tasks SET status='running', attempts=attempts+1, owner_id=?,
          lease_expires_at=?, heartbeat_at=?, updated_at=?, error=NULL
        WHERE id=? AND (status='queued' OR (status='running' AND lease_expires_at <= ?))
      `).run(workerId, t + leaseMs, t, t, row.id, t);
      if (updated.changes !== 1) { this.db.exec('ROLLBACK'); return null; }
      const claimed = this.db.prepare('SELECT * FROM tasks WHERE id=?').get(row.id);
      this.db.exec('COMMIT');
      return this.decode(claimed);
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch {}
      throw error;
    }
  }

  heartbeat(taskId, workerId, leaseMs = 30_000) {
    const t = now();
    const result = this.db.prepare(`UPDATE tasks SET heartbeat_at=?, lease_expires_at=?, updated_at=?
      WHERE id=? AND status='running' AND owner_id=?`).run(t, t + leaseMs, t, taskId, workerId);
    return result.changes === 1;
  }

  complete(taskId, workerId, result) {
    const t = now();
    const changed = this.db.prepare(`UPDATE tasks SET status='succeeded', result=?, owner_id=NULL,
      lease_expires_at=NULL, heartbeat_at=NULL, updated_at=?
      WHERE id=? AND status='running' AND owner_id=?`).run(json(result), t, taskId, workerId);
    return changed.changes === 1;
  }

  fail(taskId, workerId, error, retryDelayMs = 250) {
    const task = this.db.prepare("SELECT attempts,max_attempts FROM tasks WHERE id=? AND status='running' AND owner_id=?").get(taskId, workerId);
    if (!task) return false;
    const terminal = task.attempts >= task.max_attempts;
    const t = now();
    const changed = this.db.prepare(`UPDATE tasks SET status=?, error=?, owner_id=NULL, lease_expires_at=NULL,
      heartbeat_at=NULL, available_at=?, updated_at=? WHERE id=? AND status='running' AND owner_id=?`)
      .run(terminal ? 'failed' : 'queued', String(error?.message ?? error), t + (terminal ? 0 : retryDelayMs), t, taskId, workerId);
    return changed.changes === 1;
  }

  list(limit = 100) { return this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?').all(limit).map(r => this.decode(r)); }
  get(id) { const r = this.db.prepare('SELECT * FROM tasks WHERE id=?').get(id); return r ? this.decode(r) : null; }
  counts() { return Object.fromEntries(this.db.prepare('SELECT status, COUNT(*) AS count FROM tasks GROUP BY status').all().map(r => [r.status, Number(r.count)])); }
  decode(row) { return { ...row, payload: parse(row.payload), result: parse(row.result) }; }
}

export async function executeBoundedTask(task, { timeoutMs = 10_000 } = {}) {
  const work = async () => {
    if (task.kind === 'echo') return task.payload;
    if (task.kind === 'sleep') {
      const ms = Number(task.payload?.ms ?? 0);
      if (!Number.isFinite(ms) || ms < 0 || ms > 60_000) throw new RangeError('sleep ms must be in [0,60000]');
      await new Promise(r => setTimeout(r, ms));
      return { sleptMs: ms };
    }
    if (task.kind === 'fail') throw new Error(String(task.payload?.message ?? 'requested failure'));
    throw new Error(`unsupported task kind: ${task.kind}`);
  };
  let timer;
  try {
    return await Promise.race([
      work(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('task timeout')), timeoutMs); }),
    ]);
  } finally { clearTimeout(timer); }
}
