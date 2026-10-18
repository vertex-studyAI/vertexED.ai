import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';
import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
import { resolveLocalStorage, safeStorageGet } from '@/lib/browserStorage.mjs';
import { loadPlannerSnapshot } from '@/lib/plannerSync';
import { focusElapsed, readFocusWorkspace, saveFocusWorkspace, settleFocusWorkspace, updateFocusWorkspace } from '@/lib/focusSession.mjs';
import { recordStudySession } from '@/lib/studyStats';
import { recordLoopStep } from '@/lib/studyLoopTracker';
import { logStudyActivity } from '@/lib/studyActivity';

type FocusMode = 'timer' | 'stopwatch' | 'pomodoro';
type FocusRecord = {
  id: string; mode: FocusMode; phase: 'focus' | 'break'; status: 'ready' | 'running' | 'paused' | 'complete';
  durationMs: number; focusDurationMs: number; breakDurationMs: number; elapsedMs: number;
  anchorAt: number | null; startedAt: number | null; completedAt: number | null; createdAt: number;
  taskId: string; taskTitle: string; notes: string; clockAdjusted: boolean;
};
type Workspace = { version: number; current: FocusRecord; history: FocusRecord[] };
type Snapshot = { workspace: Workspace | null; raw: string | null; error: string; dirty: boolean };
const newId = () => crypto.randomUUID();
const formatTime = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
};

function FocusTimer({ scope }: { scope: string }) {
  const key = userContentStorageKeys(scope).focusSession;
  const read = useCallback((): Snapshot => {
    const storage = resolveLocalStorage(window);
    try { return { ...readFocusWorkspace(storage, key, Date.now(), newId()), error: '', dirty: false }; }
    catch { return { workspace: null, raw: safeStorageGet(storage, key), error: 'Saved focus data could not be read. Original device data is preserved. Export it before recovery.', dirty: false }; }
  }, [key]);
  const [snapshot, setSnapshot] = useState<Snapshot>(read);
  const latest = useRef(snapshot);
  const [now, setNow] = useState(Date.now());
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmReload, setConfirmReload] = useState(false);
  const [plannerTasks, setPlannerTasks] = useState<{ id: string; title: string; minutes: number; date: string }[]>([]);
  const [plannerNotice, setPlannerNotice] = useState('Loading planner tasks…');

  const publish = useCallback((value: Snapshot) => { latest.current = value; setSnapshot(value); }, []);
  const commit = useCallback((workspace: Workspace) => {
    if (getUserContentStorageScope() !== scope) return;
    const previous = latest.current;
    try {
      const raw = saveFocusWorkspace(resolveLocalStorage(window), key, previous.raw, workspace);
      publish({ workspace, raw, error: '', dirty: false });
      const persistedHistory: FocusRecord[] = previous.raw ? JSON.parse(previous.raw).history : [];
      const added = workspace.history.find(item => !persistedHistory.some(old => old.id === item.id));
      if (added) {
        recordStudySession();
        recordLoopStep('focus');
        logStudyActivity(`Finished a focus block: ${formatTime(added.elapsedMs)} on the timer`);
      }
    } catch (error) {
      publish({ ...previous, workspace, dirty: true, error: error instanceof Error && error.message.includes('another tab')
        ? error.message : 'This session is only in this open page. Browser storage could not save it. Export your session before leaving.' });
    }
  }, [key, scope, publish]);

  const act = useCallback((action: Record<string, unknown>) => {
    if (!latest.current.workspace || getUserContentStorageScope() !== scope) return;
    commit(updateFocusWorkspace(latest.current.workspace, action, Date.now(), newId()));
    setNow(Date.now());
    setConfirmReset(false);
  }, [commit, scope]);

  useEffect(() => {
    if (latest.current.workspace?.current.status !== 'running') return;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      const workspace = latest.current.workspace;
      if (!workspace) return;
      const settled = settleFocusWorkspace(workspace, time);
      if (settled !== workspace) commit(settled);
    };
    tick();
    const interval = window.setInterval(tick, 250);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', tick); document.removeEventListener('visibilitychange', tick); };
  }, [commit, snapshot.workspace?.current.status]);

  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return;
      if (latest.current.dirty) publish({ ...latest.current, error: 'Focus changed in another tab. Export this copy, then reload the saved session.' });
      else publish(read());
    };
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, [key, publish, read]);

  useEffect(() => {
    let active = true;
    void loadPlannerSnapshot(scope).then(result => {
      if (!active || getUserContentStorageScope() !== scope) return;
      if (result.readOnly) { setPlannerNotice('Planner tasks could not be read. Name your focus task below.'); return; }
      const tasks = result.snapshot.tasks.filter(task => !task.completed && task.taskKind !== 'commitment').slice(0, 200);
      setPlannerTasks(tasks.map(task => ({ id: task.id, title: task['task name'], minutes: task['task duration'], date: task.date })));
      setPlannerNotice(result.cloudSynced ? 'Choose a planned task or enter your own.' : 'Showing planner tasks available on this device.');
    }).catch(() => { if (active) setPlannerNotice('Planner tasks are unavailable. Name your focus task below.'); });
    return () => { active = false; };
  }, [scope]);

  const exportSession = () => {
    const content = snapshot.workspace ? JSON.stringify(snapshot.workspace, null, 2) : snapshot.raw;
    if (content === null) return;
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'vertexed-focus-session.json';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const reload = () => { publish(read()); setConfirmReload(false); };
  const workspace = snapshot.workspace;
  const session = workspace?.current;
  const elapsed = session ? focusElapsed(session, now) : 0;
  const active = session?.status === 'running' || session?.status === 'paused';

  return <section className="grid gap-5 text-base" aria-label="Focus session controls">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-xl font-semibold">Your focus block</h3><p className="text-sm text-muted-foreground">Task, timer and session notes stay together.</p></div>
      <button type="button" className="zone-btn-ghost" disabled={!workspace && snapshot.raw === null} onClick={exportSession}>Export focus data</button>
    </div>
    {snapshot.error ? <div role="alert" className="rounded-xl border border-destructive/40 bg-background p-4">
      <p>{snapshot.error}</p><div className="mt-3 flex flex-wrap gap-3">
        {workspace && <button type="button" className="zone-btn-ghost" onClick={() => commit(workspace)}>Retry save</button>}
        <button type="button" className="zone-btn-ghost" onClick={() => snapshot.dirty ? setConfirmReload(true) : reload()}>Reload saved session</button>
        <Link to="/user-settings" className="underline underline-offset-4">Account data controls</Link>
      </div>
      {confirmReload && <div className="mt-3"><p>Reloading replaces the unsaved copy in this page. Export it first if you need to keep it.</p><div className="mt-2 flex gap-3"><button type="button" className="zone-btn-ghost" onClick={() => setConfirmReload(false)}>Keep this copy</button><button type="button" className="zone-btn-primary" onClick={reload}>Replace with saved copy</button></div></div>}
    </div> : <p className="text-sm text-muted-foreground" role="status">{snapshot.raw ? 'Saved on this device for your account.' : 'Session changes save on this device for your account.'} This timer is not synced between devices.</p>}
    {session && <>
      <div className="zone-pill-group" role="group" aria-label="Timer mode">
        {(['timer', 'stopwatch', 'pomodoro'] as const).map(mode => <button key={mode} type="button" className="zone-pill" data-active={session.mode === mode} aria-pressed={session.mode === mode} disabled={active} onClick={() => act({ type: 'mode', mode })}>{mode === 'timer' ? 'Timer' : mode === 'stopwatch' ? 'Stopwatch' : 'Pomodoro'}</button>)}
      </div>
      {active && <p className="text-sm text-muted-foreground">Finish or reset this block before changing timer mode.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm">Planner task (optional)<select className="form-control min-w-0 w-full text-base" value={session.taskId} onChange={event => {
          const task = plannerTasks.find(item => item.id === event.target.value);
          act({ type: 'metadata', taskId: task?.id ?? '', taskTitle: task?.title ?? session.taskTitle });
          if (task && latest.current.workspace?.current.status === 'ready') act({ type: 'configure', focusDurationMs: task.minutes * 60_000 });
        }}><option value="">Choose your own task</option>{session.taskId && !plannerTasks.some(task => task.id === session.taskId) && <option value={session.taskId}>{session.taskTitle || 'Previously linked task'}</option>}{plannerTasks.map(task => <option key={task.id} value={task.id}>{task.title} ({task.date})</option>)}</select><span className="text-xs text-muted-foreground">{plannerNotice}</span></label>
        <label className="grid content-start gap-2 text-sm">Task for this block<input className="form-control min-w-0 w-full text-base" maxLength={160} value={session.taskTitle} onChange={event => act({ type: 'metadata', taskTitle: event.target.value })} placeholder="e.g. Attempt three circuit questions" /></label>
      </div>
      <div className="rounded-xl border border-primary/25 bg-background p-5 text-center">
        <p className="mb-2 text-sm text-muted-foreground">{session.phase === 'break' ? 'Break' : session.mode === 'stopwatch' ? 'Elapsed time' : 'Focus time remaining'}</p>
        <div role="timer" aria-label="Focus timer" aria-live="off" className="font-mono text-[clamp(2rem,8vw,3.5rem)] leading-tight tabular-nums">{formatTime(session.mode === 'stopwatch' ? elapsed : session.durationMs - elapsed)}</div>
        <p className="mt-2 text-sm" role="status">{session.status === 'complete' ? session.phase === 'break' ? 'Break complete' : 'Focus block complete' : session.status === 'running' ? 'Running' : session.status === 'paused' ? 'Paused' : 'Ready'}</p>
        {session.clockAdjusted && <p className="mt-2 text-sm text-muted-foreground">The device clock moved backwards. The timer paused; check the time before resuming.</p>}
      </div>
      {session.mode !== 'stopwatch' && <fieldset disabled={session.status !== 'ready'} className="grid gap-3 sm:grid-cols-3"><legend className="mb-2 text-sm">{session.phase === 'break' ? 'Next focus block length' : 'Block length'}</legend>
        {(['Hours', 'Minutes', 'Seconds'] as const).map((label, index) => {
          const units = [3_600_000, 60_000, 1000];
          const value = Math.floor(session.focusDurationMs / units[index]) % (index ? 60 : 24);
          return <label key={label} className="grid gap-2 text-sm">{label}<input type="number" min={0} max={index ? 59 : 23} className="form-control w-full text-base" value={value} onChange={event => {
            const next = Math.min(index ? 59 : 23, Math.max(0, Math.floor(Number(event.target.value) || 0)));
            act({ type: 'configure', focusDurationMs: Math.max(1000, session.focusDurationMs + (next - value) * units[index]) });
          }} /></label>;
        })}
        {session.mode === 'pomodoro' && <label className="grid gap-2 text-sm sm:col-span-3">Break length (minutes)<input type="number" min={1} max={60} className="form-control max-w-48 text-base" value={session.breakDurationMs / 60_000} onChange={event => act({ type: 'configure', breakDurationMs: Math.min(60, Math.max(1, Math.floor(Number(event.target.value) || 1))) * 60_000 })} /></label>}
      </fieldset>}
      <div className="flex flex-wrap gap-3">
        {session.status !== 'complete' && <button type="button" className="zone-btn-primary" onClick={() => act({ type: session.status === 'running' ? 'pause' : 'start' })}>{session.status === 'running' ? 'Pause' : session.status === 'paused' ? 'Resume' : session.phase === 'break' ? 'Start break' : 'Start'}</button>}
        {active && <button type="button" className="zone-btn-ghost" disabled={elapsed <= 0} onClick={() => act({ type: 'finish' })}>Finish block</button>}
        <button type="button" className="zone-btn-ghost" onClick={() => active ? setConfirmReset(true) : act({ type: 'reset' })}>Reset timer</button>
        {session.status === 'complete' && <button type="button" className="zone-btn-primary" onClick={() => act({ type: 'next' })}>Next focus block</button>}
        {session.status === 'complete' && session.mode === 'pomodoro' && session.phase === 'focus' && <button type="button" className="zone-btn-ghost" onClick={() => act({ type: 'break' })}>Prepare break</button>}
      </div>
      {confirmReset && <div className="rounded-xl border border-border bg-background p-4" role="alert"><p>Reset this timer? Elapsed time will not be added to session history. Your task and notes stay here.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" className="zone-btn-ghost" onClick={() => setConfirmReset(false)}>Keep timer</button><button type="button" className="zone-btn-primary" onClick={() => act({ type: 'reset' })}>Confirm reset</button></div></div>}
      <label className="grid gap-2 text-sm">Session notes<textarea className="form-control min-h-28 w-full resize-y text-base" rows={4} maxLength={4000} value={session.notes} onChange={event => act({ type: 'metadata', notes: event.target.value })} placeholder="What did you attempt? What needs another try?" /></label>
      <p className="text-sm text-muted-foreground">Running timers continue through refresh and time away. Pause when you stop studying. Timer time is not a measure of attention or mastery. Finishing a block does not mark its planner task complete.</p>
      {session.status === 'complete' && session.phase === 'focus' && <section className="rounded-xl border border-primary/25 bg-background p-4" aria-label="Focus completion summary"><h4 className="font-semibold">Block summary</h4><p className="mt-2">{session.taskTitle || 'Focus block'}: {formatTime(session.elapsedMs)} on the timer.</p>{session.notes && <p className="mt-2 whitespace-pre-wrap break-words">{session.notes}</p>}<div className="mt-3 flex flex-wrap gap-4"><Link to="/planner" className="underline underline-offset-4">Review your plan</Link><Link to="/learn" className="underline underline-offset-4">Try a practice question</Link></div></section>}
      {workspace && workspace.history.length > 0 && <details className="rounded-xl border border-border bg-background p-4"><summary className="cursor-pointer font-medium">Recent focus blocks ({workspace.history.length})</summary><p className="mt-2 text-sm text-muted-foreground">The latest 50 blocks are kept on this device. Export to keep a separate copy.</p><ol className="mt-3 grid gap-3">{workspace.history.slice(0, 5).map(item => <li key={item.id} className="border-t border-border pt-3"><strong>{item.taskTitle || 'Focus block'}</strong><p className="text-sm text-muted-foreground">{formatTime(item.elapsedMs)} · {new Date(item.completedAt!).toLocaleString()}</p>{item.notes && <p className="mt-1 whitespace-pre-wrap break-words">{item.notes}</p>}</li>)}</ol></details>}
    </>}
  </section>;
}

export default function TimerApp({ accent: _accent }: { accent: string }) {
  const { user, loading } = useAuth();
  if (loading || !user) return <p role="status">Loading your focus session…</p>;
  return <FocusTimer key={user.id} scope={user.id} />;
}
