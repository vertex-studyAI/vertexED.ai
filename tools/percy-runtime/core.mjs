import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

const now = () => Date.now();
const json = (value) => JSON.stringify(value ?? null);
const parse = (value) => value == null ? null : JSON.parse(value);
const sha256 = (value) => createHash('sha256').update(typeof value === 'string' ? value : json(value)).digest('hex');

export class PercyStore {
  constructor(path = '.percy/percy.sqlite', { maxActive = Number(process.env.PERCY_MAX_ACTIVE ?? 2) } = {}) {
    if (!Number.isInteger(maxActive) || maxActive < 1 || maxActive > 4) throw new RangeError('maxActive must be in [1,4]');
    this.path = resolve(path);
    this.maxActive = maxActive;
    mkdirSync(dirname(this.path), { recursive: true });
    this.db = new DatabaseSync(this.path);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
    this.migrate();
  }

  createSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
      INSERT OR IGNORE INTO meta(key, value) VALUES ('paused', '0');
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('READY','CLAIMED','RUNNING','VERIFYING','COMPLETE','FAILED','BLOCKED','STALE','CANCELLED')),
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
      CREATE INDEX IF NOT EXISTS idx_tasks_claim ON tasks(status, available_at, created_at);
      CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        value TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        metadata TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_evidence_task ON evidence(task_id, created_at);
      CREATE TABLE IF NOT EXISTS failures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        owner_id TEXT,
        attempt INTEGER NOT NULL,
        error TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  migrate() {
    const existing = this.db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='tasks'").get()?.sql ?? '';
    const legacy = existing.includes("'queued'") || existing.includes("'succeeded'");
    if (!legacy) {
      this.createSchema();
      return;
    }

    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.exec('DROP INDEX IF EXISTS idx_tasks_claim; ALTER TABLE tasks RENAME TO tasks_legacy_v1;');
      this.createSchema();
      this.db.exec(`
        INSERT INTO tasks(
          id,kind,payload,status,attempts,max_attempts,owner_id,lease_expires_at,heartbeat_at,
          available_at,created_at,updated_at,result,error
        )
        SELECT
          id,kind,payload,
          CASE status
            WHEN 'queued' THEN 'READY'
            WHEN 'running' THEN 'STALE'
            WHEN 'succeeded' THEN 'COMPLETE'
            WHEN 'failed' THEN 'FAILED'
            ELSE 'BLOCKED'
          END,
          attempts,max_attempts,NULL,NULL,NULL,available_at,created_at,updated_at,result,error
        FROM tasks_legacy_v1;
        DROP TABLE tasks_legacy_v1;
      `);
      this.db.exec('COMMIT');
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch {}
      throw error;
    }
  }

  close() { this.db.close(); }
  integrityCheck() { return this.db.prepare('PRAGMA integrity_check').all().map(r => r.integrity_check); }
  isPaused() { return this.db.prepare("SELECT value FROM meta WHERE key='paused'").get()?.value === '1'; }
  setPaused(paused) { this.db.prepare("UPDATE meta SET value=? WHERE key='paused'").run(paused ? '1' : '0'); }

  submit({ id = randomUUID(), kind = 'echo', payload = {}, maxAttempts = 3, availableAt = now() } = {}) {
    if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 20) throw new RangeError('maxAttempts must be in [1,20]');
    const t = now();
    this.db.prepare(`INSERT INTO tasks(id,kind,payload,status,attempts,max_attempts,available_at,created_at,updated_at)
      VALUES(?,?,?,'READY',0,?,?,?,?)`).run(id, kind, json(payload), maxAttempts, availableAt, t, t);
    return id;
  }

  activeCount() {
    return Number(this.db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status IN ('CLAIMED','RUNNING')").get().n);
  }

  resumeStale() {
    const t = now();
    const rows = this.db.prepare("SELECT id FROM tasks WHERE status IN ('CLAIMED','RUNNING') AND lease_expires_at IS NOT NULL AND lease_expires_at <= ?").all(t);
    if (!rows.length) return 0;
    const stmt = this.db.prepare(`UPDATE tasks SET status='READY', owner_id=NULL, lease_expires_at=NULL, heartbeat_at=NULL,
      error=COALESCE(error,'stale lease recovered'), updated_at=? WHERE id=? AND status IN ('CLAIMED','RUNNING')`);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      for (const row of rows) stmt.run(t, row.id);
      this.db.exec('COMMIT');
      return rows.length;
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch {}
      throw error;
    }
  }

  claim(workerId, leaseMs = 30_000) {
    if (!workerId) throw new TypeError('workerId required');
    if (this.isPaused()) return null;
    if (!Number.isFinite(leaseMs) || leaseMs < 100) throw new RangeError('leaseMs must be >=100');
    const t = now();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare(`UPDATE tasks SET status='READY', owner_id=NULL, lease_expires_at=NULL, heartbeat_at=NULL,
        error=COALESCE(error,'stale lease recovered'), updated_at=?
        WHERE status IN ('CLAIMED','RUNNING') AND lease_expires_at IS NOT NULL AND lease_expires_at <= ?`).run(t, t);
      const active = Number(this.db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE status IN ('CLAIMED','RUNNING')").get().n);
      if (active >= this.maxActive) { this.db.exec('COMMIT'); return null; }
      const row = this.db.prepare(`SELECT * FROM tasks WHERE status='READY' AND available_at <= ? AND attempts < max_attempts ORDER BY created_at,id LIMIT 1`).get(t);
      if (!row) { this.db.exec('COMMIT'); return null; }
      const updated = this.db.prepare(`UPDATE tasks SET status='CLAIMED', attempts=attempts+1, owner_id=?, lease_expires_at=?, heartbeat_at=?, updated_at=? WHERE id=? AND status='READY'`)
        .run(workerId, t + leaseMs, t, t, row.id);
      if (updated.changes !== 1) { this.db.exec('ROLLBACK'); return null; }
      const claimed = this.db.prepare('SELECT * FROM tasks WHERE id=?').get(row.id);
      this.db.exec('COMMIT');
      return this.decode(claimed);
    } catch (error) {
      try { this.db.exec('ROLLBACK'); } catch {}
      throw error;
    }
  }

  start(taskId, workerId) {
    const t = now();
    return this.db.prepare(`UPDATE tasks SET status='RUNNING', updated_at=?
      WHERE id=? AND status='CLAIMED' AND owner_id=? AND lease_expires_at IS NOT NULL AND lease_expires_at > ?`)
      .run(t, taskId, workerId, t).changes === 1;
  }

  heartbeat(taskId, workerId, leaseMs = 30_000) {
    const t = now();
    return this.db.prepare(`UPDATE tasks SET heartbeat_at=?, lease_expires_at=?, updated_at=?
      WHERE id=? AND status IN ('CLAIMED','RUNNING') AND owner_id=?
        AND lease_expires_at IS NOT NULL AND lease_expires_at > ?`)
      .run(t, t + leaseMs, t, taskId, workerId, t).changes === 1;
  }

  addEvidence(taskId, kind, value, metadata = {}) {
    if (!kind) throw new TypeError('evidence kind required');
    if (!this.db.prepare('SELECT id FROM tasks WHERE id=?').get(taskId)) throw new Error(`unknown task: ${taskId}`);
    const id = randomUUID();
    const packed = json(value);
    const digest = sha256(packed);
    this.db.prepare('INSERT INTO evidence(id,task_id,kind,value,sha256,metadata,created_at) VALUES(?,?,?,?,?,?,?)')
      .run(id, taskId, kind, packed, digest, json(metadata), now());
    return { id, task_id: taskId, kind, sha256: digest };
  }

  listEvidence(taskId) {
    return this.db.prepare('SELECT * FROM evidence WHERE task_id=? ORDER BY created_at,id').all(taskId)
      .map(row => ({ ...row, value: parse(row.value), metadata: parse(row.metadata) }));
  }

  markVerifying(taskId, workerId, result) {
    const t = now();
    return this.db.prepare(`UPDATE tasks SET status='VERIFYING', result=?, owner_id=NULL, lease_expires_at=NULL,
      heartbeat_at=NULL, updated_at=? WHERE id=? AND status='RUNNING' AND owner_id=?`)
      .run(json(result), t, taskId, workerId).changes === 1;
  }

  verifyComplete(taskId) {
    const count = Number(this.db.prepare('SELECT COUNT(*) AS n FROM evidence WHERE task_id=?').get(taskId).n);
    if (count < 1) return false;
    return this.db.prepare("UPDATE tasks SET status='COMPLETE', updated_at=? WHERE id=? AND status='VERIFYING'")
      .run(now(), taskId).changes === 1;
  }

  fail(taskId, workerId, error, retryDelayMs = 250) {
    const task = this.db.prepare("SELECT attempts,max_attempts FROM tasks WHERE id=? AND status IN ('CLAIMED','RUNNING') AND owner_id=?").get(taskId, workerId);
    if (!task) return false;
    const message = String(error?.message ?? error);
    const terminal = task.attempts >= task.max_attempts;
    const t = now();
    this.db.prepare('INSERT INTO failures(task_id,owner_id,attempt,error,created_at) VALUES(?,?,?,?,?)')
      .run(taskId, workerId, task.attempts, message, t);
    return this.db.prepare(`UPDATE tasks SET status=?, error=?, owner_id=NULL, lease_expires_at=NULL,
      heartbeat_at=NULL, available_at=?, updated_at=? WHERE id=? AND status IN ('CLAIMED','RUNNING') AND owner_id=?`)
      .run(terminal ? 'FAILED' : 'READY', message, t + (terminal ? 0 : retryDelayMs), t, taskId, workerId).changes === 1;
  }

  markStale(taskId, workerId, reason = 'worker stopped') {
    return this.db.prepare(`UPDATE tasks SET status='STALE', error=?, owner_id=NULL, lease_expires_at=NULL, heartbeat_at=NULL, updated_at=?
      WHERE id=? AND status IN ('CLAIMED','RUNNING') AND owner_id=?`).run(reason, now(), taskId, workerId).changes === 1;
  }

  requeueStale(taskId) {
    return this.db.prepare("UPDATE tasks SET status='READY', updated_at=? WHERE id=? AND status='STALE'").run(now(), taskId).changes === 1;
  }

  cancel(taskId) {
    return this.db.prepare("UPDATE tasks SET status='CANCELLED', owner_id=NULL, lease_expires_at=NULL, heartbeat_at=NULL, updated_at=? WHERE id=? AND status NOT IN ('COMPLETE','CANCELLED')")
      .run(now(), taskId).changes === 1;
  }

  list(limit = 100) { return this.db.prepare('SELECT * FROM tasks ORDER BY created_at DESC LIMIT ?').all(limit).map(r => this.decode(r)); }
  get(id) { const r = this.db.prepare('SELECT * FROM tasks WHERE id=?').get(id); return r ? this.decode(r) : null; }
  counts() { return Object.fromEntries(this.db.prepare('SELECT status,COUNT(*) AS count FROM tasks GROUP BY status').all().map(r => [r.status, Number(r.count)])); }
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
    return await Promise.race([work(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('task timeout')), timeoutMs); })]);
  } finally { clearTimeout(timer); }
}
