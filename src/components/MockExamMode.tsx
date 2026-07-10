import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, X } from "lucide-react";

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
  metadata?: { totalMarks?: number; subject?: string; board?: string };
  sections?: Section[];
};

type Props = {
  paper: Paper;
  onClose: () => void;
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

export default function MockExamMode({ paper, onClose }: Props) {
  const questions = useMemo(() => flattenQuestions(paper), [paper]);
  const totalMarks = paper.metadata?.totalMarks ?? questions.length * 5;
  const durationMinutes = Math.max(30, Math.min(180, Math.round(totalMarks * 1.2)));

  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
        <div className="glass-panel border border-primary/20 p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-semibold brand-text-gradient inline-block mb-2">Exam complete</h2>
          <p className="text-muted-foreground mb-6">
            You answered {answered} of {questions.length} questions in {durationMinutes} minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/answer-reviewer"
              className="neu-button px-4 py-2 text-sm"
              onClick={() => {
                sessionStorage.setItem(
                  'vertex_exam_answers',
                  JSON.stringify({ paperTitle: paper.title, answers, questions }),
                );
              }}
            >
              Review answers →
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
          <p className="text-sm font-semibold text-foreground">{paper.title || "Mock Exam"}</p>
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
