import { appendRevisionEvent } from '@/lib/revisionHistory';
import { userContentStorageKeys, getUserContentStorageScope } from './userContentStorageScope.mjs';
import { LEARNING_QUESTIONS, normalisePracticeAttempt, parseLearningRecords, mergeLearningRecord } from './learningModel.mjs';
import { PRACTICE_CONTENT_REVISION } from './practiceHistory.mjs';
import { queueLearnerStateWrite } from './learnerStateSync';

export type PracticeAttempt = { id: string; questionId: string; answer: string; confidence: number | null; hinted: boolean; seconds: number; at: string; mode: string; contentRevision?: string; correct?: boolean | null; error?: string | null; assessmentStatus?: 'verified' | 'held'; recordedResult?: { correct: boolean | null; error?: string | null; evidence?: string } | null };
export type PracticeMistake = { id: string; questionId: string; cause: string; reflection: string; correction: string; updatedAt: string };
export function readLearningState() {
  const keys = userContentStorageKeys();
  return {
    attempts: parseLearningRecords(localStorage.getItem(keys.practiceAttempts), 'practice_attempt').map(value => normalisePracticeAttempt(value)) as PracticeAttempt[],
    mistakes: parseLearningRecords(localStorage.getItem(keys.practiceMistakes), 'practice_mistake') as PracticeMistake[],
  };
}
export function saveLearningRecord(type: 'practice_attempt' | 'practice_mistake', record: PracticeAttempt | PracticeMistake) {
  if (!getUserContentStorageScope()) throw new Error('Sign in before saving practice.');
  const key = type === 'practice_attempt' ? userContentStorageKeys().practiceAttempts : userContentStorageKeys().practiceMistakes;
  const rows = parseLearningRecords(localStorage.getItem(key), type);
  let nextRecord = record;
  if (type === 'practice_attempt') {
    const question = LEARNING_QUESTIONS.find(question => question.id === record.questionId);
    if (!question || !PRACTICE_CONTENT_REVISION.test(question.contentRevision)) throw new Error('This question is awaiting publication review. Your saved history is preserved.');
    nextRecord = { ...record, contentRevision: question.contentRevision };
  }
  const merged = mergeLearningRecord(rows, nextRecord, type);
  localStorage.setItem(key, JSON.stringify(merged));
  queueLearnerStateWrite(type, nextRecord.id, nextRecord as unknown as Record<string, unknown>);
  if (type === 'practice_attempt') {
    const attempt = nextRecord as PracticeAttempt;
    void appendRevisionEvent({
      eventType: 'attempt',
      occurredAt: attempt.at,
      evidenceStatus: attempt.assessmentStatus === 'verified' ? 'learner-attested' : 'provisional',
      sourceType: 'practice-attempt',
      sourceKey: attempt.id,
      sourceRevision: attempt.contentRevision || 'held-content',
      parentEventIds: [],
      payload: { label: 'Practice attempt', summary: `Saved ${attempt.mode} practice without copying the answer into the revision graph.`, route: '/learn', attemptId: attempt.id },
    }).catch(() => undefined);
  }
  window.dispatchEvent(new CustomEvent('vertexed:practice-changed'));
  window.dispatchEvent(new CustomEvent('vertexed:learner-state-changed'));
}
