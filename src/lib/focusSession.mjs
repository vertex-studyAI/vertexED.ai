export const MAX_FOCUS_MS = 24 * 60 * 60 * 1000;
export const MAX_FOCUS_HISTORY = 50;
const MODES = ['timer', 'stopwatch', 'pomodoro'];
const STATES = ['ready', 'running', 'paused', 'complete'];
const boundedText = (value, limit) => typeof value === 'string' && value.length <= limit;
const timestamp = value => Number.isFinite(value) && value >= 0;
const duration = value => Number.isInteger(value) && value >= 1000 && value <= MAX_FOCUS_MS;

function createSession(mode, now, id, previous = null, phase = 'focus') {
  const focusDurationMs = previous?.focusDurationMs ?? 25 * 60_000;
  const breakDurationMs = previous?.breakDurationMs ?? 5 * 60_000;
  return {
    id, mode, phase, status: 'ready', focusDurationMs, breakDurationMs,
    durationMs: phase === 'break' ? breakDurationMs : mode === 'stopwatch' ? MAX_FOCUS_MS : focusDurationMs,
    elapsedMs: 0, anchorAt: null, startedAt: null, completedAt: null,
    taskId: previous?.taskId ?? '', taskTitle: previous?.taskTitle ?? '', notes: '',
    clockAdjusted: false, createdAt: now,
  };
}

export function createFocusWorkspace(now = Date.now(), id = 'initial') {
  return { version: 1, current: createSession('timer', now, id), history: [] };
}

function validSession(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
    && boundedText(value.id, 160) && value.id.length > 0 && MODES.includes(value.mode)
    && ['focus', 'break'].includes(value.phase) && (value.phase !== 'break' || value.mode === 'pomodoro')
    && STATES.includes(value.status) && duration(value.durationMs)
    && duration(value.focusDurationMs) && duration(value.breakDurationMs)
    && Number.isFinite(value.elapsedMs) && value.elapsedMs >= 0 && value.elapsedMs <= value.durationMs
    && timestamp(value.createdAt) && (value.startedAt === null || timestamp(value.startedAt))
    && (value.completedAt === null || timestamp(value.completedAt))
    && (value.status === 'running' ? timestamp(value.anchorAt) && value.startedAt !== null : value.anchorAt === null)
    && (value.status === 'complete' ? value.completedAt !== null : value.completedAt === null)
    && boundedText(value.taskId, 160) && boundedText(value.taskTitle, 160) && boundedText(value.notes, 4000)
    && typeof value.clockAdjusted === 'boolean';
}

export function validateFocusWorkspace(value) {
  if (!value || value.version !== 1 || !validSession(value.current) || !Array.isArray(value.history)
    || value.history.length > MAX_FOCUS_HISTORY
    || !value.history.every(item => validSession(item) && item.status === 'complete' && item.phase === 'focus')
    || new Set(value.history.map(item => item.id)).size !== value.history.length) {
    throw new Error('Saved focus data could not be read. Original device data is preserved. Export it before recovery.');
  }
  return value;
}

export function focusElapsed(session, now = Date.now()) {
  const elapsed = session.elapsedMs + (session.status === 'running' ? Math.max(0, now - session.anchorAt) : 0);
  return Math.min(session.durationMs, Math.max(0, elapsed));
}

function complete(workspace, now, elapsedMs) {
  const current = { ...workspace.current, status: 'complete', elapsedMs, anchorAt: null, completedAt: now };
  const history = current.phase === 'focus' && elapsedMs > 0
    ? [current, ...workspace.history.filter(item => item.id !== current.id)].slice(0, MAX_FOCUS_HISTORY)
    : workspace.history;
  return { ...workspace, current, history };
}

export function settleFocusWorkspace(workspace, now = Date.now()) {
  const session = workspace.current;
  if (session.status !== 'running') return workspace;
  if (now < session.anchorAt) {
    return { ...workspace, current: { ...session, status: 'paused', anchorAt: null, clockAdjusted: true } };
  }
  const elapsed = focusElapsed(session, now);
  if (elapsed < session.durationMs) return workspace;
  // Stop at the actual block boundary. Background time does not create an
  // unbounded chain of Pomodoro completions or count break time as study time.
  return complete(workspace, session.anchorAt + session.durationMs - session.elapsedMs, elapsed);
}

export function updateFocusWorkspace(workspace, action, now = Date.now(), id = `focus-${now}`) {
  validateFocusWorkspace(workspace);
  let next = settleFocusWorkspace(workspace, now);
  const current = next.current;
  if (action.type === 'metadata') {
    const changed = { ...current,
      taskId: action.taskId === undefined ? current.taskId : String(action.taskId).slice(0, 160),
      taskTitle: action.taskTitle === undefined ? current.taskTitle : String(action.taskTitle).slice(0, 160),
      notes: action.notes === undefined ? current.notes : String(action.notes).slice(0, 4000),
    };
    return { ...next, current: changed, history: next.history.map(item => item.id === changed.id ? changed : item) };
  }
  if (action.type === 'start' && ['ready', 'paused'].includes(current.status)) {
    return { ...next, current: { ...current, status: 'running', anchorAt: now, startedAt: current.startedAt ?? now } };
  }
  if (action.type === 'pause' && current.status === 'running') {
    return { ...next, current: { ...current, status: 'paused', elapsedMs: focusElapsed(current, now), anchorAt: null } };
  }
  if (action.type === 'finish' && ['running', 'paused'].includes(current.status) && focusElapsed(current, now) > 0) {
    return complete(next, now, focusElapsed(current, now));
  }
  if (action.type === 'configure' && current.status === 'ready') {
    const focusDurationMs = duration(action.focusDurationMs) ? action.focusDurationMs : current.focusDurationMs;
    const breakDurationMs = duration(action.breakDurationMs) ? action.breakDurationMs : current.breakDurationMs;
    return { ...next, current: { ...current, focusDurationMs, breakDurationMs,
      durationMs: current.phase === 'break' ? breakDurationMs : current.mode === 'stopwatch' ? MAX_FOCUS_MS : focusDurationMs } };
  }
  if (action.type === 'mode' && MODES.includes(action.mode) && ['ready', 'complete'].includes(current.status)) {
    return { ...next, current: { ...createSession(action.mode, now, id, current), notes: current.status === 'ready' ? current.notes : '' } };
  }
  if (action.type === 'reset') {
    return { ...next, current: { ...createSession(current.mode, now, id, current, current.phase), notes: current.notes } };
  }
  if (action.type === 'break' && current.mode === 'pomodoro' && current.phase === 'focus' && current.status === 'complete') {
    return { ...next, current: createSession('pomodoro', now, id, current, 'break') };
  }
  if (action.type === 'next' && current.status === 'complete') {
    return { ...next, current: createSession(current.mode, now, id, current) };
  }
  return next;
}

export function readFocusWorkspace(storage, key, now = Date.now(), id = 'initial') {
  if (!storage) throw new Error('Browser storage is unavailable. Focus data cannot be restored.');
  const raw = storage.getItem(key);
  return { raw, workspace: raw === null ? createFocusWorkspace(now, id) : validateFocusWorkspace(JSON.parse(raw)) };
}

export function saveFocusWorkspace(storage, key, expectedRaw, workspace) {
  if (!storage) throw new Error('Browser storage is unavailable. Keep this page open and export your session.');
  if (storage.getItem(key) !== expectedRaw) {
    throw new Error('Focus changed in another tab. Export this copy, then reload the saved session.');
  }
  const raw = JSON.stringify(validateFocusWorkspace(workspace));
  storage.setItem(key, raw);
  return raw;
}
