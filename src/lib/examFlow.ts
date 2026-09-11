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
  return safeStorageSet(
    resolveSessionStorage(window),
    mockExamAnswersStorageKey(),
    JSON.stringify(handoff),
  );
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
};

function mockExamDraftStorageKey() {
  return userContentStorageKeys().mockExamDraft;
}

export function loadMockExamDraft(): MockExamDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = safeStorageGet(resolveLocalStorage(window), mockExamDraftStorageKey());
    if (!raw) return null;
    const draft = JSON.parse(raw) as MockExamDraft;
    if (!draft?.paper || !Array.isArray((draft.paper as { sections?: unknown }).sections)) return null;
    if (!Number.isFinite(Date.parse(draft.deadlineAt)) || !draft.answers || typeof draft.answers !== 'object') return null;
    return draft;
  } catch {
    return null;
  }
}

export function saveMockExamDraft(draft: Omit<MockExamDraft, 'status' | 'savedAt' | 'updatedAt'>): boolean {
  if (typeof window === 'undefined') return false;
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
  queueLearnerStateWrite('mock_draft', 'active', saved as unknown as Record<string, unknown>, now);
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
  const raw = safeStorageGet(resolveSessionStorage(window), mockExamAnswersStorageKey());
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

  const draft = loadMockExamDraft();
  return draft ? {
    subject: draft.subject,
    paperTitle: draft.paperTitle,
    answered: draft.answered,
    total: draft.total,
    status: 'in_progress',
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

export function consumeMockExamAnswers(): MockExamAnswersHandoff | null {
  if (typeof window === 'undefined') return null;
  const storage = resolveSessionStorage(window);
  const scopedAnswersKey = mockExamAnswersStorageKey();
  const raw = safeStorageGet(storage, scopedAnswersKey);

  safeStorageRemove(storage, scopedAnswersKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<MockExamAnswersHandoff>;
    if (!Array.isArray(parsed.questions) || !parsed.answers || typeof parsed.answers !== 'object') {
      return null;
    }
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
