/**
 * Catalog of portal innovations — powers the discovery ribbon and onboarding hints.
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
  { id: 'retrieval-pulse', anchorId: 'retrieval-pulse', name: 'Retrieval Pulse', tagline: 'What deserves your attention tonight — due cards, weak topics, planner tasks, or the missing loop step', size: 'large', status: 'live' },
  { id: 'today-plan', anchorId: 'today-plan', name: "Today's Plan", tagline: 'Planner tasks, adaptive recommendations, and your pulse action in one ordered list', size: 'medium', status: 'live' },
  { id: 'subject-mastery', anchorId: 'subject-mastery', name: 'Subject Mastery', tagline: 'Estimated mark band per subject from mocks and reviews — with trend, not guesswork', size: 'medium', status: 'live' },
  { id: 'memory-decay', anchorId: 'memory-decay', name: 'Memory Decay Radar', tagline: 'Topics you have not practised recently — before they slip out of retrieval range', size: 'small', status: 'live' },
  { id: 'marks-gap', anchorId: 'marks-gap', name: 'Marks Gap', tagline: 'Distance from your target percentage in each subject based on recent scores', size: 'small', status: 'live' },
  { id: 'revision-velocity', anchorId: 'revision-velocity', name: 'Revision Velocity', tagline: 'Whether mastery scores are climbing, flat, or dropping over the last seven days', size: 'small', status: 'live' },
  { id: 'interleave-mixer', anchorId: 'interleave-mixer', name: 'Interleave Mixer', tagline: 'Suggests two subjects to alternate in your next session for better retention', size: 'small', status: 'live' },
  { id: 'weak-sprint', anchorId: 'weak-sprint', name: 'Weak Topic Sprint', tagline: 'A short block focused on your lowest-scoring topic from recent mocks or reviews', size: 'small', status: 'live' },
  { id: 'confidence-checkin', anchorId: 'confidence-checkin', name: 'Confidence Check-in', tagline: 'Rate how exam-ready each subject feels — feeds into today\'s plan and Apex brief', size: 'small', status: 'live' },
  { id: 'quick-capture', anchorId: 'quick-capture', name: 'Quick Capture', tagline: 'Jot a doubt from class and open Apex with the question pre-filled', size: 'small', status: 'live' },
  { id: 'command-drill', anchorId: 'command-drill', name: 'Command Word Drill', tagline: 'Flash mark-scheme verbs — analyse, evaluate, justify — until responses match the board', size: 'small', status: 'live' },
  { id: 'flashcard-heatmap', anchorId: 'flashcard-heatmap', name: 'Flashcard Heatmap', tagline: 'Due cards split by deck so you know which topic pile to clear first', size: 'small', status: 'live' },
  { id: 'exam-night', anchorId: 'exam-night', name: 'Exam Night Protocol', tagline: 'Checklist for the last 72 hours — materials, sleep, light review, no new chapters', size: 'medium', status: 'live' },
  { id: 'loop-closure', anchorId: 'loop-closure', name: 'Loop Closure', tagline: 'Which revision-loop step you have not completed this week — plan, focus, practise, review, or remember', size: 'small', status: 'live' },
  { id: 'apex-brief', name: 'Apex Daily Brief', tagline: 'One coaching line from your streak, due cards, exam countdown, and weak topics', size: 'small', status: 'live' },
  { id: 'focus-score', name: 'Focus Score', tagline: 'Combined signal from habits, loop completion, streak length, and mastery trend', size: 'small', status: 'live' },
  { id: 'streak-calendar', name: 'Streak Calendar', tagline: 'Last seven days of logged study activity', size: 'small', status: 'live' },
  { id: 'benchmark', anchorId: 'readiness-benchmark', name: 'Readiness Index', tagline: 'Exam-readiness estimate from retrieval signals — not a percentile against other users', size: 'small', status: 'live' },
  { id: 'board-tips', anchorId: 'board-tips', name: 'Board Mark Tips', tagline: 'Short examiner-style notes for your selected board and subjects', size: 'small', status: 'live' },
  { id: 'data-export', anchorId: 'data-export', name: 'Data Portability', tagline: 'Download learner profile, weakness map, and confidence ratings as JSON', size: 'small', status: 'live' },
  { id: 'study-notebook', name: 'Study Notebook', tagline: 'Source-based workspace — grounded chat, study guides, world model, board deep dives, audio scripts', size: 'large', status: 'live' },
  { id: 'world-model', name: 'World Model Learning', tagline: 'Concept graph with foundations, weak nodes, and short exam-style prompts per topic', size: 'large', status: 'live' },
  { id: 'board-library', name: 'Board Resource Library', tagline: 'Long-form guides for IB, AP, IGCSE, ICSE, and other boards — generated to syllabus depth', size: 'large', status: 'live' },
  { id: 'sketch-pad', name: 'Sketch Notepad', tagline: 'Canvas for diagrams and worked steps — optimised for iPad and Apple Pencil, exports to Study Notebook', size: 'medium', status: 'live' },
];
