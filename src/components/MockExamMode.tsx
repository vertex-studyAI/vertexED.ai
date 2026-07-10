import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, X, BookOpen } from "lucide-react";
import { buildReviewHandoffFromPaper, saveMockReviewHandoff } from "@/lib/examFlow";
import { recordWeakness } from "@/lib/weaknessTracker";
import type { ExamBoard } from "@/types/curriculum";

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
) {
  sessionStorage.setItem(
    "vertex_exam_answers",
    JSON.stringify({
      paperTitle: paper.title,
      answers,
      questions,
      rubricNotes: paper.rubricNotes ?? [],
      board: paper.metadata?.board,
      subject: subject ?? paper.metadata?.subject,
      grade: grade ?? paper.metadata?.grade,
    }),
  );

  if (board) {
    saveMockReviewHandoff(
      buildReviewHandoffFromPaper(board, subject ?? paper.metadata?.subject ?? "", grade ?? null, paper),
    );
  }
}

export default function MockExamMode({ paper, onClose, board, subject, grade, cramMode }: Props) {
  const questions = useMemo(() => flattenQuestions(paper), [paper]);
  const totalMarks = paper.metadata?.totalMarks ?? questions.length * 5;
  const baseMinutes = cramMode ? Math.min(30, Math.round(totalMarks * 0.8)) : Math.round(totalMarks * 1.2);
  const durationMinutes = Math.max(cramMode ? 15 : 30, Math.min(cramMode ? 45 : 180, baseMinutes));

  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showRubric, setShowRubric] = useState(false);
  const timerStartedRef = useRef(false);

  useEffect(() => {
    if (submitted) return;
    timerStartedRef.current = true;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [submitted]);

  useEffect(() => {
    if (!submitted && secondsLeft === 0 && timerStartedRef.current) setSubmitted(true);
  }, [secondsLeft, submitted]);

  const current = questions[index];
  const currentId = current?.id ?? String(index);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const handleComplete = () => {
    saveExamHandoff(paper, questions, answers, board, subject, grade ?? null);
    const answered = Object.values(answers).filter((a) => a.trim()).length;
    const completionRate = questions.length > 0 ? answered / questions.length : 0;
    recordWeakness({
      topic: paper.title || "Mock exam",
      subject: subject ?? paper.metadata?.subject ?? "General",
      board: paper.metadata?.board,
      score: Math.round(completionRate * totalMarks * 0.7),
      maxScore: totalMarks,
      source: "mock",
    });
  };

  if (!questions.length) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="glass-panel p-6 max-w-md text-center">
          <p className="text-muted-foreground mb-4">This paper has no questions to attempt.</p>
          <button type="button" className="neu-button px-4 py-2" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    const answered = Object.values(answers).filter((a) => a.trim()).length;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm overflow-y-auto">
        <div className="glass-panel border border-primary/20 p-8 max-w-lg w-full text-center my-8">
          <h2 className="text-2xl font-semibold brand-text-gradient inline-block mb-2">
            {cramMode ? "Cram session complete" : "Exam complete"}
          </h2>
          <p className="text-muted-foreground mb-4">
            You answered {answered} of {questions.length} questions in {durationMinutes} minutes.
          </p>

          {paper.rubricNotes && paper.rubricNotes.length > 0 && (
            <div className="text-left mb-6">
              <button
                type="button"
                className="flex items-center gap-2 text-sm text-primary mb-2 mx-auto"
                onClick={() => setShowRubric((v) => !v)}
              >
                <BookOpen className="h-4 w-4" />
                {showRubric ? "Hide" : "Show"} mark scheme notes
              </button>
              {showRubric && (
                <ul className="text-xs text-muted-foreground space-y-1.5 rounded-lg border border-white/10 bg-white/5 p-3 max-h-40 overflow-y-auto">
                  {paper.rubricNotes.map((note, i) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/answer-reviewer"
              className="neu-button px-4 py-2 text-sm"
              onClick={handleComplete}
            >
              Review with rubric →
            </Link>
            <button type="button" className="neu-button px-4 py-2 text-sm" onClick={onClose}>
              Back to paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[hsl(216,18%,8%)]">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3 shrink-0">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {paper.title || "Mock Exam"}
            {cramMode && <span className="ml-2 text-xs text-amber-400">CRAM</span>}
          </p>
          <p className="text-xs text-muted-foreground">
            Question {index + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-sm font-mono text-primary">
            <Clock className="h-4 w-4" />
            {mm}:{ss}
          </span>
          <button type="button" className="neu-button p-2" onClick={onClose} aria-label="Exit exam">
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <div className="glass-panel p-6 mb-6">
          <p className="text-lg text-foreground leading-relaxed">{current?.question || "Question"}</p>
          {current?.marks != null && (
            <p className="text-xs text-muted-foreground mt-2">[{current.marks} marks]</p>
          )}
          <textarea
            className="neu-input-el mt-4 w-full min-h-[160px] text-foreground"
            placeholder="Write your answer…"
            value={answers[currentId] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [currentId]: e.target.value }))}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-9 w-9 rounded-lg text-sm border transition ${
                i === index
                  ? "bg-primary/25 border-primary/40 text-primary"
                  : answers[String(questions[i]?.id ?? i)]?.trim()
                    ? "bg-emerald-500/15 border-emerald-500/30"
                    : "bg-white/5 border-white/10"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 px-4 py-3 flex justify-between gap-3 shrink-0">
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
            className="neu-button px-4 py-2 text-sm bg-primary/15 border-primary/25"
            onClick={() => setSubmitted(true)}
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
    </div>
    );
}
