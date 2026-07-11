import type { BoardConfig, CurriculumPreference, ExamBoard } from '@/types/curriculum';

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export const EXAM_BOARDS: ExamBoard[] = [
  'IB_MYP',
  'IB_DP',
  'IGCSE',
  'GCSE',
  'A_LEVELS',
  'AP',
  'CBSE',
  'ICSE',
];

export const BOARD_CONFIGS: Record<ExamBoard, BoardConfig> = {
  IB_MYP: {
    id: 'IB_MYP',
    label: 'IB MYP',
    shortLabel: 'MYP',
    gradeRange: [6, 10],
    subjects: [
      'Physics', 'Chemistry', 'Biology', 'History', 'Geography',
      'Math Standard', 'Language and Literature', 'Spanish', 'French', 'Hindi',
    ],
    criteria: ['Criterion A', 'Criterion B', 'Criterion C', 'Criterion D'],
    commandTerms: ['Analyse', 'Apply', 'Demonstrate', 'Describe', 'Discuss', 'Evaluate', 'Examine', 'Explain', 'Identify', 'Outline', 'State', 'Suggest'],
    features: ['TOK links', 'Criterion-based assessment', 'Interdisciplinary units'],
  },
  IB_DP: {
    id: 'IB_DP',
    label: 'IB DP',
    shortLabel: 'DP',
    gradeRange: [11, 12],
    subjects: [
      'History', 'Geography', 'Math AA', 'Math AI', 'Business Management', 'Economics',
      'IB English Literature', 'Language B - Spanish', 'Language B - German',
      'Language B - French', 'Language B - Hindi', 'Language AB Initio - Spanish',
      'Physics', 'Chemistry', 'Biology', 'TOK', 'Extended Essay',
    ],
    criteria: ['Paper 1', 'Paper 2', 'Internal Assessment', 'Extended Essay'],
    commandTerms: ['Analyse', 'Compare', 'Contrast', 'Deduce', 'Derive', 'Describe', 'Discuss', 'Evaluate', 'Examine', 'Explain', 'Justify', 'Outline', 'Predict', 'Sketch', 'State', 'Suggest'],
    features: ['TOK', 'IA', 'EE', 'Criterion-based marking'],
  },
  IGCSE: {
    id: 'IGCSE',
    label: 'IGCSE',
    shortLabel: 'IGCSE',
    gradeRange: [9, 11],
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
      'History', 'Geography', 'Business Studies', 'Computer Science', 'Economics',
    ],
    commandTerms: ['Analyse', 'Calculate', 'Compare', 'Define', 'Describe', 'Evaluate', 'Explain', 'Identify', 'Justify', 'Outline', 'State', 'Suggest'],
    features: ['Paper 1/2 structure', 'Formula sheets', 'Extended vs Core'],
  },
  GCSE: {
    id: 'GCSE',
    label: 'GCSE',
    shortLabel: 'GCSE',
    gradeRange: [9, 11],
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Language',
      'English Literature', 'History', 'Geography', 'Computer Science', 'Business',
    ],
    commandTerms: ['Analyse', 'Calculate', 'Compare', 'Define', 'Describe', 'Evaluate', 'Explain', 'Identify', 'Justify', 'Outline', 'State'],
    features: ['Paper 1/2 structure', 'Formula sheets', '9-1 grading'],
  },
  A_LEVELS: {
    id: 'A_LEVELS',
    label: 'A Level',
    shortLabel: 'A Level',
    gradeRange: [12, 13],
    subjects: [
      'Mathematics', 'Further Mathematics', 'Physics', 'Chemistry', 'Biology',
      'Economics', 'History', 'English Literature', 'Business', 'Computer Science',
    ],
    commandTerms: ['Analyse', 'Assess', 'Calculate', 'Compare', 'Define', 'Describe', 'Discuss', 'Evaluate', 'Explain', 'Justify', 'Outline'],
    features: ['AS/A2 papers', 'Synoptic assessment'],
  },
  AP: {
    id: 'AP',
    label: 'AP',
    shortLabel: 'AP',
    gradeRange: [10, 12],
    subjects: [
      'Calculus AB', 'Calculus BC', 'Biology', 'Chemistry', 'Physics 1',
      'Physics C', 'US History', 'World History', 'Psychology', 'Statistics',
      'English Language', 'English Literature', 'Economics',
    ],
    commandTerms: ['Analyze', 'Calculate', 'Compare', 'Define', 'Describe', 'Evaluate', 'Explain', 'Identify', 'Justify', 'Predict'],
    features: ['FRQ vs MCQ modes', 'Unit-based paths', 'AP scoring rubrics'],
  },
  CBSE: {
    id: 'CBSE',
    label: 'CBSE',
    shortLabel: 'CBSE',
    gradeRange: [6, 12],
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
      'Hindi', 'Social Science', 'Computer Science', 'Economics', 'Accountancy',
    ],
    commandTerms: ['Define', 'Describe', 'Differentiate', 'Draw', 'Explain', 'List', 'Name', 'State', 'Write'],
    features: ['Chapter-wise notes', 'NCERT-aligned', 'Board-style long answers'],
  },
  ICSE: {
    id: 'ICSE',
    label: 'ICSE',
    shortLabel: 'ICSE',
    gradeRange: [6, 10],
    subjects: [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
      'History', 'Geography', 'Computer Applications', 'Economics',
    ],
    commandTerms: ['Define', 'Describe', 'Differentiate', 'Draw', 'Explain', 'List', 'Name', 'State'],
    features: ['Chapter-wise notes', 'Board-style answers'],
  },
};

/** Legacy display labels used in Paper Maker API payloads */
export const BOARD_API_LABELS: Record<ExamBoard, string> = {
  IB_MYP: 'IB MYP',
  IB_DP: 'IB DP',
  IGCSE: 'IGCSE',
  GCSE: 'GCSE',
  A_LEVELS: 'A Levels',
  AP: 'AP',
  CBSE: 'CBSE',
  ICSE: 'ICSE',
};

export function boardFromApiLabel(label: string): ExamBoard | null {
  const entry = Object.entries(BOARD_API_LABELS).find(([, v]) => v === label);
  return entry ? (entry[0] as ExamBoard) : null;
}

export function boardToApiLabel(board: ExamBoard): string {
  return BOARD_API_LABELS[board];
}

export function getBoardConfig(board: ExamBoard): BoardConfig {
  return BOARD_CONFIGS[board];
}

export function getGradesForBoard(board: ExamBoard): number[] {
  const [start, end] = BOARD_CONFIGS[board].gradeRange;
  return range(start, end);
}

export function getSubjectsForBoard(board: ExamBoard, grade?: number | null): string[] {
  let list = [...BOARD_CONFIGS[board].subjects];
  if (board === 'IB_MYP') {
    if (grade === 10 && !list.includes('Math Extended')) list.push('Math Extended');
    if (grade && grade >= 8 && grade <= 10) {
      ['Spanish (Extended)', 'French (Extended)', 'Hindi (Extended)'].forEach((s) => {
        if (!list.includes(s)) list.push(s);
      });
    }
  }
  return list;
}

export function boardLabel(board: ExamBoard | null): string | null {
  return board ? BOARD_CONFIGS[board].label : null;
}

export function boardShortLabel(board: ExamBoard | null): string | null {
  return board ? BOARD_CONFIGS[board].shortLabel : null;
}

function readMetadataValue(
  metadata: Record<string, unknown> | null | undefined,
  flatKey: string,
  nestedKey: string,
): unknown {
  if (!metadata) return undefined;
  if (metadata[flatKey] !== undefined) return metadata[flatKey];
  const prefs = metadata.preferences;
  if (prefs && typeof prefs === 'object') {
    return (prefs as Record<string, unknown>)[nestedKey];
  }
  return undefined;
}

export function getCurriculumPreference(
  user: { user_metadata?: Record<string, unknown> | null } | null,
): CurriculumPreference {
  const metadata = user?.user_metadata ?? {};

  const rawBoard = readMetadataValue(metadata, 'board', 'board');
  const board =
    typeof rawBoard === 'string' && EXAM_BOARDS.includes(rawBoard as ExamBoard)
      ? (rawBoard as ExamBoard)
      : null;

  const rawGrade = readMetadataValue(metadata, 'grade', 'grade');
  const grade =
    typeof rawGrade === 'number'
      ? rawGrade
      : typeof rawGrade === 'string' && rawGrade !== ''
        ? parseInt(rawGrade, 10)
        : null;

  const rawSubjects = readMetadataValue(metadata, 'subjects', 'subjects');
  const subjects = Array.isArray(rawSubjects)
    ? rawSubjects.filter((s): s is string => typeof s === 'string')
    : [];

  const rawExamDate = readMetadataValue(metadata, 'exam_date', 'examDate');
  const examDate = typeof rawExamDate === 'string' ? rawExamDate : null;

  return { board, grade, subjects, examDate };
}

export function buildCurriculumMetadata(
  pref: Partial<CurriculumPreference>,
  existing?: Record<string, unknown>,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = { ...(existing ?? {}) };
  const prefs: Record<string, unknown> = {};

  if (pref.board !== undefined) {
    metadata.board = pref.board;
    prefs.board = pref.board;
  }
  if (pref.grade !== undefined) {
    metadata.grade = pref.grade;
    prefs.grade = pref.grade;
  }
  if (pref.subjects !== undefined) {
    metadata.subjects = pref.subjects;
    prefs.subjects = pref.subjects;
  }
  if (pref.examDate !== undefined) {
    metadata.exam_date = pref.examDate;
    prefs.examDate = pref.examDate;
  }

  if (Object.keys(prefs).length > 0) {
    metadata.preferences = {
      ...((metadata.preferences as Record<string, unknown>) ?? {}),
      ...prefs,
    };
  }

  return metadata;
}

export function daysUntilExam(examDate: string | null): number | null {
  if (!examDate) return null;
  const target = new Date(examDate);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export type BoardLearningTrack = {
  title: string;
  to: string;
  tools: Array<{ label: string; to: string }>;
  boards: ExamBoard[];
};

export const BOARD_LEARNING_TRACKS: BoardLearningTrack[] = [
  {
    title: 'English — Language & Literature',
    to: '/archives-lnl',
    boards: ['IB_MYP', 'IB_DP', 'IGCSE', 'GCSE', 'A_LEVELS'],
    tools: [
      { label: 'Exemplars', to: '/archives-lnl' },
      { label: 'Essay review', to: '/answer-reviewer' },
      { label: 'AI notes', to: '/notetaker' },
    ],
  },
  {
    title: 'History',
    to: '/archives-history',
    boards: ['IB_MYP', 'IB_DP', 'IGCSE', 'GCSE', 'A_LEVELS', 'AP', 'CBSE', 'ICSE'],
    tools: [
      { label: 'Timelines', to: '/archives-history' },
      { label: 'Mock paper', to: '/paper-maker' },
      { label: 'Source review', to: '/answer-reviewer' },
    ],
  },
  {
    title: 'Geography',
    to: '/archives-geography',
    boards: ['IB_MYP', 'IB_DP', 'IGCSE', 'GCSE', 'A_LEVELS', 'ICSE'],
    tools: [
      { label: 'Case studies', to: '/archives-geography' },
      { label: 'Formulas', to: '/study-tools' },
      { label: 'Practice quiz', to: '/notetaker' },
    ],
  },
  {
    title: 'Math & Sciences',
    to: '/study-tools',
    boards: ['IB_MYP', 'IB_DP', 'IGCSE', 'GCSE', 'A_LEVELS', 'AP', 'CBSE', 'ICSE'],
    tools: [
      { label: 'Formula sheets', to: '/study-tools' },
      { label: 'IB Math guide', to: '/resources/ib-math-aa-ai-guide' },
      { label: 'Mock paper', to: '/paper-maker' },
    ],
  },
  {
    title: 'TOK & Extended Essay',
    to: '/resources/ib-tok-guide-ai',
    boards: ['IB_DP'],
    tools: [
      { label: 'TOK guide', to: '/resources/ib-tok-guide-ai' },
      { label: 'Board library', to: '/resource-library' },
      { label: 'Essay review', to: '/answer-reviewer' },
      { label: 'AI notes', to: '/notetaker' },
    ],
  },
  {
    title: 'AP Unit Practice',
    to: '/paper-maker',
    boards: ['AP'],
    tools: [
      { label: 'FRQ practice', to: '/paper-maker' },
      { label: 'MCQ drill', to: '/notetaker' },
      { label: 'Answer review', to: '/answer-reviewer' },
    ],
  },
  {
    title: 'NCERT Chapter Notes',
    to: '/notetaker',
    boards: ['CBSE', 'ICSE'],
    tools: [
      { label: 'Chapter notes', to: '/notetaker' },
      { label: 'Board library', to: '/resource-library' },
      { label: 'Long answers', to: '/answer-reviewer' },
      { label: 'Mock paper', to: '/paper-maker' },
    ],
  },
];

export function getTracksForBoard(board: ExamBoard | null): BoardLearningTrack[] {
  if (!board) return BOARD_LEARNING_TRACKS.filter((t) => !t.boards.includes('IB_DP') || t.title !== 'TOK & Extended Essay').slice(0, 4);
  return BOARD_LEARNING_TRACKS.filter((t) => t.boards.includes(board));
}

export function getBoardHeroMessage(board: ExamBoard | null): string {
  if (!board) return 'Everything connects here — notes flow into flashcards, papers into reviews, and progress follows you across every tool.';
  const config = BOARD_CONFIGS[board];
  const features = config.features?.slice(0, 2).join(', ') ?? 'exam prep';
  return `Your ${config.label} workspace — ${features}, and tools tuned to your board.`;
}

export function getThisWeekFocus(
  board: ExamBoard | null,
  subjects: string[],
  daysLeft: number | null,
): string[] {
  const focus: string[] = [];
  if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 14) {
    focus.push(`Exam in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — prioritize weak topics and timed mocks`);
  }
  if (subjects.length > 0) {
    focus.push(`This week: drill ${subjects.slice(0, 2).join(' & ')} with flashcards and a mock paper`);
  }
  if (board === 'IB_DP') {
    focus.push('Review command terms and criterion language before submitting IA drafts');
  } else if (board === 'AP') {
    focus.push('Alternate FRQ practice with MCQ review for unit mastery');
  } else if (board === 'CBSE' || board === 'ICSE') {
    focus.push('Work through chapter-wise notes and board-style long answers');
  } else if (board === 'IGCSE' || board === 'GCSE') {
    focus.push('Practice Paper 1/2 structure under timed conditions');
  }
  return focus.slice(0, 3);
}
