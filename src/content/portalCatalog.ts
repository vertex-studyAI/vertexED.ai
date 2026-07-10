/**
 * Catalog of 20 portal innovations — powers the discovery ribbon and onboarding hints.
 */
export type PortalFeature = {
  id: string;
  anchorId?: string;
  name: string;
  tagline: string;
  size: 'small' | 'medium' | 'large';
  status: 'live' | 'beta';
};

export const PORTAL_FEATURES: PortalFeature[] = [
  { id: 'retrieval-pulse', anchorId: 'retrieval-pulse', name: 'Retrieval Pulse', tagline: 'One honest read on what deserves your attention tonight', size: 'large', status: 'live' },
  { id: 'today-plan', anchorId: 'today-plan', name: "Today's Plan", tagline: 'Planner tasks, adaptive picks, and your pulse action in one list', size: 'medium', status: 'live' },
  { id: 'subject-mastery', anchorId: 'subject-mastery', name: 'Subject Mastery', tagline: 'Where your marks land per subject — with trends, not vibes', size: 'medium', status: 'live' },
  { id: 'memory-decay', anchorId: 'memory-decay', name: 'Memory Decay Radar', tagline: 'Topics you have not touched in days — before they slip', size: 'small', status: 'live' },
  { id: 'marks-gap', anchorId: 'marks-gap', name: 'Marks Gap', tagline: 'How far each subject is from your 80% target', size: 'small', status: 'live' },
  { id: 'revision-velocity', anchorId: 'revision-velocity', name: 'Revision Velocity', tagline: 'Whether your mastery is climbing, flat, or dipping this week', size: 'small', status: 'live' },
  { id: 'interleave-mixer', anchorId: 'interleave-mixer', name: 'Interleave Mixer', tagline: 'Which two subjects to alternate in your next session', size: 'small', status: 'live' },
  { id: 'weak-sprint', anchorId: 'weak-sprint', name: 'Weak Topic Sprint', tagline: 'A short, focused block on your worst-scoring topic', size: 'small', status: 'live' },
  { id: 'confidence-checkin', anchorId: 'confidence-checkin', name: 'Confidence Check-in', tagline: 'Rate how exam-ready each subject feels — we use this in your plan', size: 'small', status: 'live' },
  { id: 'quick-capture', anchorId: 'quick-capture', name: 'Quick Capture', tagline: 'Jot a doubt and send it straight to Apex', size: 'small', status: 'live' },
  { id: 'command-drill', anchorId: 'command-drill', name: 'Command Word Drill', tagline: 'Flash mark-scheme verbs until they are automatic', size: 'small', status: 'live' },
  { id: 'flashcard-heatmap', anchorId: 'flashcard-heatmap', name: 'Flashcard Heatmap', tagline: 'Due cards broken down by deck so you know where to start', size: 'small', status: 'live' },
  { id: 'exam-night', anchorId: 'exam-night', name: 'Exam Night Protocol', tagline: 'A calm checklist when your paper is 72 hours away or less', size: 'medium', status: 'live' },
  { id: 'loop-closure', anchorId: 'loop-closure', name: 'Loop Closure', tagline: 'The study-loop step you have not done this week yet', size: 'small', status: 'live' },
  { id: 'apex-brief', name: 'Apex Daily Brief', tagline: 'One coaching line built from your real study data', size: 'small', status: 'live' },
  { id: 'focus-score', name: 'Focus Score', tagline: 'Habits, loop completion, streak, and mastery combined', size: 'small', status: 'live' },
  { id: 'streak-calendar', name: 'Streak Calendar', tagline: 'Seven days of study activity at a glance', size: 'small', status: 'live' },
  { id: 'benchmark', anchorId: 'readiness-benchmark', name: 'Readiness Index', tagline: 'Your exam-readiness score from retrieval signals — not a fake percentile', size: 'small', status: 'live' },
  { id: 'board-tips', anchorId: 'board-tips', name: 'Board Mark Tips', tagline: 'Examiner logic tailored to your board', size: 'small', status: 'live' },
  { id: 'data-export', anchorId: 'data-export', name: 'Data Portability', tagline: 'Download your learner profile, weakness map, and confidence ratings', size: 'small', status: 'live' },
  { id: 'study-notebook', name: 'Study Notebook', tagline: '17 studio outputs: grounded chat, world model, board deep dives, audio, quizzes', size: 'large', status: 'live' },
  { id: 'world-model', name: 'World Model Learning', tagline: 'Concept constellation — foundations, weak nodes, exam simulations', size: 'large', status: 'live' },
  { id: 'board-library', name: 'Board Resource Library', tagline: '1000+ word IB, AP, IGCSE, ICSE guides generated for your board', size: 'large', status: 'live' },
  { id: 'sketch-pad', name: 'Sketch Notepad', tagline: 'iPad & Apple Pencil canvas — diagrams to Study Notebook', size: 'medium', status: 'live' },
];
