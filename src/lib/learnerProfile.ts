import type { CurriculumPreference } from '@/types/curriculum';
import { getCurriculumPreference, daysUntilExam, BOARD_CONFIGS } from '@/lib/curriculum';
import { getWeakestTopics } from '@/lib/weaknessTracker';
import { getConfidenceRatings } from '@/lib/portalFeatures';

export type StudyGoal = 'ace_exams' | 'catch_up' | 'build_habits' | 'understand_better';
export type GradeLevel = 'middle_school' | 'high_school' | 'undergraduate' | 'other';
export type AiStyle = 'socratic' | 'direct' | 'balanced';
export type ExplanationDepth = 'concise' | 'standard' | 'detailed';

export type LearnerPreferences = {
  aiStyle: AiStyle;
  sessionMinutes: number;
  explanationDepth: ExplanationDepth;
};

export type LearnerProfile = {
  displayName: string;
  studyGoal: StudyGoal | null;
  gradeLevel: GradeLevel | null;
  curriculum: CurriculumPreference;
  preferences: LearnerPreferences;
};

export type ProfileCompleteness = {
  score: number;
  missing: string[];
  nudge: string | null;
};

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null;

const GOAL_LABELS: Record<StudyGoal, string> = {
  ace_exams: 'Maximise exam marks',
  catch_up: 'Close topic gaps',
  build_habits: 'Build steady routines',
  understand_better: 'Understand deeply',
};

const GRADE_LABELS: Record<GradeLevel, string> = {
  middle_school: 'Middle School',
  high_school: 'High School',
  undergraduate: 'Undergraduate',
  other: 'Student',
};

const DEFAULT_PREFS: LearnerPreferences = {
  aiStyle: 'socratic',
  sessionMinutes: 25,
  explanationDepth: 'standard',
};

function readPref<T extends string>(
  metadata: Record<string, unknown> | null | undefined,
  flatKey: string,
  nestedKey: string,
  allowed: readonly T[],
): T | null {
  const flat = metadata?.[flatKey];
  if (typeof flat === 'string' && (allowed as readonly string[]).includes(flat)) return flat as T;

  const prefs = metadata?.preferences;
  if (prefs && typeof prefs === 'object') {
    const nested = (prefs as Record<string, unknown>)[nestedKey];
    if (typeof nested === 'string' && (allowed as readonly string[]).includes(nested)) return nested as T;
  }
  return null;
}

function readLearnerPreferences(metadata: Record<string, unknown>): LearnerPreferences {
  const prefs = metadata.preferences;
  const nested =
    prefs && typeof prefs === 'object' ? (prefs as Record<string, unknown>) : {};

  const aiStyle = readPref(
    { preferences: nested },
    'ai_style',
    'aiStyle',
    ['socratic', 'direct', 'balanced'] as const,
  );
  const explanationDepth = readPref(
    { preferences: nested },
    'explanation_depth',
    'explanationDepth',
    ['concise', 'standard', 'detailed'] as const,
  );
  const sessionRaw = nested.sessionMinutes ?? metadata.session_minutes;
  const sessionMinutes =
    typeof sessionRaw === 'number' && sessionRaw >= 15 && sessionRaw <= 120
      ? sessionRaw
      : DEFAULT_PREFS.sessionMinutes;

  return {
    aiStyle: aiStyle ?? DEFAULT_PREFS.aiStyle,
    sessionMinutes,
    explanationDepth: explanationDepth ?? DEFAULT_PREFS.explanationDepth,
  };
}

export function getLearnerProfile(user: UserLike): LearnerProfile {
  const metadata = user?.user_metadata ?? {};
  const username = metadata.username;
  const displayName =
    (typeof username === 'string' && username) ||
    (user?.email ? user.email.split('@')[0] : 'Student');

  return {
    displayName,
    studyGoal: readPref(metadata, 'study_goal', 'studyGoal', [
      'ace_exams',
      'catch_up',
      'build_habits',
      'understand_better',
    ] as const),
    gradeLevel: readPref(metadata, 'grade_level', 'gradeLevel', [
      'middle_school',
      'high_school',
      'undergraduate',
      'other',
    ] as const),
    curriculum: getCurriculumPreference(user),
    preferences: readLearnerPreferences(metadata),
  };
}

export function buildLearnerMetadataPatch(
  patch: {
    studyGoal?: StudyGoal | null;
    gradeLevel?: GradeLevel | null;
    preferences?: Partial<LearnerPreferences>;
  },
  existing: Record<string, unknown> = {},
): Record<string, unknown> {
  const prefs =
    existing.preferences && typeof existing.preferences === 'object'
      ? { ...(existing.preferences as Record<string, unknown>) }
      : {};

  if (patch.studyGoal !== undefined) {
    if (patch.studyGoal) {
      existing.study_goal = patch.studyGoal;
      prefs.studyGoal = patch.studyGoal;
    }
  }
  if (patch.gradeLevel !== undefined) {
    if (patch.gradeLevel) {
      existing.grade_level = patch.gradeLevel;
      prefs.gradeLevel = patch.gradeLevel;
    }
  }
  if (patch.preferences) {
    if (patch.preferences.aiStyle) {
      existing.ai_style = patch.preferences.aiStyle;
      prefs.aiStyle = patch.preferences.aiStyle;
    }
    if (patch.preferences.explanationDepth) {
      existing.explanation_depth = patch.preferences.explanationDepth;
      prefs.explanationDepth = patch.preferences.explanationDepth;
    }
    if (patch.preferences.sessionMinutes != null) {
      existing.session_minutes = patch.preferences.sessionMinutes;
      prefs.sessionMinutes = patch.preferences.sessionMinutes;
    }
  }

  return { ...existing, preferences: prefs };
}

export function getProfileCompleteness(profile: LearnerProfile): ProfileCompleteness {
  const missing: string[] = [];
  if (!profile.studyGoal) missing.push('study goal');
  if (!profile.gradeLevel) missing.push('year group');
  if (!profile.curriculum.board) missing.push('exam board');
  if (profile.curriculum.subjects.length === 0) missing.push('subjects');
  if (!profile.curriculum.examDate) missing.push('exam date');

  const total = 5;
  const score = Math.round(((total - missing.length) / total) * 100);

  let nudge: string | null = null;
  if (missing.length > 0) {
    const first = missing[0];
    nudge =
      first === 'exam date'
        ? 'Add your exam date — countdown, cram mode, and tonight\'s plan use it.'
        : first === 'subjects'
          ? 'Add subjects — mastery charts and interleaving need them.'
          : `Add your ${first} in settings for sharper recommendations.`;
  }

  return { score, missing, nudge };
}

export function getPersonalizedSubline(profile: LearnerProfile): string {
  const goal = profile.studyGoal;
  const examDays = daysUntilExam(profile.curriculum.examDate ?? null);
  const boardLabel = profile.curriculum.board
    ? BOARD_CONFIGS[profile.curriculum.board]?.label
    : null;

  if (examDays != null && examDays <= 14) {
      return examDays === 0
      ? `Exam day — light retrieval, sleep, and calm execution.`
      : `${examDays} day${examDays === 1 ? '' : 's'} to ${boardLabel ?? 'your exam'} — prioritise timed mocks and rubric review.`;
  }

  switch (goal) {
    case 'ace_exams':
      return 'Train for mark schemes, not just understanding — mocks and rubric feedback are your edge.';
    case 'catch_up':
      return 'Close gaps in order: notes → targeted quiz → rubric review. No heroic all-nighters needed.';
    case 'build_habits':
      return 'Small, repeatable blocks beat marathon sessions. Your streak and planner are the lever.';
    case 'understand_better':
      return 'Ask why until it clicks — then lock it in with retrieval so it survives exam pressure.';
    default:
      return 'One loop: plan the week, focus, practise under time, review against rubrics, retrieve on schedule.';
  }
}

export function buildLearnerContextForAi(profile: LearnerProfile): string {
  const parts: string[] = [];
  const board = profile.curriculum.board;
  if (board) parts.push(`Board: ${BOARD_CONFIGS[board].label}`);
  if (profile.gradeLevel) parts.push(`Level: ${gradeLevelLabel(profile.gradeLevel)}`);
  if (profile.studyGoal) parts.push(`Goal: ${studyGoalLabel(profile.studyGoal)}`);
  if (profile.curriculum.subjects.length) {
    parts.push(`Subjects: ${profile.curriculum.subjects.join(', ')}`);
  }
  const examDays = daysUntilExam(profile.curriculum.examDate ?? null);
  if (examDays != null) {
    parts.push(examDays === 0 ? 'Exam: today' : `Exam in ${examDays} days`);
  }

  const weak = getWeakestTopics(3);
  if (weak.length) {
    parts.push(
      `Weak topics: ${weak.map((w) => `${w.topic} (${Math.round(w.avgPercent)}%)`).join('; ')}`,
    );
  }

  const confidence = getConfidenceRatings(profile.curriculum.subjects);
  const lowConf = confidence.filter((c) => c.rating <= 2);
  if (lowConf.length) {
    parts.push(`Low confidence: ${lowConf.map((c) => c.subject).join(', ')}`);
  }

  const { aiStyle, explanationDepth, sessionMinutes } = profile.preferences;
  parts.push(
    `Tutor style: ${aiStyle}; depth: ${explanationDepth}; typical session ${sessionMinutes} min`,
  );

  return parts.join('. ') + '.';
}

export function studyGoalLabel(goal: StudyGoal | null): string | null {
  return goal ? GOAL_LABELS[goal] : null;
}

export function gradeLevelLabel(level: GradeLevel | null): string | null {
  return level ? GRADE_LABELS[level] : null;
}

export type LearningPathStep = {
  title: string;
  description: string;
  to: string;
  phase: 'learn' | 'practice' | 'review' | 'remember';
};

export function getGoalLearningPath(goal: StudyGoal | null): LearningPathStep[] {
  switch (goal) {
    case 'ace_exams':
      return [
        { phase: 'learn', title: 'Formula refresh', description: 'Skim sheets for units you will need in the mock.', to: '/study-tools' },
        { phase: 'practice', title: 'Timed mock', description: 'Full or half paper under exam conditions.', to: '/paper-maker' },
        { phase: 'review', title: 'Rubric review', description: 'Read marks earned and lost; note command-term gaps.', to: '/answer-reviewer' },
        { phase: 'remember', title: 'Due flashcards', description: 'Clear the deck on topics the mock exposed.', to: '/notetaker' },
      ];
    case 'catch_up':
      return [
        { phase: 'learn', title: 'Condense notes', description: 'Generate or paste notes on one gap topic only.', to: '/notetaker' },
        { phase: 'practice', title: 'Topic quiz', description: 'Ten questions — honest scoring, no re-read first.', to: '/notetaker' },
        { phase: 'review', title: 'Ask Apex', description: 'One Socratic pass on what you missed.', to: '/chatbot' },
        { phase: 'remember', title: 'Exemplars', description: 'See how strong answers are structured.', to: '/archives' },
      ];
    case 'build_habits':
      return [
        { phase: 'learn', title: 'Study Zone', description: 'Start a Pomodoro and log your session.', to: '/study-zone?focus=timer' },
        { phase: 'practice', title: 'Daily planner', description: 'Block realistic study slots.', to: '/planner' },
        { phase: 'review', title: 'Habit tracker', description: 'Check off routines that stick.', to: '/study-zone' },
        { phase: 'remember', title: 'Activity log', description: 'Capture wins and reflect on progress.', to: '/study-zone' },
      ];
    case 'understand_better':
      return [
        { phase: 'learn', title: 'Deep-dive notes', description: 'Turn lectures into clear explanations.', to: '/notetaker' },
        { phase: 'practice', title: 'Discuss with Apex', description: 'Ask why, not just what.', to: '/chatbot' },
        { phase: 'review', title: 'Resource guides', description: 'Active recall and study techniques.', to: '/resources/active-recall-spaced-repetition' },
        { phase: 'remember', title: 'Flashcards', description: 'Reinforce concepts over time.', to: '/notetaker' },
      ];
    default:
      return [
        { phase: 'learn', title: 'Browse archives', description: 'Curated notes and exemplars.', to: '/archives' },
        { phase: 'practice', title: 'Generate notes', description: 'AI notes, flashcards, and quizzes.', to: '/notetaker' },
        { phase: 'review', title: 'Mock exam', description: 'Practice papers with mark schemes.', to: '/paper-maker' },
        { phase: 'remember', title: 'Study Zone', description: 'Focus timer, habits, and activity log.', to: '/study-zone' },
      ];
  }
}

export function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
