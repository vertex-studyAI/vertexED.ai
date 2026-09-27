import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccessibleModal from "@/components/AccessibleModal";
import Calendar from "./components/Calendar";
import Schedule, { TaskItem } from "./components/Schedule";
import TimeLeftWidget from "./components/TimeLeftWidget";
import "./styles/planner.css";
import { textToTask, suggestWeekPlan } from "./ai/gemini";
import { recordStudySession } from "@/lib/studyStats";
import { recordLoopStep } from "@/lib/studyLoopTracker";
import { logStudyActivity } from "@/lib/studyActivity";
import { useAuth } from "@/contexts/AuthContext";
import { getLearnerProfile } from "@/lib/learnerProfile";
import { daysUntilExam } from "@/lib/curriculum";
import { nextExamTarget } from "@/lib/examTargets.mjs";
import { getWeakestTopics } from "@/lib/weaknessTracker";
import { Link, useSearchParams } from "react-router";
import { loadPlannerSnapshot, savePlannerSnapshot } from "@/lib/plannerSync";
import { createPlannerTask, placeSuggestedTasks, plannerDateToInput, plannerTimeToInput, normalizeStoredPlannerTask } from "@/lib/plannerTasks.mjs";
import StudySaveStatus from '@/components/StudySaveStatus';
import { listStudyArtifactsDetailed } from '@/lib/userContent';
import { plannerPlanError } from "@/lib/plannerPlanError.mjs";

import { createWeeklyCommitments, rebalanceMissedTasks, plannerWorkload } from '@/lib/plannerRebalance.mjs';

function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

const PlannerView: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const [searchParams, setSearchParams] = useSearchParams();
  const weekPlanTriggered = useRef(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mode, setMode] = useState("Day");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(() => (typeof window !== 'undefined') ? window.matchMedia('(max-width: 900px)').matches : false);
  const [linkedReview, setLinkedReview] = useState<string | null>(null);
  const [linkedReviewContext, setLinkedReviewContext] = useState<{ question: string; answer: string; feedback: string } | null>(null);
  const [plannerSaving, setPlannerSaving] = useState(false);
  const [plannerSaveFailed, setPlannerSaveFailed] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiInputRef = useRef<HTMLInputElement>(null);
  const [weekPlanBusy, setWeekPlanBusy] = useState(false);
  const [useAi, setUseAi] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [planNotice, setPlanNotice] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const requestRevision = useRef(0);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const [taskDate, setTaskDate] = useState(""); // yyyy-mm-dd from input[type=date]
  const [taskStartTime, setTaskStartTime] = useState(""); // HH:MM from input[type=time]
  const [taskDuration, setTaskDuration] = useState(""); // minutes string
  const [taskKind, setTaskKind] = useState('study');
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [autoMove, setAutoMove] = useState(false);
  const [windowFrom, setWindowFrom] = useState('17:00');
  const [windowTo, setWindowTo] = useState('20:00');
  const [dailyMinutes, setDailyMinutes] = useState(120);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(2);
  // Mobile calendar collapse
  const [mobileCalOpen, setMobileCalOpen] = useState(false);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editDate, setEditDate] = useState(""); // yyyy-mm-dd
  const [editStartTime, setEditStartTime] = useState(""); // HH:MM
  const [editDuration, setEditDuration] = useState(""); // minutes
  const editNameRef = useRef<HTMLInputElement>(null);
  const [plannerLoading, setPlannerLoading] = useState(true);
  const hydratedUserIdRef = useRef<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cloudSynced, setCloudSynced] = useState(true);
  const plannerReady = !plannerLoading && hydratedUserIdRef.current === currentUserId;

  useEffect(() => {
    let cancelled = false;
    const hydrationUserId = currentUserId;
    hydratedUserIdRef.current = null;
    setPlannerLoading(true);
    setSyncError(null);
    setCloudSynced(true);
    requestRevision.current += 1;
    setAiBusy(false);
    setWeekPlanBusy(false);
    setPlanError(null);
    setPlanNotice(null);
    setAiOpen(false);
    setLinkedReview(null);
    setPlannerSaveFailed(false);
    setEditOpen(false);
    setEditTask(null);
    weekPlanTriggered.current = false;
    void loadPlannerSnapshot(currentUserId).then(({ snapshot, cloudSynced: synced, error, readOnly }) => {
      if (cancelled) return;
      setTasks(snapshot.tasks);
      setMode(snapshot.mode);
      setCloudSynced(synced);
      setSyncError(error ?? null);
      hydratedUserIdRef.current = readOnly ? null : hydrationUserId;
      setPlannerLoading(false);
    });
    return () => {
      cancelled = true;
      requestRevision.current += 1;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!plannerReady) return;
    let cancelled = false;
    setPlannerSaving(true);
    // Persist immediately after an action. A navigation must not discard an
    // edit during a debounce window. Cloud writes remain serialized by the store.
    void savePlannerSnapshot({
      tasks, mode, updatedAt: new Date().toISOString(),
    }, currentUserId).then((result) => {
      if (cancelled) return;
      setCloudSynced(result.cloudSynced);
      setPlannerSaving(false);
      setPlannerSaveFailed(!result.ok);
      setSyncError(result.error ?? null);
    });
    return () => { cancelled = true; };
  }, [tasks, mode, plannerReady, currentUserId]);

  useEffect(() => {
    if (!plannerReady) return;
    const rebalance = () => {
      const result = rebalanceMissedTasks(tasksRef.current);
      if (result.moved) {
        setTasks(result.tasks);
        setPlanNotice(`Moved ${result.moved} missed study task${result.moved === 1 ? '' : 's'} within your chosen study windows. Open a task to adjust or lock its time.`);
      }
    };
    rebalance();
    const timer = window.setInterval(rebalance, 60_000);
    return () => window.clearInterval(timer);
  }, [plannerReady, currentUserId]);

  // Listen for viewport changes to determine mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      const match = (e as MediaQueryList).matches;
      setIsMobile(match);
    };
    handler(mq);
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    } else {
      mq.addListener(handler);
    }
    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener('change', handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, []);

  // Force Day mode on mobile if Week was set
  useEffect(() => {
    if (isMobile && mode === 'Week') setMode('Day');
  }, [isMobile, mode]);

  const formattedHeaderDate = useMemo(() => {
    const day = selectedDate.getDate();
    const ordinalDay = `${day}${getOrdinalSuffix(day)}`;
    const weekday = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
    const month = selectedDate.toLocaleDateString('en-US', { month: 'short' });
    const year = selectedDate.getFullYear();
    return `${weekday}, ${month} ${ordinalDay}, ${year}`;
  }, [selectedDate]);

  useEffect(() => {
    const reviewId = searchParams.get('review');
    if (!reviewId || !plannerReady) return;
    let cancelled = false;
    void listStudyArtifactsDetailed('review', { id: reviewId, limit: 1 }).then(result => {
      if (cancelled || getUserContentStorageScope() !== currentUserId) return;
      const review = result.items.find(item => item.id === reviewId && item.kind === 'review');
      if (!review) { setPlanError('The original review could not be loaded. Open it from Saved work and try scheduling again.'); return; }
      const metadata = review.payload.metadata as Record<string, unknown> | undefined;
      const question = typeof metadata?.question === 'string' ? metadata.question : review.title || 'your answer';
      setTaskKind('study'); setAutoMove(false); setDueDate(''); setPriority(2);
      setLinkedReview(review.id);
      setLinkedReviewContext({ question, answer: typeof metadata?.answer === 'string' ? metadata.answer : '', feedback: typeof review.payload.review === 'string' ? review.payload.review : '' });
      setUseAi(false);
      setAiInput(`Retry: ${question}`.slice(0, 160));
      const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
      setTaskDate(`${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`);
      setTaskStartTime('17:00'); setTaskDuration('20'); setAiError(null); setAiOpen(true);
      setSearchParams(previous => { const next = new URLSearchParams(previous); next.delete('review'); return next; }, { replace: true });
    }).catch(() => { if (!cancelled) setPlanError('The original review could not be loaded. Your plan has not changed.'); });
    return () => { cancelled = true; };
  }, [searchParams, plannerReady, currentUserId, setSearchParams]);

  const selectedInputDate = () => `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const openNewTask = () => {
    setLinkedReview(null);
    setTaskKind('study'); setAutoMove(false); setDueDate(''); setPriority(2);
    setUseAi(false); setAiInput(""); setAiError(null);
    setTaskDate(selectedInputDate()); setTaskStartTime("10:00"); setTaskDuration("60");
    setAiOpen(true);
  };

  const handleTaskComplete = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!plannerReady || !task) return;
    setTasks((prev) => prev.map((item) => item.id === id ? { ...item, completed: true, completedAt: new Date().toISOString() } : item));
    if (task.taskKind === 'commitment') return;
    recordStudySession();
    recordLoopStep("plan");
    logStudyActivity(`Completed planner task: ${task["task name"]}`);
  };

  const reopenTask = (task: TaskItem) => {
    try {
      createPlannerTask({ id: task.id, name: task['task name'], date: plannerDateToInput(task.date), startTime: plannerTimeToInput(task['start time']), duration: task['task duration'] }, tasks, task.id);
      setTasks(previous => previous.map(item => item.id === task.id ? { ...item, completed: false, completedAt: undefined } : item));
      setPlanError(null);
    } catch (error) { setPlanError(plannerPlanError(error, 'task')); }
  };

  const handleEditTask = (task: TaskItem) => {
    setEditTask(task); setAutoMove(Boolean(task.reschedule)); setEditError(null);
    setEditName(String(task["task name"]));
    setEditDate(plannerDateToInput(task.date));
    setEditStartTime(plannerTimeToInput(task["start time"]));
    setEditDuration(String(task["task duration"]));
    setEditOpen(true);
  };

  const saveEditedTask = () => {
    if (!plannerReady || !editTask) return;
    try {
      if (editTask.dueDate && editDate > editTask.dueDate) throw new Error('Choose a date on or before this task’s deadline.');
      const updated = createPlannerTask({
        id: editTask.id, name: editName, date: editDate,
        startTime: editStartTime, duration: editDuration,
      }, tasks, editTask.id);
      const merged = normalizeStoredPlannerTask({ ...editTask, ...updated, reschedule: autoMove ? editTask.reschedule : undefined });
      setTasks(prev => prev.map(task => task.id === editTask.id ? merged : task));
      setEditOpen(false);
    } catch (error) { setEditError(plannerPlanError(error, 'task')); }
  };

  const suggestWeekFromAI = useCallback(async () => {
    if (!plannerReady || weekPlanBusy || aiBusy) return;
    const revision = ++requestRevision.current;
    const startingTasks = tasks;
    setPlanError(null); setPlanNotice(null);
    setWeekPlanBusy(true);
    try {
      const profile = getLearnerProfile(user);
      const weak = getWeakestTopics(5).map((w) => `${w.subject}: ${w.topic}`);
      const planned = await suggestWeekPlan({
        weaknesses: weak,
        subjects: profile.curriculum.subjects,
        examDaysLeft: (() => {
          const days = daysUntilExam(nextExamTarget(profile.curriculum.examTargets ?? [], '')?.date ?? profile.curriculum.examDate);
          return days === null ? null : Math.max(0, days);
        })(),
        examTargets: profile.curriculum.examTargets?.map(({ subject, paper, date }) => ({ subject, paper, date })),
        hoursPerDay: 2,
        existingTasks: tasks.filter(task => !task.completed),
      });
      if (revision !== requestRevision.current || getUserContentStorageScope() !== currentUserId) return;
      if (tasksRef.current !== startingTasks) throw new Error("Your plan changed while the suggestion was loading. Try again with the updated plan.");
      const withIds = placeSuggestedTasks(planned.map(task => ({ ...task, id: crypto.randomUUID() })), startingTasks);
      setTasks(prev => [...prev, ...withIds]);
      setPlanNotice(`Added ${withIds.length} suggested tasks. Check their dates and times before starting.`);
      logStudyActivity("AI generated adaptive week study plan");
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete("suggest");
        return next;
      }, { replace: true });
    } catch (e) {
      if (revision === requestRevision.current) setPlanError(plannerPlanError(e));
    } finally {
      if (revision === requestRevision.current) setWeekPlanBusy(false);
    }
  }, [user, tasks, setSearchParams, plannerReady, weekPlanBusy, aiBusy, currentUserId]);

  useEffect(() => {
    if (searchParams.get("suggest") !== "1" || !plannerReady || weekPlanTriggered.current) return;
    weekPlanTriggered.current = true;
    void suggestWeekFromAI();
  }, [searchParams, suggestWeekFromAI, plannerReady]);

  const addTask = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!plannerReady || aiBusy) return;
    setAiError(null);
    if (!useAi) {
      try {
        const task = createPlannerTask({
          id: crypto.randomUUID(), name: aiInput, date: taskDate,
          startTime: taskStartTime, duration: taskDuration,
        }, tasks);
        if (dueDate && taskDate > dueDate) throw new Error('Choose a deadline on or after the scheduled date.');
        const planned = taskKind === 'commitment' && !linkedReview ? createWeeklyCommitments({ id: task.id, name: aiInput, date: taskDate, startTime: taskStartTime, duration: taskDuration }, tasks, repeatWeeks)
          : [normalizeStoredPlannerTask({ ...task, taskKind: 'study', priority, dueDate,
            reschedule: autoMove ? { from: windowFrom, to: windowTo, dailyMinutes } : undefined })];
        setTasks(prev => [...prev, ...planned.map(task => linkedReview ? { ...task, reviewArtifactId: linkedReview, reviewContext: linkedReviewContext } : task)]);
        setPlanNotice(linkedReview ? 'Retry added to your plan. Open the task to return to your original question, answer and feedback.' : taskKind === 'commitment' ? `Added ${repeatWeeks} weekly commitments. Each occurrence can be edited separately.` : 'Study task added.');
        setLinkedReview(null);
        const [year, month, day] = taskDate.split("-").map(Number);
        setSelectedDate(new Date(year, month - 1, day));
        setAiOpen(false);
      } catch (error) { setAiError(plannerPlanError(error, 'task')); }
      return;
    }
    if (weekPlanBusy) return;
    const revision = ++requestRevision.current;
    const startingTasks = tasks;
    setAiBusy(true);
    try {
      const suggestion = await textToTask(aiInput, [], startingTasks);
      if (revision !== requestRevision.current || getUserContentStorageScope() !== currentUserId) return;
      if (tasksRef.current !== startingTasks) throw new Error("Your plan changed while the suggestion was loading. Try again with the updated plan.");
      const [task] = placeSuggestedTasks([{ ...suggestion, id: crypto.randomUUID() }], startingTasks);
      setTasks(prev => [...prev, task]);
      const [year, month, day] = plannerDateToInput(task.date).split("-").map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      setPlanNotice(`Added ${task["task name"]} on ${task.date} at ${task["start time"]}. Open it to adjust the suggestion.`);
      setAiOpen(false);
    } catch (error) {
      if (revision === requestRevision.current) setAiError(plannerPlanError(error, 'task'));
    } finally {
      if (revision === requestRevision.current) setAiBusy(false);
    }
  };

  const workload = plannerWorkload(tasks);
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed).slice(-20).reverse();

  return (
    <div className="planner-root" aria-busy={plannerLoading}>
      <div className="planner-header">
        <h1 className="planner-title">{formattedHeaderDate}</h1>
        <StudySaveStatus state={plannerLoading ? 'loading' : plannerSaving ? 'saving' : plannerSaveFailed ? 'failed' : cloudSynced ? 'cloud' : 'device'} onRetry={plannerReady ? () => setTasks(previous => [...previous]) : undefined} />
          {!plannerLoading && !cloudSynced && (
            <div
              className="planner-recovery flex flex-col items-start gap-2 rounded-lg border border-primary/30 bg-background px-4 py-3 text-sm text-foreground"
              role={plannerReady ? "status" : "alert"}
            >
              <span className="font-medium">{plannerReady ? plannerSaveFailed ? 'Device save failed' : 'Saved on this device' : 'Planner recovery needs attention'}</span>
              <span className="opacity-90 leading-snug">{syncError || 'Planner not synced to cloud'}</span>
              <button type="button" className="planner-today" onClick={() => {
                if (!window.confirm('Load the cloud planner? Your current local copy will be kept in your account export as a recovery backup.')) return;
                setPlannerLoading(true);
                void loadPlannerSnapshot(currentUserId, true).then(result => {
                  if (getUserContentStorageScope() !== currentUserId) return;
                  setTasks(result.snapshot.tasks); setMode(result.snapshot.mode);
                  setCloudSynced(result.cloudSynced); setSyncError(result.error ?? null);
                  hydratedUserIdRef.current = result.readOnly ? null : currentUserId; setPlannerLoading(false);
                });
              }}>Reload cloud copy</button>
              {!plannerReady && <a className="text-primary underline" href="/user-settings">Open account data export</a>}
            </div>
          )}
        <div className="planner-controls">
          {!isMobile && (
            <select className="planner-select" value={mode} onChange={(e) => setMode(e.target.value)} disabled={!plannerReady} aria-label="Planner view">
              <option value="Day">Day</option>
              <option value="Week">Week</option>
            </select>
          )}
          <button className="planner-today" onClick={() => setSelectedDate(new Date())}>Today</button>
        </div>
	<div className="planner-actions">
          <button className="planner-new" disabled={!plannerReady} onClick={openNewTask}>New Task</button>
          <button className="planner-today" disabled={!plannerReady || weekPlanBusy || aiBusy} onClick={() => void suggestWeekFromAI()}>
            {weekPlanBusy ? "Planning…" : "AI week plan"}
          </button>
	  <button
	    type="button"
	    className="mobile-cal-toggle planner-today"
	    onClick={() => setMobileCalOpen(o => !o)}
	    aria-expanded={mobileCalOpen}
	    aria-controls="planner-mobile-calendar"
	  >
	    {mobileCalOpen ? 'Hide calendar' : 'Show calendar'}
	  </button>
	</div>
      </div>
      {plannerReady && <section className="planner-workload mx-4 my-4 border-y border-border py-4" aria-label="Planner workload">
        <h2 className="text-lg font-semibold">Your study week</h2>
        <p>{workload.planned} minutes planned in the next 7 days · {workload.completed} scheduled minutes marked complete in the last 7 days · {workload.backlog.length} missed tasks</p>
        <p className="text-sm text-muted-foreground">Completed time uses each task’s planned duration, not a measured timer. Fixed commitments reserve time and do not count as studying.</p>
        {workload.backlog.length > 0 && <details><summary className="min-h-11 cursor-pointer">Review missed work</summary><ul>{workload.backlog.map((task: TaskItem) => <li key={task.id}><button className="planner-today" onClick={() => handleEditTask(task)}>{task['task name']} · {task.reschedule ? 'No available slot before its deadline or within 14 days' : 'Fixed time; choose a new date'}</button></li>)}</ul></details>}
        {completedTasks.length > 0 && <details><summary className="min-h-11 cursor-pointer">Recent completed tasks</summary><ul>{completedTasks.map(task => <li key={task.id} className="flex flex-wrap items-center gap-2">{task['task name']} · {task['task duration']} minutes <button className="planner-today" onClick={() => reopenTask(task)}>Reopen {task['task name']}</button><button className="planner-today" onClick={() => handleEditTask(task)}>Change time for {task['task name']}</button></li>)}</ul></details>}
      </section>}
      {planError && <p role="alert" className="planner-message">{planError}</p>}
      {planNotice && <p role="status" className="planner-message">{planNotice}</p>}
      {activeTasks.some(task => typeof task.reviewArtifactId === 'string') && <section className="surface-tile mx-4 my-4 p-4" aria-labelledby="planned-retries-heading">
        <h2 id="planned-retries-heading" className="text-lg font-semibold">Planned retries</h2>
        <ul className="mt-2 space-y-2">{activeTasks.filter(task => typeof task.reviewArtifactId === 'string').map(task => <li key={task.id}><button type="button" className="text-link text-left min-h-11" disabled={!plannerReady} onClick={() => handleEditTask(task)}>{task['task name']} · {task.date} · {task['start time']}</button></li>)}</ul>
      </section>}

      {(getLearnerProfile(user).curriculum.examTargets ?? []).length > 0 && (
        <section className="mx-4 my-4 border-y border-border py-4" aria-label="Exam timetable">
          <h2 className="text-lg font-semibold">Exam timetable</h2>
          <ul className="mt-2 flex flex-wrap gap-3">
            {getLearnerProfile(user).curriculum.examTargets?.slice().sort((a, b) => a.date.localeCompare(b.date)).map((target) => (
              <li key={target.id}><button type="button" className="text-left text-sm text-primary underline p-2" onClick={() => { const [year, month, day] = target.date.split('-').map(Number); setSelectedDate(new Date(year, month - 1, day)); }}>
                {target.subject}{target.paper ? `: ${target.paper}` : ''} · {target.date}
              </button></li>
            ))}
          </ul>
        </section>
      )}
      {!plannerReady ? (
        <div
          className="mx-4 my-6 rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-sm"
          role="status"
          aria-live="polite"
        >
          <p className="font-medium">{plannerLoading ? 'Loading your saved planner…' : 'Editing is paused to preserve your device data.'}</p>
          <p className="mt-1 opacity-75">{plannerLoading ? 'Editing will be available after the latest saved state for this account is ready.' : 'Use the recovery controls above before changing this plan.'}</p>
        </div>
      ) : (
        <>
          <div className="planner-calendar-layout">
            <div id="planner-mobile-calendar" hidden={isMobile && !mobileCalOpen} className={`mobile-calendar-wrapper ${mobileCalOpen ? 'open' : ''}`}>
              <Calendar onDateChange={setSelectedDate} selectedDate={selectedDate} mode={mode} />
            </div>
            <Schedule mode={mode} selectedDate={selectedDate} tasks={activeTasks} onTaskComplete={handleTaskComplete} onEditTask={handleEditTask} />
          </div>
          <TimeLeftWidget />
        </>
      )}

      {plannerReady && aiOpen && (
        <AccessibleModal
          titleId="planner-ai-dialog-title"
          descriptionId="planner-ai-dialog-description"
          onClose={() => setAiOpen(false)}
          initialFocusRef={aiInputRef}
          busy={aiBusy}
          className="popup planner-task-dialog"
        >
          <div className="planner-dialog-heading">
            <h2 id="planner-ai-dialog-title">Add a study task</h2>
            <button className="planner-today" type="button" aria-label="Close add task dialog" disabled={aiBusy} onClick={() => setAiOpen(false)}>Close</button>
          </div>
          <p id="planner-ai-dialog-description">{linkedReview ? 'Choose when to retry this question. The task keeps a link to your saved original; this does not confirm a mark.' : 'Choose a time yourself, or ask AI to find a free slot.'}</p>
          <div hidden={Boolean(linkedReview)} className="planner-entry-modes" aria-label="Task entry method">
            <button type="button" aria-pressed={!useAi} disabled={aiBusy} onClick={() => { setUseAi(false); setAiError(null); }}>Manual entry</button>
            <button type="button" aria-pressed={useAi} disabled={aiBusy || weekPlanBusy} onClick={() => { setUseAi(true); setAiError(null); }}>AI suggestion</button>
          </div>
          <form onSubmit={addTask} className="planner-task-form">
            <label htmlFor="planner-ai-task-input">{useAi ? "Task description" : "Task name"}</label>
            <input ref={aiInputRef} id="planner-ai-task-input" type="text" required maxLength={useAi ? 2000 : 160} disabled={aiBusy}
              placeholder={useAi ? "Revise cell transport tomorrow for 45 minutes" : "Revise cell transport"}
              value={aiInput} onChange={event => { setAiInput(event.target.value); setAiError(null); }} />
            {!useAi && (
              <div className="planner-task-fields">
                <label>Date<input type="date" required min="2000-01-01" max="2100-12-31" value={taskDate} onChange={event => setTaskDate(event.target.value)} /></label>
                <label>Start time<input type="time" required value={taskStartTime} onChange={event => setTaskStartTime(event.target.value)} /></label>
                <label>Duration (minutes)<input type="number" required min={15} max={480} step={1} value={taskDuration} onChange={event => setTaskDuration(event.target.value)} /></label>
              </div>
            )}
            {!useAi && !linkedReview && <fieldset className="planner-capacity-fields">
              <legend>Availability and priority</legend>
              <label>Task type<select value={taskKind} onChange={event => setTaskKind(event.target.value)}><option value="study">Study task</option><option value="commitment">Weekly commitment</option></select></label>
              {taskKind === 'commitment' ? <label>Weekly occurrences<input type="number" min={2} max={12} value={repeatWeeks} onChange={event => setRepeatWeeks(Number(event.target.value))} /></label> : <>
                <label>Priority<select value={priority} onChange={event => setPriority(Number(event.target.value))}><option value={3}>High</option><option value={2}>Normal</option><option value={1}>Low</option></select></label>
                <label>Deadline (optional)<input type="date" min={taskDate || '2000-01-01'} max="2100-12-31" value={dueDate} onChange={event => setDueDate(event.target.value)} /></label>
                <label className="planner-check"><input type="checkbox" checked={autoMove} onChange={event => setAutoMove(event.target.checked)} />Automatically reschedule if missed</label>
                {autoMove && <><label>Study window starts<input type="time" required value={windowFrom} onChange={event => setWindowFrom(event.target.value)} /></label><label>Study window ends<input type="time" required value={windowTo} onChange={event => setWindowTo(event.target.value)} /></label><label>Daily study limit (minutes)<input type="number" required min={15} max={480} value={dailyMinutes} onChange={event => setDailyMinutes(Number(event.target.value))} /></label><p className="text-sm">When you open the planner, missed tasks move to a free slot in the next 14 days, within this daily window and before the deadline. Existing appointments stay fixed.</p></>}
              </>}
            </fieldset>}
            <p className="planner-form-hint">{useAi ? "Suggestions use your existing plan to avoid clashes. Check the date and time after adding." : "Manual tasks do not use AI. Tasks stay within one day and cannot overlap."}</p>
            {aiError && <p role="alert" className="planner-form-error">{aiError}</p>}
            <div className="planner-dialog-actions">
              <button type="button" className="planner-today" disabled={aiBusy} onClick={() => setAiOpen(false)}>Cancel</button>
              <button type="submit" className="planner-new" disabled={aiBusy || !aiInput.trim()}>{aiBusy ? "Finding a slot…" : useAi ? "Suggest and add" : "Add task"}</button>
            </div>
          </form>
        </AccessibleModal>
      )}

      {plannerReady && editOpen && editTask && (
        <AccessibleModal
          titleId="planner-edit-dialog-title"
          descriptionId="planner-edit-dialog-description"
          onClose={() => setEditOpen(false)}
          initialFocusRef={editNameRef}
          className="popup task-popup planner-task-dialog"
        >
            <div className="planner-dialog-heading">
              <h2 id="planner-edit-dialog-title">Edit task</h2>
              <button type="button" className="planner-today" aria-label="Close edit task dialog" onClick={() => setEditOpen(false)}>Close</button>
            </div>
            <p id="planner-edit-dialog-description" className="sr-only">Update the task name, date, start time, or duration.</p>
            {editTask.reviewContext && typeof editTask.reviewContext.question === 'string' && <details className="surface-tile p-3 my-3"><summary className="min-h-11 cursor-pointer">Original attempt and feedback</summary><p className="whitespace-pre-wrap mt-3">{editTask.reviewContext.question}</p>{typeof editTask.reviewContext.answer === 'string' && <p className="whitespace-pre-wrap mt-3">{editTask.reviewContext.answer}</p>}{typeof editTask.reviewContext.feedback === 'string' && <p className="whitespace-pre-wrap mt-3 text-muted-foreground">{editTask.reviewContext.feedback}</p>}<p className="mt-3 text-sm text-muted-foreground">Kept with this task so you can retry even if the original device save moves to your account. AI feedback remains provisional.</p></details>}
            {typeof editTask.reviewArtifactId === 'string' && <Link className="text-link inline-flex min-h-11 items-center" to={`/saved-work?item=${encodeURIComponent(editTask.reviewArtifactId)}`}>Open original question and feedback</Link>}
            <div className="modal-body planner-task-form" style={{ display:'grid', gap:12 }}>
              <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <span>Task name</span>
                <input ref={editNameRef} type="text" className="neu-input-el" value={editName} onChange={(e)=>setEditName(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
              </label>
              <div className="planner-task-fields">
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Date</span>
                  <input type="date" className="neu-input-el" value={editDate} onChange={(e)=>setEditDate(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Start time</span>
                  <input type="time" className="neu-input-el" value={editStartTime} onChange={(e)=>setEditStartTime(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
                </label>
                <label style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <span>Duration (min)</span>
                  <input type="number" min={15} max={480} step={1} className="neu-input-el" value={editDuration} onChange={(e)=>setEditDuration(e.target.value)} style={{ border:'1px solid hsl(var(--foreground)/0.2)', borderRadius:8, padding:'0.5rem' }} />
                </label>
              </div>
            </div>
            {editTask.reschedule && <label className="planner-check"><input type="checkbox" checked={autoMove} onChange={event => setAutoMove(event.target.checked)} />Automatically reschedule if missed ({editTask.reschedule.from}–{editTask.reschedule.to}, up to {editTask.reschedule.dailyMinutes} minutes daily). Uncheck to lock this time.</label>}
            {editTask.rescheduledFrom && <p className="text-sm">Moved from {editTask.rescheduledFrom} because the study task was missed.</p>}
            {editTask.seriesId && <p className="text-sm">This edits one weekly occurrence. Other commitments keep their times.</p>}
            {editError && <p role="alert" className="planner-form-error">{editError}</p>}
            <div className="modal-footer" style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'space-between', marginTop:12 }}>
              <div style={{ display:'flex', gap:8 }}>
                <button className="planner-today" onClick={()=>{ if(editTask) { setTasks(prev=>prev.filter(t=>t.id!==editTask.id)); setEditOpen(false);} }}>Delete</button>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="planner-today" onClick={()=> setEditOpen(false)}>Cancel</button>
                <button className="planner-new" onClick={saveEditedTask}>Save</button>
              </div>
            </div>
        </AccessibleModal>
      )}
    </div>
  );
};

export default PlannerView;
