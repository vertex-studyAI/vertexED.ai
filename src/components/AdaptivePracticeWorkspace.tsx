import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, RefreshCw, SlidersHorizontal, Target, XCircle } from 'lucide-react';
import RichMarkdown from '@/components/RichMarkdown';
import {
  ADAPTIVE_QUESTION_BANK,
  PRACTICE_DIFFICULTIES,
  PRACTICE_SUBJECTS,
  PRACTICE_TYPES,
} from '@/content/adaptiveQuestionBank.mjs';
import {
  answerLabel,
  classifyPracticeAnswer,
  selectPracticeQuestions,
  selectTargetedFollowUp,
  topicsForSubject,
} from '@/lib/adaptivePractice.mjs';
import '@/styles/adaptive-practice.css';

import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { saveLearningRecord } from '@/lib/learningStore';
import { Link } from 'react-router';
const difficultyNames: Record<string, string> = {
  foundation: 'Foundation', intermediate: 'Intermediate', advanced: 'Advanced', 'very-hard': 'Very challenging',
};
const typeNames: Record<string, string> = { 'multiple-choice': 'Multiple choice', numeric: 'Numeric' };

type PracticeQuestion = {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  type: 'multiple-choice' | 'numeric';
  concepts: string[];
  prompt: string;
  choices?: string[];
  answer: { choice?: number; value?: number; tolerance?: number };
  solution: string[];
  difficultyReason: string;
  units?: string;
};

type PracticeDiagnosis = {
  correct: boolean;
  errorCategory: string | null;
  errorSubcategory: string | null;
  confidence: number;
  evidence: string;
  studentMisconception: string | null;
  nextStep: string;
};

const questionBank = ADAPTIVE_QUESTION_BANK as PracticeQuestion[];

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(userContentStorageKeys().practiceRecent) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(-24) : [];
  } catch { return []; }
}

function writeRecent(ids: string[]) {
  try { window.localStorage.setItem(userContentStorageKeys().practiceRecent, JSON.stringify(ids.slice(-24))); } catch { /* Optional repetition memory. */ }
}

export default function AdaptivePracticeWorkspace({ initialSubject = '' }: { initialSubject?: string }) {
  const supportedInitial = PRACTICE_SUBJECTS.includes(initialSubject) ? initialSubject : 'Mathematics';
  const [filters, setFilters] = useState({ subject: supportedInitial, topic: 'all', difficulty: 'all', type: 'all' });
  const [count, setCount] = useState(5);
  const [session, setSession] = useState<PracticeQuestion[]>(() => selectPracticeQuestions({ bank: questionBank, filters: { subject: supportedInitial }, count: 5, recentIds: readRecent() }));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [diagnosis, setDiagnosis] = useState<PracticeDiagnosis | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [completed, setCompleted] = useState(0);
  const current = session[index];
  const topics = useMemo(() => topicsForSubject(filters.subject), [filters.subject]);
  const eligibleCount = useMemo(() => questionBank.filter((question) =>
    (filters.subject === 'all' || question.subject === filters.subject)
    && (filters.topic === 'all' || question.topic === filters.topic)
    && (filters.difficulty === 'all' || question.difficulty === filters.difficulty)
    && (filters.type === 'all' || question.type === filters.type)).length, [filters]);

  useEffect(() => {
    if (filters.topic !== 'all' && !topics.includes(filters.topic)) {
      setFilters((value) => ({ ...value, topic: 'all' }));
    }
  }, [filters.topic, topics]);

  const regenerate = (overrides = filters, requestedCount = count) => {
    const next = selectPracticeQuestions({ bank: questionBank, filters: overrides, count: requestedCount, recentIds: readRecent(), seed: Date.now() }) as PracticeQuestion[];
    setSession(next);
    setIndex(0);
    setAnswer('');
    setDiagnosis(null);
    setShowReasoning(false);
    setCompleted(0);
    if (next.length) {
      const recent = [...readRecent(), ...next.map((question) => question.id)];
      writeRecent(recent);
    }
  };

  const updateFilter = (name: string, value: string) => {
    const next = { ...filters, [name]: value, ...(name === 'subject' ? { topic: 'all' } : {}) };
    setFilters(next);
    window.setTimeout(() => regenerate(next), 0);
  };

  const check = () => {
    if (!current || answer === '') return;
    setDiagnosis(classifyPracticeAnswer(current, answer));
    try {
      if (!getUserContentStorageScope()) {
        setSaveMessage('Example checked. Sign in to keep a learning record.');
      } else {
      saveLearningRecord('practice_attempt', { id: `attempt:${crypto.randomUUID()}`, questionId: current.id, answer, confidence: null, hinted: false, seconds: 0, at: new Date().toISOString(), mode: 'mixed' });
      setSaveMessage('Saved on this device; account sync queued. Open the learning workspace for confidence and timing controls.');
      }
    } catch { setSaveMessage('The answer was checked but could not be saved. Free browser storage and try again.'); }
    setCompleted((value) => Math.max(value, index + 1));
  };

  const moveTo = (nextQuestion: PracticeQuestion | null = null) => {
    if (nextQuestion) {
      setSession((questions) => {
        const next = [...questions];
        next.splice(index + 1, 0, nextQuestion);
        return next;
      });
      writeRecent([...readRecent(), nextQuestion.id]);
    }
    setIndex((value) => Math.min(value + 1, session.length + (nextQuestion ? 0 : -1)));
    setAnswer('');
    setDiagnosis(null);
    setShowReasoning(false);
  };

  const targeted = current && diagnosis && !diagnosis.correct
    ? selectTargetedFollowUp(current, diagnosis, readRecent(), current.id.length + completed)
    : null;

  return (
    <section className="adaptive-practice" aria-labelledby="adaptive-practice-title">
      <header className="adaptive-practice-header">
        <div>
          <p className="exam-prep-kicker">Adaptive practice</p>
          <h2 id="adaptive-practice-title">One problem. One traceable next step.</h2>
          <p>Original questions checked against a fixed answer key. Practice evidence informs your concept model, not a predicted grade.</p>
        </div>
        <div className="adaptive-practice-progress" aria-live="polite">
          <span>{session.length ? `${Math.min(index + 1, session.length)} / ${session.length}` : '0 / 0'}</span>
          <small>{completed} checked</small>
        </div>
      </header>

      <p><Link to="/learn">Open diagnostics, knowledge and mistake review</Link></p>
      {saveMessage && <p role="status">{saveMessage}</p>}
      <div className="adaptive-practice-controls" aria-label="Practice controls">
        <SlidersHorizontal aria-hidden />
        <label>Subject<select value={filters.subject} onChange={(event) => updateFilter('subject', event.target.value)}>{PRACTICE_SUBJECTS.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
        <label>Topic<select value={filters.topic} onChange={(event) => updateFilter('topic', event.target.value)}><option value="all">All topics</option>{topics.map((topic) => <option key={topic}>{topic}</option>)}</select></label>
        <label>Difficulty<select value={filters.difficulty} onChange={(event) => updateFilter('difficulty', event.target.value)}><option value="all">Mixed</option>{PRACTICE_DIFFICULTIES.map((difficulty) => <option key={difficulty} value={difficulty}>{difficultyNames[difficulty]}</option>)}</select></label>
        <label>Type<select value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}><option value="all">Mixed</option>{PRACTICE_TYPES.map((type) => <option key={type} value={type}>{typeNames[type]}</option>)}</select></label>
        <label>Questions<select value={count} onChange={(event) => { const nextCount = Number(event.target.value); setCount(nextCount); window.setTimeout(() => regenerate(filters, nextCount), 0); }}>{[3, 5, 8, 10].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <button type="button" onClick={() => regenerate()}><RefreshCw aria-hidden /> New set</button>
      </div>

      {!current ? (
        <div className="adaptive-practice-empty" role="status">
          <Target aria-hidden />
          <h3>No question matches all four filters.</h3>
          <p>Broaden the topic, difficulty or type. The current bank has {eligibleCount} matching questions.</p>
          <button type="button" onClick={() => updateFilter('difficulty', 'all')}>Use mixed difficulty</button>
        </div>
      ) : (
        <article className="adaptive-question-card">
          <div className="adaptive-question-meta">
            <span>{current.subject}</span><span>{current.topic}</span><span>{difficultyNames[current.difficulty]}</span><span>{typeNames[current.type]}</span>
          </div>
          <div className="adaptive-question-prompt"><RichMarkdown>{current.prompt}</RichMarkdown></div>
          <p className="adaptive-question-rigour"><strong>Why this level:</strong> {current.difficultyReason}</p>

          {current.type === 'multiple-choice' ? (
            <fieldset className="adaptive-choice-list" disabled={Boolean(diagnosis)}>
              <legend className="sr-only">Choose one answer</legend>
              {(current.choices ?? []).map((choice: string, choiceIndex: number) => (
                <label key={choice}><input type="radio" name={`answer-${current.id}`} value={choiceIndex} checked={answer === String(choiceIndex)} onChange={(event) => setAnswer(event.target.value)} /><span><RichMarkdown>{choice}</RichMarkdown></span></label>
              ))}
            </fieldset>
          ) : (
            <label className="adaptive-numeric-answer">Your answer {current.units && <span>({current.units})</span>}<input value={answer} onChange={(event) => setAnswer(event.target.value)} inputMode="decimal" disabled={Boolean(diagnosis)} placeholder="Enter a number" /></label>
          )}

          {!diagnosis ? <button className="adaptive-check" type="button" onClick={check} disabled={answer === ''}>Check reasoning</button> : (
            <div className={`adaptive-feedback ${diagnosis.correct ? 'is-correct' : 'is-incorrect'}`} role="status">
              <div className="adaptive-feedback-title">{diagnosis.correct ? <CheckCircle2 aria-hidden /> : <XCircle aria-hidden />}<div><p>{diagnosis.correct ? 'Correct result' : (diagnosis.errorSubcategory ?? 'unclassified error').replace(/_/g, ' ')}</p><small>{diagnosis.correct ? 'The verified answer matches.' : `${diagnosis.errorCategory} error · suggested pattern, not a measured probability`}</small></div></div>
              <p>{diagnosis.evidence}</p>
              {!diagnosis.correct && <p><strong>Likely gap:</strong> {diagnosis.studentMisconception}</p>}
              <p><strong>Next step:</strong> {diagnosis.nextStep}</p>
              <div className="adaptive-feedback-actions">
                <button type="button" onClick={() => setShowReasoning((value) => !value)} aria-expanded={showReasoning}>{showReasoning ? 'Hide worked reasoning' : 'Show worked reasoning'}</button>
                {targeted && !diagnosis.correct && <button type="button" onClick={() => moveTo(targeted)}>Isolate this gap <ArrowRight aria-hidden /></button>}
                {index < session.length - 1 && <button type="button" onClick={() => moveTo()}>Next question <ArrowRight aria-hidden /></button>}
                {index >= session.length - 1 && <button type="button" onClick={() => regenerate()}>Build another set <RefreshCw aria-hidden /></button>}
              </div>
              {showReasoning && <div className="adaptive-worked"><p><strong>Verified answer:</strong> <RichMarkdown>{answerLabel(current)}</RichMarkdown></p><ol>{current.solution.map((step: string) => <li key={step}><RichMarkdown>{step}</RichMarkdown></li>)}</ol></div>}
            </div>
          )}
        </article>
      )}
    </section>
  );
}
