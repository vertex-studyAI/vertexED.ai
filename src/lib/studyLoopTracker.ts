import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { normalizeStudyLoopWeek } from '@/lib/studyLoopStorage.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

export type LoopStep = 'plan' | 'focus' | 'practise' | 'review' | 'remember';

export const LOOP_STEPS: { id: LoopStep; label: string; verb: string; href: string }[] = [
  { id: 'plan', label: 'Plan', verb: 'Mapped the week', href: '/planner' },
  { id: 'focus', label: 'Focus', verb: 'Ran a focus block', href: '/study-zone' },
  { id: 'practise', label: 'Practise', verb: 'Did a mock', href: '/paper-maker' },
  { id: 'review', label: 'Review', verb: 'Got rubric feedback', href: '/answer-reviewer' },
  { id: 'remember', label: 'Remember', verb: 'Retrieved from memory', href: '/notetaker' },
];

type WeekRecord = {
  weekKey: string;
  steps: Partial<Record<LoopStep, string>>;
};

function storageKey() {
  return userContentStorageKeys().studyLoopWeek;
}

function weekKey(): string {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function readWeek(): WeekRecord {
  const current = weekKey();
  if (typeof window === 'undefined') return { weekKey: current, steps: {} };
  const storage = resolveLocalStorage(window);
  try {
    const raw = safeStorageGet(storage, storageKey());
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return normalizeStudyLoopWeek(parsed, current) as WeekRecord;
  } catch {
    return { weekKey: current, steps: {} };
  }
}

function writeWeek(record: WeekRecord) {
  if (typeof window === 'undefined') return false;
  const storage = resolveLocalStorage(window);
  return safeStorageSet(storage, storageKey(), JSON.stringify(record));
}

export function recordLoopStep(step: LoopStep) {
  const record = readWeek();
  if (!record.steps[step]) {
    record.steps[step] = new Date().toISOString();
    writeWeek(record);
  }
}

export function getLoopWeekStatus() {
  const record = readWeek();
  const completed = LOOP_STEPS.filter((s) => record.steps[s.id]).map((s) => s.id);
  const missing = LOOP_STEPS.filter((s) => !record.steps[s.id]).map((s) => s.id);
  const completionPercent = Math.round((completed.length / LOOP_STEPS.length) * 100);
  return { weekKey: record.weekKey, completed, missing, completionPercent };
}

export const ROUTE_LOOP_STEP: Record<string, LoopStep> = {
  '/planner': 'plan',
  '/study-zone': 'focus',
  '/paper-maker': 'practise',
  '/answer-reviewer': 'review',
  '/notetaker': 'remember',
};
