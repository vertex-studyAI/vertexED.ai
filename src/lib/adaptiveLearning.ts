export type AdaptiveGoal = "ace_exams" | "catch_up" | "build_habits" | "understand_better" | string;

export type AdaptivePreferences = {
  studyGoal?: AdaptiveGoal;
  gradeLevel?: string;
  preferredSessionMinutes?: number;
  focusMode?: "practice" | "mixed" | "explore";
  updatedAt?: string;
};

export type AdaptiveSignal = {
  topic?: string;
  subject?: string;
  minutes?: number;
  accuracy?: number;
  source?: string;
  timestamp?: string;
  notes?: string;
};

export type TopicPerformance = {
  score: number; // 0..1
  minutes: number;
  sessions: number;
  lastSeen: string;
};

export type AdaptiveState = {
  version: 1;
  userId: string;
  preferences: AdaptivePreferences;
  streak: number;
  lastStudyDate: string | null;
  totalMinutes: number;
  sessions: number;
  topics: Record<string, TopicPerformance>;
  recentSignals: AdaptiveSignal[];
};

export type AdaptiveSnapshot = {
  goalLabel: string;
  streak: number;
  sessions: number;
  totalMinutes: number;
  sessionLength: number;
  focusTopics: string[];
  strengthTopics: string[];
  nextAction: string;
  coachNote: string;
};

const STORAGE_PREFIX = "vz:adaptive:v1";

function safeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getAdaptiveStorageKey(userId?: string | null) {
  return `${STORAGE_PREFIX}:${userId || "guest"}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function clampScore(score: number) {
  if (!Number.isFinite(score)) return 0.5;
  return Math.max(0, Math.min(1, score));
}

function topicKey(topic?: string, subject?: string) {
  const raw = [topic, subject].filter(Boolean).join(" ").trim();
  return raw ? raw.toLowerCase() : "general study";
}

function goalLabel(goal?: AdaptiveGoal) {
  switch (goal) {
    case "ace_exams":
      return "Exam sprint";
    case "catch_up":
      return "Catch-up mode";
    case "build_habits":
      return "Habit building";
    case "understand_better":
      return "Deep understanding";
    default:
      return "Personalized learning";
  }
}

function goalHint(goal?: AdaptiveGoal) {
  switch (goal) {
    case "ace_exams":
      return "Lead with timed practice and retrieval.";
    case "catch_up":
      return "Rebuild foundations before increasing difficulty.";
    case "build_habits":
      return "Keep sessions short, consistent, and repeatable.";
    case "understand_better":
      return "Blend explanation, examples, and active recall.";
    default:
      return "Mix recall, practice, and review for steady growth.";
  }
}

function getDefaultState(userId: string, preferences: AdaptivePreferences = {}): AdaptiveState {
  return {
    version: 1,
    userId,
    preferences: { ...preferences },
    streak: 0,
    lastStudyDate: null,
    totalMinutes: 0,
    sessions: 0,
    topics: {},
    recentSignals: [],
  };
}

export function loadAdaptiveState(userId?: string | null, preferences: AdaptivePreferences = {}): AdaptiveState {
  const storage = safeStorage();
  const userKey = userId || "guest";
  const key = getAdaptiveStorageKey(userKey);
  if (!storage) return getDefaultState(userKey, preferences);

  try {
    const raw = storage.getItem(key);
    if (!raw) return getDefaultState(userKey, preferences);
    const parsed = JSON.parse(raw) as Partial<AdaptiveState>;
    return {
      ...getDefaultState(userKey, preferences),
      ...parsed,
      userId: userKey,
      preferences: { ...preferences, ...(parsed.preferences ?? {}) },
      topics: parsed.topics ?? {},
      recentSignals: Array.isArray(parsed.recentSignals) ? parsed.recentSignals.slice(0, 25) : [],
      streak: Number(parsed.streak ?? 0) || 0,
      totalMinutes: Number(parsed.totalMinutes ?? 0) || 0,
      sessions: Number(parsed.sessions ?? 0) || 0,
      lastStudyDate: typeof parsed.lastStudyDate === "string" ? parsed.lastStudyDate : null,
    };
  } catch {
    return getDefaultState(userKey, preferences);
  }
}

export function saveAdaptiveState(state: AdaptiveState) {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(getAdaptiveStorageKey(state.userId), JSON.stringify(state));
  } catch {
    // ignore storage failures
  }
}

function updateStreak(previous: string | null, current: string) {
  if (!previous) return 1;
  if (previous === current) return 0; // same-day extra session should not inflate streak
  const prevDate = new Date(`${previous}T00:00:00`);
  const currDate = new Date(`${current}T00:00:00`);
  const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / 86400000);
  if (diffDays === 1) return 1;
  if (diffDays <= 0) return 0;
  return 1;
}

function updateTopicPerformance(existing: TopicPerformance | undefined, signal: AdaptiveSignal, timestamp: string): TopicPerformance {
  const minutes = Math.max(0, Number(signal.minutes ?? 0) || 0);
  const accuracy = clampScore(typeof signal.accuracy === "number" ? signal.accuracy : 0.72);
  const currentScore = existing?.score ?? 0.55;
  const blended = clampScore(currentScore * 0.72 + accuracy * 0.28 + Math.min(minutes, 60) / 600);
  return {
    score: blended,
    minutes: (existing?.minutes ?? 0) + minutes,
    sessions: (existing?.sessions ?? 0) + 1,
    lastSeen: timestamp,
  };
}

export function recordAdaptiveSignal(
  userId?: string | null,
  signal: AdaptiveSignal = {},
  preferences: AdaptivePreferences = {},
): AdaptiveState {
  const userKey = userId || "guest";
  const current = loadAdaptiveState(userKey, preferences);
  const timestamp = signal.timestamp || new Date().toISOString();
  const day = timestamp.slice(0, 10);
  const key = topicKey(signal.topic, signal.subject);

  const streakDelta = updateStreak(current.lastStudyDate, day);

  const nextState: AdaptiveState = {
    ...current,
    preferences: { ...current.preferences, ...preferences },
    lastStudyDate: day,
    streak: streakDelta ? current.streak + streakDelta : current.streak,
    totalMinutes: current.totalMinutes + Math.max(0, Number(signal.minutes ?? 0) || 0),
    sessions: current.sessions + 1,
    topics: {
      ...current.topics,
      [key]: updateTopicPerformance(current.topics[key], signal, timestamp),
    },
    recentSignals: [{ ...signal, timestamp }, ...current.recentSignals].slice(0, 25),
  };

  saveAdaptiveState(nextState);
  return nextState;
}

export function buildAdaptiveSnapshot(
  state: AdaptiveState,
  preferences: AdaptivePreferences = {},
): AdaptiveSnapshot {
  const mergedPrefs = { ...state.preferences, ...preferences };
  const entries = Object.entries(state.topics)
    .map(([topic, perf]) => ({ topic, perf }))
    .sort((a, b) => a.perf.score - b.perf.score || b.perf.sessions - a.perf.sessions);

  const weakTopics = entries.slice(0, 3).map((x) => x.topic);
  const strongTopics = [...entries]
    .sort((a, b) => b.perf.score - a.perf.score || b.perf.sessions - a.perf.sessions)
    .slice(0, 3)
    .map((x) => x.topic);

  const defaultSession = mergedPrefs.preferredSessionMinutes ?? 25;
  const lowConfidence = entries.find((x) => x.perf.score < 0.58)?.topic;
  const strongOrWeak = lowConfidence || weakTopics[0] || "core topic";
  const goal = mergedPrefs.studyGoal;
  const goalText = goalLabel(goal);

  const sessionLength =
    defaultSession < 20
      ? 20
      : defaultSession > 90
        ? 90
        : defaultSession;

  const nextAction = mergedPrefs.focusMode === "explore"
    ? `Spend ${sessionLength} minutes exploring ${strongOrWeak} with examples and summary notes.`
    : mergedPrefs.focusMode === "practice"
      ? `Do a timed ${sessionLength}-minute recall block on ${strongOrWeak} and finish with 5 self-check questions.`
      : `Start a ${sessionLength}-minute mixed session: recall ${strongOrWeak}, then solve one application question.`;

  const coachNote = `${goalHint(goal)} ${state.streak > 0 ? `You are on a ${state.streak}-day streak.` : "A fresh session today will start your streak."}`;

  return {
    goalLabel: goalText,
    streak: state.streak,
    sessions: state.sessions,
    totalMinutes: state.totalMinutes,
    sessionLength,
    focusTopics: weakTopics.length ? weakTopics : ["general review"],
    strengthTopics: strongTopics.length ? strongTopics : ["core foundations"],
    nextAction,
    coachNote,
  };
}

export function saveAdaptivePreferences(
  userId: string | null | undefined,
  preferences: AdaptivePreferences,
) {
  const current = loadAdaptiveState(userId, preferences);
  const nextState: AdaptiveState = {
    ...current,
    preferences: { ...current.preferences, ...preferences, updatedAt: new Date().toISOString() },
  };
  saveAdaptiveState(nextState);
  return nextState;
}

export function describeAdaptiveGoal(goal?: AdaptiveGoal) {
  return goalLabel(goal);
}

export function todayKey() {
  return todayISO();
}
