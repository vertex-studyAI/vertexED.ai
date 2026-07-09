export type StudyGoal = 'ace_exams' | 'catch_up' | 'build_habits' | 'understand_better';
export type GradeLevel = 'middle_school' | 'high_school' | 'undergraduate' | 'other';

export type LearnerProfile = {
  displayName: string;
  studyGoal: StudyGoal | null;
  gradeLevel: GradeLevel | null;
};

type UserLike = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
} | null;

const GOAL_LABELS: Record<StudyGoal, string> = {
  ace_exams: 'Ace upcoming exams',
  catch_up: 'Catch up on topics',
  build_habits: 'Build study habits',
  understand_better: 'Understand subjects better',
};

const GRADE_LABELS: Record<GradeLevel, string> = {
  middle_school: 'Middle School',
  high_school: 'High School',
  undergraduate: 'Undergraduate',
  other: 'Student',
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
  };
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
        { phase: 'learn', title: 'Review formulas', description: 'Quick formula sheets before practice.', to: '/study-tools' },
        { phase: 'practice', title: 'Mock paper', description: 'Timed practice under exam conditions.', to: '/paper-maker' },
        { phase: 'review', title: 'Answer review', description: 'Get rubric-style feedback on your work.', to: '/answer-reviewer' },
        { phase: 'remember', title: 'Flashcard drill', description: 'Lock in key facts with spaced repetition.', to: '/notetaker' },
      ];
    case 'catch_up':
      return [
        { phase: 'learn', title: 'AI notes', description: 'Generate structured notes on weak topics.', to: '/notetaker' },
        { phase: 'practice', title: 'Targeted quiz', description: 'Test yourself on what you just learned.', to: '/notetaker' },
        { phase: 'review', title: 'Ask AI tutor', description: 'Clarify gaps step by step.', to: '/chatbot' },
        { phase: 'remember', title: 'Archive exemplars', description: 'See how strong answers are built.', to: '/archives' },
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
        { phase: 'practice', title: 'Discuss with AI', description: 'Ask why, not just what.', to: '/chatbot' },
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
