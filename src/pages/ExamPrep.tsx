import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Gauge,
  RotateCcw,
  Settings2,
  Target,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import ExamEvidence from '@/components/ExamEvidence';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { boardLabel, daysUntilExam } from '@/lib/curriculum';
import {
  EXAM_PREP_PHASES,
  buildExamSession,
  chooseExamMission,
  getExamPrepPhase,
  summarizePreparationEvidence,
  examDayKey,
  examSessionKey,
} from '@/lib/examPrepCore.mjs';
import { getPendingMockReview } from '@/lib/examFlow';
import { nextExamTarget } from '@/lib/examTargets.mjs';
import { getLearnerProfile } from '@/lib/learnerProfile';
import { readExamSessionHistoryState, saveExamSessionHistory } from '@/lib/examSessionStore';
import { normalizeExamSession } from '@/lib/examSessionHistory.mjs';
import { getPendingLearnerStateCount, initializeLearnerStateSync } from '@/lib/learnerStateSync';
import { getDueRetries, retryTargetRoute } from '@/lib/retryQueue';
import { getDueFlashcardCount } from '@/lib/srDeck';
import { getLoopWeekStatus, recordLoopStep } from '@/lib/studyLoopTracker';
import { recordStudySession } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';

type SessionState = {
  id?: string;
  startedAt?: string;
  updatedAt?: string;
  day: string;
  subject: string;
  minutes: number;
  completed: string[];
  mission?: Mission;
  mode?: string;
};

type Mission = ReturnType<typeof chooseExamMission>;

const SESSION_LENGTHS = [25, 45, 75];
const todayKey = examDayKey;

function countdownCopy(days: number | null) {
  if (days === null) return 'No exam date set';
  if (days < 0) return 'Exam date passed';
  if (days === 0) return 'Exam today';
  if (days === 1) return '1 day to go';
  return `${days} days to go`;
}

function missionRoute(mission: Mission, subject: string) {
  if (mission.kind === 'review-mock') return '/answer-reviewer';
  if (mission.kind === 'finish-mock') return '/paper-maker';
  if (mission.kind === 'retry' && mission.retryId) {
    const retry = getDueRetries().find((item) => item.id === mission.retryId);
    if (retry) return retryTargetRoute(retry);
  }
  if (mission.kind === 'flashcards') return '/notetaker?mode=study';
  if (mission.kind === 'revision') return `/notetaker?${new URLSearchParams({ subject })}`;
  if (mission.kind === 'weak-topic') {
    return `/answer-reviewer?${new URLSearchParams({ subject, topic: mission.title.replace(/^Work on /, '') })}`;
  }
  return `/paper-maker?${new URLSearchParams({ subject })}`;
}

export default function ExamPrep() {
  const [, refreshEvidence] = useState(0);
  useEffect(() => {
    const refresh = () => refreshEvidence((value) => value + 1);
    window.addEventListener('vertexed:learner-state-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('vertexed:learner-state-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  const [currentDay, setCurrentDay] = useState(todayKey);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      setCurrentDay(todayKey());
      clearTimeout(timer);
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refresh, midnight.getTime() - now.getTime() + 50);
    };
    refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const { user, loading: authLoading } = useAuth();
  const profile = useMemo(() => getLearnerProfile(user), [user]);
  const subjects = profile.curriculum.subjects;
  const storageKey = userContentStorageKeys(authLoading ? undefined : user?.id ?? null).examPrepSession;
  const defaultSession: SessionState = {
    day: todayKey(),
    subject: subjects[0] ?? '',
    minutes: profile.preferences.sessionMinutes,
    completed: [],
  };
  const [rawSavedSession, setSavedSession] = useLocalStorage<SessionState>(storageKey, defaultSession);
  const savedSession = rawSavedSession && typeof rawSavedSession === 'object' ? rawSavedSession : defaultSession;
  const [historyError, setHistoryError] = useState<string | null>(null);
  const history = readExamSessionHistoryState();
  const [subject, setSubject] = useState(savedSession.subject || subjects[0] || 'General preparation');
  const [minutes, setMinutes] = useState(
    SESSION_LENGTHS.includes(savedSession.minutes) ? savedSession.minutes : profile.preferences.sessionMinutes,
  );
  const [mode, setMode] = useState(savedSession.mode ?? 'recommended');

  useEffect(() => {
    const nextSubject = subjects.includes(savedSession.subject)
      ? savedSession.subject
      : subjects[0] || 'General preparation';
    setSubject(nextSubject);
    setMinutes(SESSION_LENGTHS.includes(savedSession.minutes) ? savedSession.minutes : 25);
    setMode(savedSession.mode ?? 'recommended');
  }, [savedSession.minutes, savedSession.subject, savedSession.mode, storageKey, subjects]);

  const examTarget = nextExamTarget(profile.curriculum.examTargets ?? [], subject, currentDay);
  const examDate = examTarget?.date ?? profile.curriculum.examDate ?? null;
  const days = daysUntilExam(examDate);
  const phaseKey = getExamPrepPhase(days);
  const phase = EXAM_PREP_PHASES[phaseKey];
  const weaknesses = getWeaknessHeatmap(500);
  const subjectWeaknesses = weaknesses.filter((item) => !subject || item.subject === subject);
  const weakestTopic = subjectWeaknesses.find((item) => item.avgPercent < 70) ?? null;
  const dueRetries = getDueRetries();
  const dueRetry = dueRetries.find((item) => !subject || item.subject === subject) ?? null;
  const dueCards = getDueFlashcardCount();
  const savedMock = getPendingMockReview();
  const pendingMock = savedMock?.subject === subject ? savedMock : null;
  const loop = getLoopWeekStatus();
  const profileReady = Boolean(
    profile.curriculum.board && examDate && profile.curriculum.subjects.length,
  );
  const recommendation = chooseExamMission({ pendingMock, dueRetry, weakestTopic, dueCards, subject, mode });
  const savedMatches = savedSession.day === currentDay && savedSession.subject === subject && savedSession.minutes === minutes && (savedSession.mode ?? 'recommended') === mode;
  const validSnapshot = normalizeExamSession(savedSession);
  const mission = savedMatches && validSnapshot ? validSnapshot.mission : recommendation;
  const sessionKey = examSessionKey({ day: currentDay, subject, minutes, mission });
  const blocks = buildExamSession({ minutes, phase: phaseKey, mission });
  const evidence = summarizePreparationEvidence({
    profileReady,
    loopSteps: loop.completed.length,
    measuredTopics: subjectWeaknesses.length,
    reviewedWork: Boolean(pendingMock || dueRetry),
  });
  const completed = savedMatches && validSnapshot ? validSnapshot.completed : [];
  const completedCount = blocks.filter((block) => completed.includes(`${sessionKey}:${block.id}`)).length;

  const persistSession = (next: Partial<SessionState>) => {
    const now = new Date().toISOString();
    const snapshot = {
      id: savedMatches && validSnapshot ? validSnapshot.id : crypto.randomUUID(),
      startedAt: savedMatches && validSnapshot ? validSnapshot.startedAt : now,
      updatedAt: now,
      day: currentDay,
      subject,
      minutes,
      mode,
      mission,
      completed: savedMatches && Array.isArray(savedSession.completed) ? savedSession.completed : [],
      ...next,
    };
    setSavedSession(snapshot);
    if (snapshot.mission && !saveExamSessionHistory(snapshot)) {
      setHistoryError('Session history could not be saved on this device. Keep this page open and export account data before trying recovery.');
    }
  };

  const selectSubject = (nextSubject: string) => {
    setSubject(nextSubject);
    persistSession({ subject: nextSubject, mission: undefined, completed: [] });
  };

  const selectMinutes = (nextMinutes: number) => {
    setMinutes(nextMinutes);
    persistSession({ minutes: nextMinutes, mission: undefined, completed: [] });
  };

  const toggleBlock = (id: string) => {
    const key = `${sessionKey}:${id}`;
    const wasComplete = completed.includes(key);
    const next = wasComplete
      ? completed.filter((item) => item !== key)
      : [...completed, key];
    persistSession({ completed: next });
    if (!wasComplete) {
      recordStudySession();
      if (id === 'retrieve') recordLoopStep('remember');
      if (id === 'practice') recordLoopStep(mission.kind === 'review-mock' ? 'review' : 'practise');
      if (id === 'review') recordLoopStep('review');
    }
    window.dispatchEvent(new Event('vertexed:learner-state-changed'));
  };

  return (
    <>
      <Helmet>
        <title>Exam Prep | VertexED</title>
        <meta
          name="description"
          content="A personalized exam-prep session built from your exam date, subjects, due reviews, and verified weak-topic evidence."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="exam-prep-shell workbook-exam">
        <header className="exam-prep-hero">
          <div className="exam-prep-hero-copy">
            <p className="exam-prep-kicker"><Target className="h-4 w-4" aria-hidden /> Personal exam plan</p>
            <h1>Exam preparation</h1>
            <p>{phase.description}</p>
            <div className="exam-prep-meta" aria-label="Exam target">
              <span><CalendarClock className="h-4 w-4" aria-hidden /> {countdownCopy(days)}</span>
              <span>{boardLabel(profile.curriculum.board) ?? 'Board not set'}</span>
              {profile.curriculum.grade ? <span>Year {profile.curriculum.grade}</span> : null}
              {examTarget ? <span>{examTarget.subject}{examTarget.paper ? `: ${examTarget.paper}` : ''} · {examTarget.date}</span> : null}
            </div>
          </div>
          <div className="exam-prep-phase-card">
            <span>Current phase</span>
            <strong>{phase.shortLabel}</strong>
            <small>Based on the exam date in your profile</small>
          </div>
        </header>

        {!profileReady && (
          <section className="exam-prep-setup" aria-labelledby="exam-setup-title">
            <Settings2 className="h-5 w-5" aria-hidden />
            <div>
              <h2 id="exam-setup-title">Finish your exam setup</h2>
              <p>Add your board, subjects, and exam date to tailor your plan. You can still start a practice session now.</p>
            </div>
            <Link to="/user-settings">Update profile <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </section>
        )}

        <div className="exam-prep-layout">
          <div className="exam-prep-main">
            <section className="exam-prep-panel" aria-labelledby="mission-title">
              <label className="block mb-4 text-sm">Session choice
                <select className="form-select mt-2 w-full" value={mode} onChange={(event) => {
                  setMode(event.target.value);
                  persistSession({ mode: event.target.value, mission: undefined, completed: [] });
                }}>
                  <option value="recommended">Use a recommendation</option>
                  <option value="practice">Practice</option>
                  <option value="revision">Revision</option>
                  <option value="diagnostic">Optional baseline practice</option>
                </select>
              </label>
              <div className="exam-prep-section-head">
                <div>
                  <p className="exam-prep-kicker"><Gauge className="h-4 w-4" aria-hidden /> Recommended next</p>
                  <h2 id="mission-title">{mission.title}</h2>
                </div>
                <Link to={missionRoute(mission, subject)} className="exam-prep-action">
                  Open task <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <p className="exam-prep-supporting-copy">{mission.detail}</p>
              <p className="exam-prep-evidence-note">
                Based on your saved work. This is a study suggestion, not a predicted grade.
              </p>
            </section>

            <section className="exam-prep-panel" aria-labelledby="session-title">
              <div className="exam-prep-section-head">
                <div>
                  <p className="exam-prep-kicker"><Clock3 className="h-4 w-4" aria-hidden /> Today&apos;s session</p>
                  <h2 id="session-title">A {minutes}-minute exam block</h2>
                </div>
                <div className="exam-prep-duration" aria-label="Session length">
                  {SESSION_LENGTHS.map((length) => (
                    <button
                      key={length}
                      type="button"
                      className={minutes === length ? 'is-active' : ''}
                      aria-pressed={minutes === length}
                      onClick={() => selectMinutes(length)}
                    >
                      {length}m
                    </button>
                  ))}
                </div>
              </div>

              <ol className="exam-prep-blocks">
                {blocks.map((block, index) => {
                  const isDone = completed.includes(`${sessionKey}:${block.id}`);
                  return (
                    <li key={block.id} className={isDone ? 'is-done' : ''}>
                      <button type="button" onClick={() => toggleBlock(block.id)} aria-pressed={isDone}>
                        <span className="exam-prep-check">
                          {isDone ? <Check className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                        </span>
                        <span className="exam-prep-block-number">0{index + 1}</span>
                        <span className="exam-prep-block-copy">
                          <strong>{block.title}</strong>
                          <small>{block.detail}</small>
                        </span>
                        <span className="exam-prep-block-time">{block.minutes} min</span>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="exam-prep-session-footer">
                <span>{completedCount}/{blocks.length} steps checked off on this device today</span>
                {completedCount > 0 && (
                  <button type="button" onClick={() => persistSession({ id: crypto.randomUUID(), startedAt: new Date().toISOString(), completed: [], mission: undefined })}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start another session
                  </button>
                )}
              </div>
            </section>
            <ExamEvidence subject={subject} />
            <section className="exam-prep-panel" aria-labelledby="session-history-title">
              <h2 id="session-history-title">Session history</h2>
              <p className="exam-prep-supporting-copy">Checked steps are self-reported activity, not proof of learning. Recent session snapshots are kept on this device and queued for account sync.</p>
              {historyError && <p role="alert" className="mt-3 text-destructive">{historyError}</p>}
              <p className="mt-3 text-sm" role="status">{getPendingLearnerStateCount()} learner changes awaiting sync</p>
              <button type="button" className="text-sm text-primary underline mt-2" onClick={() => {
                setHistoryError(null);
                void initializeLearnerStateSync().catch(() => setHistoryError('Account sync could not finish. Your pending changes have been kept for another attempt.'));
              }}>Retry account sync</button>
              {history.error ? <p role="alert" className="mt-4 text-sm">{history.error} <Link to="/user-settings" className="text-primary underline">Open account data export</Link></p> : history.entries.filter((entry) => entry.subject === subject).length === 0 ? <p className="mt-4 text-sm">No session history for {subject} yet.</p> : (
                <ol className="mt-4 divide-y divide-border">
                  {history.entries.filter((entry) => entry.subject === subject).map((entry) => <li key={entry.id} className="py-3 text-sm">
                    <p className="font-medium">{entry.mission.title}</p>
                    <p>{entry.day} · {entry.minutes} minutes planned · {entry.completed.length}/3 steps checked</p>
                    <p className="text-muted-foreground">Started {new Date(entry.startedAt).toLocaleString()}</p>
                  </li>)}
                </ol>
              )}
            </section>
          </div>

          <aside className="exam-prep-sidebar">
            <section className="exam-prep-panel" aria-labelledby="subject-title">
              <p className="exam-prep-kicker">Session subject</p>
              <h2 id="subject-title">What are you studying?</h2>
              <div className="exam-prep-subjects">
                {(subjects.length ? subjects : ['General preparation']).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={subject === item ? 'is-active' : ''}
                    aria-pressed={subject === item}
                    onClick={() => selectSubject(item)}
                  >
                    {item}<ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                ))}
              </div>
            </section>

            <section className="exam-prep-panel" aria-labelledby="evidence-title">
              <p className="exam-prep-kicker"><BookOpenCheck className="h-4 w-4" aria-hidden /> Preparation evidence</p>
              <h2 id="evidence-title">{evidence.complete} of {evidence.total} signals available</h2>
              <ul className="exam-prep-evidence-list">
                {evidence.checks.map((check) => (
                  <li key={check.id} className={check.complete ? 'is-complete' : ''}>
                    {check.complete ? <Check className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                    {check.label}
                  </li>
                ))}
              </ul>
              <div className="exam-prep-facts">
                <span><strong>{subjectWeaknesses.length}</strong> topics with recorded marks in {subject}</span>
                <span><strong>{dueRetries.filter((retry) => retry.subject === subject).length}</strong> retries due in {subject}</span>
                <span><strong>{dueCards}</strong> cards due across subjects</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  );
}
