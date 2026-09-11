import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Clock, X, BookOpen } from "lucide-react";
import AccessibleModal from "@/components/AccessibleModal";
import {
  buildReviewHandoffFromPaper,
  clearMockExamDraft,
  loadMockExamDraft,
  saveMockExamAnswersHandoff,
  saveMockExamDraft,
  saveMockReviewHandoff,
} from "@/lib/examFlow";
import type { ExamBoard } from "@/types/curriculum";
import { boardToApiLabel } from "@/lib/curriculum";

type Question = {
  id?: string;
  question?: string;
  marks?: number;
};

type Section = {
  id?: string;
  title?: string;
  questions?: Question[];
};

type Paper = {
  title?: string;
  metadata?: { totalMarks?: number; subject?: string; board?: string; grade?: number };
  sections?: Section[];
  rubricNotes?: string[];
};

type Props = {
  paper: Paper;
  onClose: () => void;
  board?: ExamBoard | null;
  subject?: string;
  grade?: number | null;
  cramMode?: boolean;
};

function flattenQuestions(paper: Paper): Question[] {
  const out: Question[] = [];
  for (const section of paper.sections ?? []) {
    for (const q of section.questions ?? []) {
      out.push(q);
    }
  }
  return out;
}

function saveExamHandoff(
  paper: Paper,
  questions: Question[],
  answers: Record<string, string>,
  board: ExamBoard | null | undefined,
  subject: string | undefined,
  grade: number | null | undefined,
): boolean {
  const handoffStored = saveMockExamAnswersHandoff({
    paperTitle: paper.title,
    answers,
    questions,
    rubricNotes: paper.rubricNotes ?? [],
    board: board ? boardToApiLabel(board) : paper.metadata?.board,
    subject: subject ?? paper.metadata?.subject,
    grade: grade ?? paper.metadata?.grade,
  });
  if (!handoffStored) return false;

  clearMockExamDraft();

  if (board) {
    saveMockReviewHandoff(
      buildReviewHandoffFromPaper(board, subject ?? paper.metadata?.subject ?? "", grade ?? null, paper),
    );
  }
  return true;
}

const CENTERED_OVERLAY =
  "fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-sm";
const FULL_SCREEN_OVERLAY = "fixed inset-0 z-[120] bg-background";

export default function MockExamMode({ paper, onClose, board, subject, grade, cramMode }: Props) {
  const questions = useMemo(() => flattenQuestions(paper), [paper]);
  const totalMarks = paper.metadata?.totalMarks ?? questions.length * 5;
  const baseMinutes = cramMode ? Math.min(30, Math.round(totalMarks * 0.8)) : Math.round(totalMarks * 1.2);
  const durationMinutes = Math.max(cramMode ? 15 : 30, Math.min(cramMode ? 45 : 180, baseMinutes));

  const restoredDraft = useMemo(() => {
    const draft = loadMockExamDraft();
    if (!draft || draft.paperTitle !== (paper.title || 'Practice paper') || draft.total !== questions.length) return null;
    const draftQuestions = flattenQuestions(draft.paper as Paper);
    const sameQuestions = draftQuestions.length === questions.length
      && questions.every((question, questionIndex) =>
        (question.question || '') === (draftQuestions[questionIndex]?.question || ''));
    return sameQuestions ? draft : null;
  }, [paper, questions]);
  const initialDeadline = restoredDraft?.deadlineAt
    || new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
  const deadlineRef = useRef(initialDeadline);
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil((Date.parse(initialDeadline) - Date.now()) / 1000)));
  const [index, setIndex] = useState(() => Math.min(restoredDraft?.currentIndex ?? 0, Math.max(0, questions.length - 1)));
  const [answers, setAnswers] = useState<Record<string, string>>(() => restoredDraft?.answers ?? {});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRubric, setShowRubric] = useState(false);
  const timerStartedRef = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const persistDraft = useCallback(() => {
    if (submitted || !questions.length) return;
    const answered = Object.values(answers).filter((answer) => answer.trim()).length;
    saveMockExamDraft({
      paper: paper as unknown as Record<string, unknown>,
      paperTitle: paper.title || 'Practice paper',
      answers,
      answered,
      total: questions.length,
      currentIndex: index,
      deadlineAt: deadlineRef.current,
      board,
      subject: subject ?? paper.metadata?.subject,
      grade: grade ?? paper.metadata?.grade,
      cramMode: Boolean(cramMode),
    });
  }, [answers, board, cramMode, grade, index, paper, questions.length, subject, submitted]);

  useEffect(() => {
    persistDraft();
  }, [persistDraft]);

  const handleExit = () => {
    persistDraft();
    onClose();
  };

  useEffect(() => {
    if (submitted) return;
    timerStartedRef.current = true;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [submitted]);

  useEffect(() => {
    if (!submitted && secondsLeft === 0 && timerStartedRef.current) {
      if (saveExamHandoff(paper, questions, answers, board, subject, grade ?? null)) {
        setSubmitError(null);
        setSubmitted(true);
      } else {
        setSubmitError('Your browser blocked temporary exam storage. Your answers are still here; allow site storage and submit again.');
      }
    }
  }, [answers, board, grade, paper, questions, secondsLeft, subject, submitted]);

  const current = questions[index];
  const currentId = current?.id ?? String(index);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const handleComplete = () => {
    if (saveExamHandoff(paper, questions, answers, board, subject, grade ?? null)) {
      setSubmitError(null);
      setSubmitted(true);
    } else {
      setSubmitError('Your browser blocked temporary exam storage. Your answers are still here; allow site storage and submit again.');
    }
  };

  if (!questions.length) {
    return (
      <AccessibleModal
        titleId="mock-exam-title"
        descriptionId="mock-exam-description"
        onClose={handleExit}
        initialFocusRef={titleRef}
        overlayClassName={CENTERED_OVERLAY}
        className="glass-panel max-w-md p-6 text-center"
      >
        <h2
          id="mock-exam-title"
          ref={titleRef}
          tabIndex={-1}
          className="mb-2 text-xl font-semibold text-foreground outline-none"
        >
          Mock exam unavailable
        </h2>
        <p id="mock-exam-description" className="mb-4 text-muted-foreground">
          This paper has no questions to attempt.
        </p>
        <button type="button" className="neu-button px-4 py-2" onClick={handleExit}>Close</button>
      </AccessibleModal>
    );
  }

  if (submitted) {
    const answered = Object.values(answers).filter((a) => a.trim()).length;
    return (
      <AccessibleModal
        titleId="mock-exam-title"
        descriptionId="mock-exam-description"
        onClose={handleExit}
        initialFocusRef={titleRef}
        overlayClassName={CENTERED_OVERLAY}
        className="glass-panel my-8 w-full max-w-lg border border-primary/20 p-8 text-center"
      >
        <h2
          id="mock-exam-title"
          ref={titleRef}
          tabIndex={-1}
          className="brand-text-gradient mb-2 inline-block text-2xl font-semibold outline-none"
        >
          {cramMode ? "Cram session complete" : "Exam complete"}
        </h2>
        <p id="mock-exam-description" className="mb-4 text-muted-foreground">
          You submitted {answered} of {questions.length} questions. No score has been estimated;
          review the responses against the available criteria before they affect your progress.
        </p>

        {paper.rubricNotes && paper.rubricNotes.length > 0 && (
          <div className="mb-6 text-left">
            <button
              type="button"
              className="mx-auto mb-2 flex items-center gap-2 text-sm text-primary"
              onClick={() => setShowRubric((v) => !v)}
              aria-expanded={showRubric}
              aria-controls="mock-exam-rubric-notes"
            >
              <BookOpen className="h-4 w-4" aria-hidden />
              {showRubric ? "Hide" : "Show"} mark scheme notes
            </button>
            {showRubric && (
              <ul
                id="mock-exam-rubric-notes"
                className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-border/60 bg-foreground/[0.03] p-3 text-xs text-muted-foreground"
              >
                {paper.rubricNotes.map((note, i) => (
                  <li key={i}>• {note}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/answer-reviewer"
            className="neu-button px-4 py-2 text-sm"
          >
            Review submitted answers →
          </Link>
          <button type="button" className="neu-button px-4 py-2 text-sm" onClick={handleExit}>
            Back to paper
          </button>
        </div>
      </AccessibleModal>
    );
  }

  return (
    <AccessibleModal
      titleId="mock-exam-title"
      descriptionId="mock-exam-description"
      onClose={handleExit}
      initialFocusRef={titleRef}
      overlayClassName={FULL_SCREEN_OVERLAY}
      className="flex h-full w-full flex-col bg-background"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
        <div>
          <h1
            id="mock-exam-title"
            ref={titleRef}
            tabIndex={-1}
            className="text-sm font-semibold text-foreground outline-none"
          >
            {paper.title || "Mock Exam"}
            {cramMode && <span className="ml-2 text-xs text-amber-400">CRAM</span>}
          </h1>
          <p id="mock-exam-description" className="text-xs text-muted-foreground" aria-live="polite">
            Question {index + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            role="timer"
            aria-label={`Time remaining: ${mm} minutes ${ss} seconds`}
            className="flex items-center gap-1.5 font-mono text-sm text-primary"
          >
            <Clock className="h-4 w-4" aria-hidden />
            <span aria-hidden>{mm}:{ss}</span>
          </span>
          <button type="button" className="neu-button p-2" onClick={handleExit} aria-label="Exit exam">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto p-6">
        <div className="glass-panel mb-6 p-6">
          <p className="text-lg leading-relaxed text-foreground">
            {current?.question || "Question"}
          </p>
          {current?.marks != null && (
            <p id="mock-exam-question-marks" className="mt-2 text-xs text-muted-foreground">
              [{current.marks} marks]
            </p>
          )}
          <label htmlFor="mock-exam-answer" className="sr-only">
            Answer for question {index + 1}
          </label>
          <textarea
            id="mock-exam-answer"
            className="neu-input-el mt-4 min-h-[160px] w-full text-foreground"
            placeholder="Write your answer…"
            value={answers[currentId] ?? ""}
            aria-describedby={current?.marks != null ? "mock-exam-question-marks" : undefined}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [currentId]: e.target.value }))}
          />
        </div>

        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Exam question navigation">
          {questions.map((_, i) => {
            const questionId = String(questions[i]?.id ?? i);
            const answered = Boolean(answers[questionId]?.trim());
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={`Go to question ${i + 1}${answered ? ", answered" : ", unanswered"}`}
                className={`h-9 w-9 rounded-lg border text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  i === index
                    ? "border-primary/40 bg-primary/25 text-primary"
                    : answered
                      ? "border-emerald-500/30 bg-emerald-500/15 text-foreground"
                      : "border-border/60 bg-foreground/[0.04] text-muted-foreground"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </nav>
        {submitError && (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}
      </main>

      <footer className="flex shrink-0 justify-between gap-3 border-t border-border/60 px-4 py-3">
        <button
          type="button"
          className="neu-button px-4 py-2 text-sm"
          disabled={index === 0}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Previous
        </button>
        {index + 1 >= questions.length ? (
          <button
            type="button"
            className="neu-button border-primary/25 bg-primary/15 px-4 py-2 text-sm"
            onClick={handleComplete}
          >
            Submit exam
          </button>
        ) : (
          <button
            type="button"
            className="neu-button px-4 py-2 text-sm"
            onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
          >
            Next
          </button>
        )}
      </footer>
    </AccessibleModal>
  );
}
