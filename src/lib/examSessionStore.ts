import { mergeExamSessionHistory, normalizeExamSession, readStoredExamSessionHistory } from './examSessionHistory.mjs';
import { userContentStorageKeys } from './userContentStorageScope.mjs';
import { queueLearnerStateWrite } from './learnerStateSync';

export type ExamSessionRecord = NonNullable<ReturnType<typeof normalizeExamSession>>;

export function readExamSessionHistoryState(): { entries: ExamSessionRecord[]; error: string | null } {
  try {
    return { entries: readStoredExamSessionHistory(localStorage, userContentStorageKeys().examPrepHistory), error: null };
  } catch (error) { return { entries: [], error: error instanceof Error ? error.message : 'Session history is unavailable on this device.' }; }
}

export function saveExamSessionHistory(value: unknown): boolean {
  const record = normalizeExamSession(value);
  if (!record) return false;
  let stored = true;
  try {
    const key = userContentStorageKeys().examPrepHistory;
    const current = readStoredExamSessionHistory(localStorage, key);
    localStorage.setItem(key, JSON.stringify(mergeExamSessionHistory(current, record)));
  } catch { stored = false; }
  queueLearnerStateWrite('exam_session', record.id, record, new Date(record.updatedAt));
  return stored;
}
