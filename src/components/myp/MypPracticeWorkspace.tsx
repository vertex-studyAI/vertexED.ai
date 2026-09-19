import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarClock, ChevronLeft, ChevronRight, Lightbulb, Save, Send } from 'lucide-react';
import type { MypLesson } from '@/content/myp5Lessons';
import { useAuth } from '@/contexts/AuthContext';
import { savePracticeReviewHandoff } from '@/lib/examFlow';
import { readMypPracticeProgress, saveMypPracticeProgress } from '@/lib/mypPracticeProgress.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

type Draft = { answer: string; updatedAt: string };
type DraftMap = Record<string, Draft>;

type Confidence = '' | 'not-yet' | 'developing' | 'secure';

function draftStore(scope: string | null | undefined): Storage | null {
  if (typeof window === 'undefined') return null;
  if (scope === undefined) return null;
  return scope ? window.localStorage : window.sessionStorage;
}

function readDraft(questionId: string, scope: string | null | undefined): Draft | null {
  const storage = draftStore(scope);
  if (!storage) return null;
  try {
    const raw = storage.getItem(userContentStorageKeys(scope).mypPracticeDrafts);
    const value = raw ? JSON.parse(raw) as DraftMap : {};
    const draft = value[questionId];
    return draft && typeof draft.answer === 'string' && Number.isFinite(Date.parse(draft.updatedAt))
      ? draft
      : null;
  } catch {
    return null;
  }
}

function writeDraft(questionId: string, answer: string, scope: string | null | undefined): string | null {
  const storage = draftStore(scope);
  if (!storage) return null;
  try {
    const key = userContentStorageKeys(scope).mypPracticeDrafts;
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
  const { user, loading: authLoading } = useAuth();
  const storageScope = authLoading ? undefined : user?.id ?? null;
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = lesson.practice[questionIndex];
  const restoredDraft = useMemo(() => readDraft(question.id, storageScope), [question.id, storageScope]);
  const [answer, setAnswer] = useState(restoredDraft?.answer ?? '');
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<Confidence>('');
  const [status, setStatus] = useState(restoredDraft ? 'Draft restored.' : '');

  useEffect(() => {
    const draft = readDraft(question.id, storageScope);
    const progress = storageScope === undefined ? null : readMypPracticeProgress(window, storageScope, question.id);
    setAnswer(draft?.answer ?? '');
    setStatus(draft ? 'Draft restored.' : '');
    setShowHints(false);
    setShowSolution(false);
    setCheckedCriteria(progress?.checkedCriteria ?? []);
    setConfidence(progress?.confidence ?? '');
    if (progress) setStatus(`Review restored. Retry due ${new Date(progress.retryAt).toLocaleDateString()}.`);
  }, [question.id, storageScope]);

  const saveDraft = () => {
    const savedAt = writeDraft(question.id, answer, storageScope);
    setStatus(savedAt
      ? `${storageScope ? 'Saved on this device for your account' : 'Saved for this browser session'} at ${new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      : 'Draft could not be saved on this device.');
  };

  const scheduleRetry = (retryDays: 1 | 3 | 7) => {
    if (!showSolution) {
      setStatus('Compare your attempt with the worked solution before recording a review.');
      return;
    }
    if (!confidence) {
      setStatus('Choose a confidence level before scheduling the retry.');
      return;
    }
    const result = saveMypPracticeProgress(window, storageScope, question.id, { confidence, checkedCriteria, retryDays });
    setStatus(result.saved && result.progress
      ? `Review saved. Retry due ${new Date(result.progress.retryAt).toLocaleDateString()}. This is a self-report, not a mastery score.`
      : 'Review could not be saved on this device.');
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
          <h3>Check the evidence in your answer</h3>
          <p>Reveal the worked solution, then mark only criteria you can point to in your own response.</p>
          <ul>{question.successCriteria.map((criterion, index) => {
            const checked = checkedCriteria.includes(criterion);
            return <li key={criterion}><input id={`${question.id}-criterion-${index}`} type="checkbox" checked={checked} disabled={!showSolution} onChange={() => setCheckedCriteria((current) => checked ? current.filter((item) => item !== criterion) : [...current, criterion])} /><label htmlFor={`${question.id}-criterion-${index}`}>{criterion}</label></li>;
          })}</ul>
        </div>
        <div>
          <button type="button" onClick={() => setShowSolution((value) => !value)} aria-expanded={showSolution}>
            {showSolution ? 'Hide worked solution' : 'Compare with the worked solution'}
          </button>
          {showSolution && <ol className="myp-solution">{question.solution.map((step) => <li key={step}>{step}</li>)}</ol>}
        </div>
      </div>

      <div className="myp-retry-planner" aria-labelledby={`retry-${question.id}`}>
        <div><CalendarClock aria-hidden /><div><h3 id={`retry-${question.id}`}>Close the loop</h3><p>Record a self-assessment and choose when to attempt the question again without notes.</p></div></div>
        <label>Confidence after checking
          <select value={confidence} onChange={(event) => setConfidence(event.target.value as Confidence)}>
            <option value="">Choose one</option>
            <option value="not-yet">Not yet</option>
            <option value="developing">Developing</option>
            <option value="secure">Secure for this attempt</option>
          </select>
        </label>
        <div className="myp-retry-actions" role="group" aria-label="Schedule another attempt">
          <button type="button" onClick={() => scheduleRetry(1)}>Retry tomorrow</button>
          <button type="button" onClick={() => scheduleRetry(3)}>Retry in 3 days</button>
          <button type="button" onClick={() => scheduleRetry(7)}>Retry in 1 week</button>
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
