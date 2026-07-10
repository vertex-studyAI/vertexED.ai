export type ExamBoard =
  | 'IB_MYP'
  | 'IB_DP'
  | 'IGCSE'
  | 'GCSE'
  | 'A_LEVELS'
  | 'AP'
  | 'CBSE'
  | 'ICSE';

export type CurriculumPreference = {
  board: ExamBoard | null;
  grade: number | null;
  subjects: string[];
  examDate: string | null;
};

export type BoardConfig = {
  id: ExamBoard;
  label: string;
  shortLabel: string;
  gradeRange: [number, number];
  subjects: string[];
  criteria?: string[];
  commandTerms?: string[];
  features?: string[];
};
