import type { ExamBoard } from '@/types/curriculum';
import { boardToApiLabel } from '@/lib/curriculum';
import {
  resolveLocalStorage,
  resolveSessionStorage,
  safeStorageGet,
  safeStorageRemove,
  safeStorageSet,
} from '@/lib/browserStorage.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { queueLearnerStateWrite } from '@/lib/learnerStateSync';

/**
 * Handoff payload for mock exam → answer reviewer flow (Phase 2).
 */
export type MockReviewHandoff = {
  board: ExamBoard;
  subject: string;
  grade: number | null;
  questions: Array<{ question: string; marks?: number }>;
  paperTitle?: string;
};

export type MockExamAnswersHandoff = {
  paperTitle?: string;
  questions: Array<{ id?: string; question?: string }>;
  answers: Record<string, string>;
  rubricNotes?: string[];
  board?: string;
  subject?: string;
  grade?: number | null;
};

function questionText(q: { question?: string; text?: string }): string | null {
  const text = (q.question ?? q.text ?? '').trim();
  return text || null;
}

export function buildReviewHandoffFromPaper(
  board: ExamBoard,
  subject: string,
  grade: number | null,
  paper: {
    title?: string;
    sections?: Array<{ questions?: Array<{ question?: string; text?: string; marks?: number }> }>;
  },
): MockReviewHandoff {
  const questions: MockReviewHandoff['questions'] = [];
  for (const section of paper.sections ?? []) {
    for (const q of section.questions ?? []) {
      const text = questionText(q);
      if (text) questions.push({ question: text, marks: q.marks });
    }
  }
  return {
    board,
    subject,
    grade,
    questions,
    paperTitle: paper.title,
  };
}

export function mockReviewStorageKey() {
  return userContentStorageKeys().mockReviewHandoff;
}

export function mockExamAnswersStorageKey() {
  return userContentStorageKeys().mockExamAnswers;
}

export function saveMockExamAnswersHandoff(handoff: MockExamAnswersHandoff): boolean {
  if (typeof window === 'undefined') return false;
  if (!validAnswersHandoff(handoff)) return false;
  const storage = resolveLocalStorage(window);
  const existing = readStoredMockExamDraft();
  if (existing.error) return false;
  try {
    const previousAnswers = storage?.getItem(mockExamAnswersStorageKey());
    if (previousAnswers && !validAnswersHandoff(JSON.parse(previousAnswers))) return false;
  } catch { return false; }
  const now = new Date();
  const submitted = {
    ...existing.draft,
    paper: existing.draft?.paper ?? { title: handoff.paperTitle, sections: [{ questions: handoff.questions }] },
    paperTitle: handoff.paperTitle || 'Practice paper',
    answers: handoff.answers,
    answered: Object.values(handoff.answers).filter(answer => answer.trim()).length,
    total: handoff.questions.length,
    currentIndex: existing.draft?.currentIndex ?? 0,
    deadlineAt: existing.draft?.deadlineAt ?? now.toISOString(),
    cramMode: existing.draft?.cramMode ?? false,
    subject: handoff.subject,
    status: 'awaiting_review',
    submittedAnswers: handoff,
    savedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  } satisfies MockExamDraft;
  // A temporary handoff is insufficient: closing the browser must leave the
  // submitted answers available. Do not retire the active draft before this
  // durable device acknowledgement succeeds.
  if (!safeStorageSet(storage, mockExamAnswersStorageKey(), JSON.stringify(handoff))) return false;
  if (!safeStorageSet(storage, mockExamDraftStorageKey(), JSON.stringify(submitted))) return false;
  try { queueLearnerStateWrite('mock_draft', 'active', submitted as unknown as Record<string, unknown>, now); }
  catch { /* The acknowledged device copy remains available if cloud queuing is unavailable. */ }
  safeStorageSet(
    resolveSessionStorage(window),
    mockExamAnswersStorageKey(),
    JSON.stringify(handoff),
  );
  return true;
}

export type PendingMockReview = {
  subject?: string;
  paperTitle: string;
  answered: number;
  total: number;
  status: 'in_progress' | 'awaiting_review';
};

export type MockExamDraft = PendingMockReview & {
  paper: Record<string, unknown>;
  answers: Record<string, string>;
  currentIndex: number;
  deadlineAt: string;
  board?: ExamBoard | null;
  subject?: string;
  grade?: number | null;
  cramMode: boolean;
  savedAt: string;
  updatedAt: string;
  submittedAnswers?: MockExamAnswersHandoff;
};

function mockExamDraftStorageKey() {
  return userContentStorageKeys().mockExamDraft;
}

function validAnswersHandoff(value: unknown): value is MockExamAnswersHandoff {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const handoff = value as MockExamAnswersHandoff;
  return Array.isArray(handoff.questions)
    && handoff.questions.every(question => question && typeof question === 'object'
      && (question.id === undefined || typeof question.id === 'string')
      && (question.question === undefined || typeof question.question === 'string'))
    && Boolean(handoff.answers && typeof handoff.answers === 'object' && !Array.isArray(handoff.answers))
    && Object.values(handoff.answers).every(answer => typeof answer === 'string')
    && (handoff.paperTitle === undefined || typeof handoff.paperTitle === 'string')
    && (handoff.rubricNotes === undefined || (Array.isArray(handoff.rubricNotes) && handoff.rubricNotes.every(note => typeof note === 'string')));
}

function readStoredMockExamDraft(): { draft: MockExamDraft | null; error: boolean } {
  if (typeof window === 'undefined') return { draft: null, error: true };
  try {
    const storage = resolveLocalStorage(window);
    if (!storage) return { draft: null, error: true };
    const raw = storage.getItem(mockExamDraftStorageKey());
    if (raw === null) return { draft: null, error: false };
    const draft = JSON.parse(raw) as MockExamDraft;
    if (!draft?.paper || !Array.isArray((draft.paper as { sections?: unknown }).sections)
      || !Number.isFinite(Date.parse(draft.deadlineAt)) || !draft.answers || typeof draft.answers !== 'object'
      || Array.isArray(draft.answers) || !Object.values(draft.answers).every(answer => typeof answer === 'string')
      || !Number.isInteger(draft.currentIndex) || draft.currentIndex < 0
      || (draft.status !== 'in_progress' && draft.status !== 'awaiting_review')) return { draft: null, error: true };
    return { draft, error: false };
  } catch {
    return { draft: null, error: true };
  }
}

export function loadMockExamDraft(): MockExamDraft | null {
  const { draft } = readStoredMockExamDraft();
  return draft?.status === 'in_progress' ? draft : null;
}

export function saveMockExamDraft(draft: Omit<MockExamDraft, 'status' | 'savedAt' | 'updatedAt'>): boolean {
  if (typeof window === 'undefined') return false;
  if (readStoredMockExamDraft().error) return false;
  const now = new Date();
  const saved = {
    ...draft,
    status: 'in_progress',
    savedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  } satisfies MockExamDraft;
  const stored = safeStorageSet(
    resolveLocalStorage(window),
    mockExamDraftStorageKey(),
    JSON.stringify(saved),
  );
  try { queueLearnerStateWrite('mock_draft', 'active', saved as unknown as Record<string, unknown>, now); }
  catch { /* Return only the confirmed device-save status. */ }
  return stored;
}

export function clearMockExamDraft(): void {
  if (typeof window === 'undefined') return;
  const now = new Date();
  safeStorageRemove(resolveLocalStorage(window), mockExamDraftStorageKey());
  queueLearnerStateWrite('mock_draft', 'active', {
    deleted: true,
    updatedAt: now.toISOString(),
  }, now);
}

export function getPendingMockReview(): PendingMockReview | null {
  if (typeof window === 'undefined') return null;
  const raw = safeStorageGet(resolveSessionStorage(window), mockExamAnswersStorageKey())
    || safeStorageGet(resolveLocalStorage(window), mockExamAnswersStorageKey());
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as {
        subject?: string;
        paperTitle?: string;
        answers?: Record<string, string>;
        questions?: unknown[];
      };
      const answers = parsed.answers && typeof parsed.answers === 'object' ? parsed.answers : {};
      const answered = Object.values(answers).filter((answer) => typeof answer === 'string' && answer.trim()).length;
      const total = Array.isArray(parsed.questions) ? parsed.questions.length : Object.keys(answers).length;
      return {
        subject: parsed.subject,
        paperTitle: parsed.paperTitle?.trim() || 'Practice paper',
        answered,
        total,
        status: 'awaiting_review',
      };
    } catch {
      // Fall through to an in-progress draft if the review payload is malformed.
    }
  }

  const { draft } = readStoredMockExamDraft();
  return draft ? {
    subject: draft.subject,
    paperTitle: draft.paperTitle,
    answered: draft.answered,
    total: draft.total,
    status: draft.status,
  } : null;
}

export function saveMockReviewHandoff(handoff: MockReviewHandoff) {
  if (typeof window === 'undefined') return;
  safeStorageSet(
    resolveSessionStorage(window),
    mockReviewStorageKey(),
    JSON.stringify({
      ...handoff,
      boardLabel: boardToApiLabel(handoff.board),
    }),
  );
}

export function savePracticeReviewHandoff(handoff: MockExamAnswersHandoff): boolean {
  if (typeof window === 'undefined') return false;
  const storage = resolveSessionStorage(window);
  const stored = safeStorageSet(
    storage,
    mockExamAnswersStorageKey(),
    JSON.stringify(handoff),
  );
  if (!stored) return false;

  safeStorageRemove(storage, mockReviewStorageKey());
  return true;
}

export function consumeMockExamAnswers(): MockExamAnswersHandoff | null {
  if (typeof window === 'undefined') return null;
  const storage = resolveSessionStorage(window);
  const scopedAnswersKey = mockExamAnswersStorageKey();
  const raw = safeStorageGet(storage, scopedAnswersKey)
    || safeStorageGet(resolveLocalStorage(window), scopedAnswersKey);

  if (!raw) {
    const { draft } = readStoredMockExamDraft();
    return draft?.status === 'awaiting_review' && validAnswersHandoff(draft.submittedAnswers)
      ? draft.submittedAnswers : null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<MockExamAnswersHandoff>;
    if (!validAnswersHandoff(parsed)) {
      return null;
    }
    safeStorageRemove(storage, scopedAnswersKey);
    // A completed timed exam is richer than the question-only review handoff.
    // Remove the latter so it cannot appear as a stale second import.
    safeStorageRemove(storage, mockReviewStorageKey());
    return parsed as MockExamAnswersHandoff;
  } catch {
    return null;
  }
}

export function consumeMockReviewHandoff(): (MockReviewHandoff & { boardLabel?: string }) | null {
  if (typeof window === 'undefined') return null;
  const storage = resolveSessionStorage(window);
  const storageKey = mockReviewStorageKey();
  const raw = safeStorageGet(storage, storageKey);
  if (!raw) return null;
  safeStorageRemove(storage, storageKey);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
