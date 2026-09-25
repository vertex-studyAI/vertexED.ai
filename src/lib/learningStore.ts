import { userContentStorageKeys, getUserContentStorageScope } from './userContentStorageScope.mjs';
import { parseLearningRecords, mergeLearningRecord } from './learningModel.mjs';
import { queueLearnerStateWrite } from './learnerStateSync';

export type PracticeAttempt = { id: string; questionId: string; answer: string; confidence: number | null; hinted: boolean; seconds: number; at: string; mode: string; correct?: boolean; error?: string | null };
export type PracticeMistake = { id: string; questionId: string; cause: string; reflection: string; correction: string; updatedAt: string };
export function readLearningState() {
  const keys = userContentStorageKeys();
  return {
    attempts: parseLearningRecords(localStorage.getItem(keys.practiceAttempts), 'practice_attempt') as PracticeAttempt[],
    mistakes: parseLearningRecords(localStorage.getItem(keys.practiceMistakes), 'practice_mistake') as PracticeMistake[],
  };
}
export function saveLearningRecord(type: 'practice_attempt' | 'practice_mistake', record: PracticeAttempt | PracticeMistake) {
  if (!getUserContentStorageScope()) throw new Error('Sign in before saving practice.');
  const key = type === 'practice_attempt' ? userContentStorageKeys().practiceAttempts : userContentStorageKeys().practiceMistakes;
  const rows = parseLearningRecords(localStorage.getItem(key), type);
  const merged = mergeLearningRecord(rows, record, type);
  localStorage.setItem(key, JSON.stringify(merged));
  queueLearnerStateWrite(type, record.id, record as unknown as Record<string, unknown>);
  window.dispatchEvent(new CustomEvent('vertexed:practice-changed'));
}
