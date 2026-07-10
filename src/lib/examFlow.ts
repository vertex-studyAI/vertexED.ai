import type { ExamBoard } from '@/types/curriculum';
import { boardToApiLabel } from '@/lib/curriculum';

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

export function buildReviewHandoffFromPaper(
  board: ExamBoard,
  subject: string,
  grade: number | null,
  paper: { title?: string; sections?: Array<{ questions?: Array<{ text?: string; marks?: number }> }> },
): MockReviewHandoff {
  const questions: MockReviewHandoff['questions'] = [];
  for (const section of paper.sections ?? []) {
    for (const q of section.questions ?? []) {
      if (q.text) questions.push({ question: q.text, marks: q.marks });
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
  return 'vertex_mock_review_handoff';
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
  const raw = sessionStorage.getItem(mockReviewStorageKey());
  if (!raw) return null;
  sessionStorage.removeItem(mockReviewStorageKey());
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
