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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { boardLabel, daysUntilExam } from '@/lib/curriculum';
import {
  EXAM_PREP_PHASES,
  buildExamSession,
  chooseExamMission,
  getExamPrepPhase,
  summarizePreparationEvidence,
} from '@/lib/examPrepCore.mjs';
import { getPendingMockReview } from '@/lib/examFlow';
import { getLearnerProfile } from '@/lib/learnerProfile';
import { getDueRetries, retryTargetRoute } from '@/lib/retryQueue';
import { getDueFlashcardCount } from '@/lib/srDeck';
import { getLoopWeekStatus, recordLoopStep } from '@/lib/studyLoopTracker';
import { recordStudySession } from '@/lib/studyStats';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { getWeaknessHeatmap } from '@/lib/weaknessTracker';

type SessionState = {
  day: string;
  subject: string;
  minutes: number;
  completed: string[];
};

type Mission = ReturnType<typeof chooseExamMission>;

const SESSION_LENGTHS = [25, 45, 75];
const todayKey = () => new Date().toISOString().slice(0, 10);

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
  if (mission.kind === 'weak-topic') {
    return `/answer-reviewer?${new URLSearchParams({ subject, topic: mission.title.replace(/^Work on /, '') })}`;
  }
  return `/paper-maker?${new URLSearchParams({ subject })}`;
}

export default function ExamPrep() {
  const { user, loading: authLoading } = useAuth();
  const profile = useMemo(() => getLearnerProfile(user), [user]);
  const subjects = profile.curriculum.subjects;
  const storageKey = userContentStorageKeys(authLoading ? undefined : user?.id ?? null).examPrepSession;
  const [savedSession, setSavedSession] = useLocalStorage<SessionState>(storageKey, {
    day: todayKey(),
    subject: subjects[0] ?? '',
    minutes: profile.preferences.sessionMinutes,
    completed: [],
  });
  const [subject, setSubject] = useState(savedSession.subject || subjects[0] || 'General preparation');
  const [minutes, setMinutes] = useState(
    SESSION_LENGTHS.includes(savedSession.minutes) ? savedSession.minutes : profile.preferences.sessionMinutes,
  );

  useEffect(() => {
    const nextSubject = subjects.includes(savedSession.subject)
      ? savedSession.subject
      : subjects[0] || 'General preparation';
    setSubject(nextSubject);
    setMinutes(SESSION_LENGTHS.includes(savedSession.minutes) ? savedSession.minutes : 25);
  }, [savedSession.minutes, savedSession.subject, storageKey, subjects]);

  const days = daysUntilExam(profile.curriculum.examDate ?? null);
  const phaseKey = getExamPrepPhase(days);
  const phase = EXAM_PREP_PHASES[phaseKey];
  const weaknesses = getWeaknessHeatmap(20);
  const subjectWeaknesses = weaknesses.filter((item) => !subject || item.subject === subject);
  const weakestTopic = subjectWeaknesses[0] ?? weaknesses[0] ?? null;
  const dueRetries = getDueRetries();
  const dueRetry = dueRetries.find((item) => !subject || item.subject === subject) ?? dueRetries[0] ?? null;
  const dueCards = getDueFlashcardCount();
  const pendingMock = getPendingMockReview();
  const loop = getLoopWeekStatus();
  const profileReady = Boolean(
    profile.curriculum.board && profile.curriculum.examDate && profile.curriculum.subjects.length,
  );
  const mission = chooseExamMission({ pendingMock, dueRetry, weakestTopic, dueCards, subject });
  const blocks = buildExamSession({ minutes, phase: phaseKey, mission });
  const evidence = summarizePreparationEvidence({
    profileReady,
    loopSteps: loop.completed.length,
    measuredTopics: weaknesses.length,
    reviewedWork: Boolean(pendingMock || dueRetry),
  });
  const currentDay = todayKey();
  const completed = savedSession.day === currentDay ? savedSession.completed : [];
  const completedCount = blocks.filter((block) => completed.includes(`${subject}:${block.id}`)).length;

  const persistSession = (next: Partial<SessionState>) => {
    setSavedSession((previous) => ({
      day: currentDay,
      subject,
      minutes,
      completed: previous.day === currentDay ? previous.completed : [],
      ...next,
    }));
  };

  const selectSubject = (nextSubject: string) => {
    setSubject(nextSubject);
    persistSession({ subject: nextSubject });
  };

  const selectMinutes = (nextMinutes: number) => {
    setMinutes(nextMinutes);
    persistSession({ minutes: nextMinutes });
  };

  const toggleBlock = (id: string) => {
    const key = `${subject}:${id}`;
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

      <main className="exam-prep-shell">
        <header className="exam-prep-hero">
          <div className="exam-prep-hero-copy">
            <p className="exam-prep-kicker"><Target className="h-4 w-4" aria-hidden /> Personal exam plan</p>
            <h1>{phase.label}</h1>
            <p>{phase.description}</p>
            <div className="exam-prep-meta" aria-label="Exam target">
              <span><CalendarClock className="h-4 w-4" aria-hidden /> {countdownCopy(days)}</span>
              <span>{boardLabel(profile.curriculum.board) ?? 'Board not set'}</span>
              {profile.curriculum.grade ? <span>Year {profile.curriculum.grade}</span> : null}
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
              <p>Add your board, subjects, and exam date. Until then, this page can build a session, but it cannot time the preparation phases accurately.</p>
            </div>
            <Link to="/user-settings">Update profile <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </section>
        )}

        <div className="exam-prep-layout">
          <div className="exam-prep-main">
            <section className="exam-prep-panel" aria-labelledby="mission-title">
              <div className="exam-prep-section-head">
                <div>
                  <p className="exam-prep-kicker"><Gauge className="h-4 w-4" aria-hidden /> Best next move</p>
                  <h2 id="mission-title">{mission.title}</h2>
                </div>
                <Link to={missionRoute(mission, subject)} className="exam-prep-action">
                  Open task <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
              <p className="exam-prep-supporting-copy">{mission.detail}</p>
              <p className="exam-prep-evidence-note">
                This recommendation uses saved workflow signals only. It is not a predicted grade or an official assessment.
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
                  const isDone = completed.includes(`${subject}:${block.id}`);
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
                  <button type="button" onClick={() => persistSession({ completed: [] })}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reset
                  </button>
                )}
              </div>
            </section>
          </div>

          <aside className="exam-prep-sidebar">
            <section className="exam-prep-panel" aria-labelledby="subject-title">
              <p className="exam-prep-kicker">Session subject</p>
              <h2 id="subject-title">Choose one lane</h2>
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
                <span><strong>{weaknesses.length}</strong> verified topics</span>
                <span><strong>{dueRetries.length}</strong> retries due</span>
                <span><strong>{dueCards}</strong> cards due</span>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
