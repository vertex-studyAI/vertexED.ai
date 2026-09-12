import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Check, ChevronLeft, ChevronRight, Lightbulb, Save, Send } from 'lucide-react';
import type { MypLesson } from '@/content/myp5Lessons';
import { savePracticeReviewHandoff } from '@/lib/examFlow';
import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

type Draft = { answer: string; updatedAt: string };
type DraftMap = Record<string, Draft>;

function draftStore(): Storage | null {
  if (typeof window === 'undefined') return null;
  return getUserContentStorageScope() ? window.localStorage : window.sessionStorage;
}

function readDraft(questionId: string): Draft | null {
  const storage = draftStore();
  if (!storage) return null;
  try {
    const raw = storage.getItem(userContentStorageKeys().mypPracticeDrafts);
    const value = raw ? JSON.parse(raw) as DraftMap : {};
    const draft = value[questionId];
    return draft && typeof draft.answer === 'string' && Number.isFinite(Date.parse(draft.updatedAt))
      ? draft
      : null;
  } catch {
    return null;
  }
}

function writeDraft(questionId: string, answer: string): string | null {
  const storage = draftStore();
  if (!storage) return null;
  try {
    const key = userContentStorageKeys().mypPracticeDrafts;
    const raw = storage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    const current = parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as DraftMap
      : {};
    const updatedAt = new Date().toISOString();
    const entries = Object.entries({ ...current, [questionId]: { answer, updatedAt } })
      .filter(([, value]) => value && typeof value.answer === 'string')
      .sort(([, a], [, b]) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      .slice(0, 40);
    storage.setItem(key, JSON.stringify(Object.fromEntries(entries)));
    return updatedAt;
  } catch {
    return null;
  }
}

export default function MypPracticeWorkspace({
  lesson,
  subjectName,
  sectionNumber,
}: {
  lesson: MypLesson;
  subjectName: string;
  sectionNumber: number;
}) {
  const navigate = useNavigate();
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = lesson.practice[questionIndex];
  const restoredDraft = useMemo(() => readDraft(question.id), [question.id]);
  const [answer, setAnswer] = useState(restoredDraft?.answer ?? '');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [status, setStatus] = useState(restoredDraft ? 'Draft restored.' : '');

  useEffect(() => {
    const draft = readDraft(question.id);
    setAnswer(draft?.answer ?? '');
    setStatus(draft ? 'Draft restored.' : '');
    setShowHints(false);
    setShowSolution(false);
  }, [question.id]);

  const saveDraft = () => {
    const savedAt = writeDraft(question.id, answer);
    setStatus(savedAt
      ? `${getUserContentStorageScope() ? 'Saved on this device for your account' : 'Saved for this browser session'} at ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      : 'Draft could not be saved on this device.');
  };

  const sendToReview = () => {
    if (!answer.trim()) {
      setStatus('Write an answer before opening review.');
      return;
    }
    saveDraft();
    const saved = savePracticeReviewHandoff({
      paperTitle: `${lesson.topic} original practice`,
      questions: [{ id: question.id, question: question.prompt }],
      answers: { [question.id]: answer.trim() },
      rubricNotes: question.successCriteria,
      board: 'IB_MYP',
      subject: subjectName,
      grade: 10,
    });
    if (!saved) {
      setStatus('The review handoff could not be stored in this browser.');
      return;
    }
    navigate('/answer-reviewer');
  };

  return (
    <section className="myp-practice-workspace" aria-labelledby="myp-practice-title">
      <div className="myp-practice-heading">
        <div>
          <p className="myp-kicker">{String(sectionNumber).padStart(2, '0')} / Practise</p>
          <h2 id="myp-practice-title">Make an attempt.</h2>
        </div>
        <div className="myp-question-position" aria-label={`Question ${questionIndex + 1} of ${lesson.practice.length}`}>
          {questionIndex + 1} / {lesson.practice.length}
        </div>
      </div>

      <div className="myp-question-picker" role="group" aria-label="Choose practice question">
        {lesson.practice.map((entry, index) => (
          <button
            type="button"
            key={entry.id}
            aria-pressed={index === questionIndex}
            onClick={() => setQuestionIndex(index)}
          >
            {entry.difficulty}
          </button>
        ))}
      </div>

      <div className="myp-active-question">
        <div className="myp-question-line">
          <span>{question.command}</span>
          <span>{question.marks} marks</span>
        </div>
        <h3>{question.prompt}</h3>
        <label htmlFor={`answer-${question.id}`}>Your answer</label>
        <textarea
          id={`answer-${question.id}`}
          value={answer}
          onChange={(event) => setAnswer(event.target.value.slice(0, 12_000))}
          onBlur={saveDraft}
          rows={9}
          placeholder="Show the reasoning you would want a reviewer to see."
        />
        <div className="myp-answer-meta">
          <span>{answer.trim() ? answer.trim().split(/\s+/).length : 0} words</span>
          <span aria-live="polite">{status}</span>
        </div>
        <div className="myp-practice-actions">
          <button type="button" onClick={saveDraft}><Save aria-hidden /> Save draft</button>
          <button type="button" onClick={() => setShowHints((value) => !value)} aria-expanded={showHints}>
            <Lightbulb aria-hidden /> {showHints ? 'Hide hints' : 'Show hints'}
          </button>
          <button type="button" className="myp-review-action" onClick={sendToReview}>
            <Send aria-hidden /> Review this answer
          </button>
        </div>
      </div>

      {showHints && <div className="myp-hint-panel"><h3>Hints</h3><ol>{question.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol></div>}

      <div className="myp-self-review">
        <div>
          <h3>Success criteria</h3>
          <ul>{question.successCriteria.map((criterion) => <li key={criterion}><Check aria-hidden /> {criterion}</li>)}</ul>
        </div>
        <div>
          <button type="button" onClick={() => setShowSolution((value) => !value)} aria-expanded={showSolution}>
            {showSolution ? 'Hide worked solution' : 'Compare with the worked solution'}
          </button>
          {showSolution && <ol className="myp-solution">{question.solution.map((step) => <li key={step}>{step}</li>)}</ol>}
        </div>
      </div>

      <div className="myp-question-nav">
        <button type="button" disabled={questionIndex === 0} onClick={() => setQuestionIndex((value) => value - 1)}>
          <ChevronLeft aria-hidden /> Previous
        </button>
        <button type="button" disabled={questionIndex === lesson.practice.length - 1} onClick={() => setQuestionIndex((value) => value + 1)}>
          Next <ChevronRight aria-hidden />
        </button>
      </div>
    </section>
  );
}
