import type { ExamBoard } from '@/types/curriculum';
import { boardToApiLabel } from '@/lib/curriculum';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

const LEGACY_MOCK_EXAM_ANSWERS_KEY = 'vertex_exam_answers';

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

export function saveMockReviewHandoff(handoff: MockReviewHandoff) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(mockReviewStorageKey(), JSON.stringify({
    ...handoff,
    boardLabel: boardToApiLabel(handoff.board),
  }));
}

export function consumeMockReviewHandoff(): (MockReviewHandoff & { boardLabel?: string }) | null {
  if (typeof window === 'undefined') return null;
  const storageKey = mockReviewStorageKey();
  const scopedAnswersKey = mockExamAnswersStorageKey();

  // Timed MockExamMode now persists its richer answer payload under the active
  // account scope. Answer Reviewer still consumes the historical key immediately
  // after this helper, so bridge the payload synchronously at the consumption
  // boundary rather than leaving learner answers browser-global between routes.
  const scopedAnswers = sessionStorage.getItem(scopedAnswersKey);
  if (scopedAnswers) {
    sessionStorage.removeItem(scopedAnswersKey);
    sessionStorage.removeItem(storageKey);
    sessionStorage.setItem(LEGACY_MOCK_EXAM_ANSWERS_KEY, scopedAnswers);
    return null;
  }

  // Backward compatibility for payloads written by older app revisions. The
  // bootstrap/auth isolation guard clears stale legacy values across identities.
  if (sessionStorage.getItem(LEGACY_MOCK_EXAM_ANSWERS_KEY)) {
    sessionStorage.removeItem(storageKey);
    return null;
  }

  const raw = sessionStorage.getItem(storageKey);
  if (!raw) return null;
  sessionStorage.removeItem(storageKey);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
