import type { ExamBoard } from '@/types/curriculum';

export const CURRICULA: Record<string, ExamBoard> = {
  'ib-myp': 'IB_MYP',
  'ib-dp': 'IB_DP',
  igcse: 'IGCSE',
  gcse: 'GCSE',
  'a-level': 'A_LEVELS',
  ap: 'AP',
  cbse: 'CBSE',
  icse: 'ICSE',
};

export const FEATURES = {
  'study-planner': {
    name: 'Study Planner',
    searchName: 'study planner',
    description: 'Build a realistic revision timetable around your subjects, exam date, and weekly commitments.',
    focus: 'Turn revision priorities into manageable study blocks and review sessions.',
  },
  'study-zone': {
    name: 'Study Zone',
    searchName: 'study zone',
    description: 'Run focused revision sessions with timers, subject tools, and session tracking in one workspace.',
    focus: 'Use focused blocks to practise the topics and question types that need the most attention.',
  },
  'paper-maker': {
    name: 'Paper Maker',
    searchName: 'paper maker',
    description: 'Create topic-focused practice papers with a chosen difficulty, question count, and mark total.',
    focus: 'Generate mock practice around your selected subjects and use the result to identify revision gaps.',
  },
  'answer-reviewer': {
    name: 'Answer Reviewer',
    searchName: 'answer reviewer',
    description: 'Review written answers and get structured feedback on clarity, evidence, method, and next steps.',
    focus: 'Use feedback to improve how you respond to command terms and show the working that earns marks.',
  },
  'ai-notes': {
    name: 'AI Notes and Quiz',
    searchName: 'AI notes and quiz tool',
    description: 'Turn revision notes into organised study material, flashcards, and retrieval-practice quizzes.',
    focus: 'Convert your own class notes into short, repeatable recall practice before an assessment.',
  },
  'ai-tutor': {
    name: 'AI Tutor',
    searchName: 'AI tutor',
    description: 'Talk through concepts, methods, and practice questions step by step instead of only receiving an answer.',
    focus: 'Use guided explanations to test your reasoning before attempting another question independently.',
  },
} as const;

export type FeatureSlug = keyof typeof FEATURES;

export function isFeatureSlug(value: string | undefined): value is FeatureSlug {
  return Boolean(value && value in FEATURES);
}
