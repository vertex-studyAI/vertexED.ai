const now = () => Date.now();

export function recoverInterruptedTasks(store) {
  const t = now();
  store.db.exec('BEGIN IMMEDIATE');
  try {
    const rows = store.db.prepare(`SELECT id,status,attempts,max_attempts,owner_id,error FROM tasks
      WHERE status='STALE'
        OR (status IN ('CLAIMED','RUNNING') AND lease_expires_at IS NOT NULL AND lease_expires_at <= ?)
        OR (status='READY' AND attempts >= max_attempts)
      ORDER BY created_at,id`).all(t);

    const update = store.db.prepare(`UPDATE tasks
      SET status=?, owner_id=NULL, lease_expires_at=NULL, heartbeat_at=NULL,
        available_at=?, error=?, updated_at=?
      WHERE id=?`);
    const recordFailure = store.db.prepare(
      'INSERT INTO failures(task_id,owner_id,attempt,error,created_at) VALUES(?,?,?,?,?)',
    );

    let requeued = 0;
    let failed = 0;
    for (const row of rows) {
      const exhausted = Number(row.attempts) >= Number(row.max_attempts);
      const target = exhausted ? 'FAILED' : 'READY';
      const reason = row.error ?? (
        row.status === 'STALE'
          ? 'stale task recovered'
          : row.status === 'READY'
            ? 'retry budget exhausted'
            : 'stale lease recovered'
      );
      update.run(target, t, reason, t, row.id);
      recordFailure.run(row.id, row.owner_id, row.attempts, reason, t);
      if (exhausted) failed += 1;
      else requeued += 1;
    }

    store.db.exec('COMMIT');
    return { recovered: rows.length, requeued, failed };
  } catch (error) {
    try { store.db.exec('ROLLBACK'); } catch {}
    throw error;
  }
}
