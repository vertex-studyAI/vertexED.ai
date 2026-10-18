export type ApCategory = 'Arts' | 'English' | 'History and social sciences' | 'Maths and computer science' | 'Sciences' | 'World languages' | 'Capstone' | 'Career Kickstart';

export type ApQuestion = {
  id: string;
  prompt: string;
  hint: string;
  answer: string;
  checkpoints: string[];
  hints?: string[];
  marks?: number;
  difficulty?: 'foundation' | 'standard' | 'transfer';
  calculatorPolicy?: 'not-required' | 'allowed' | 'required';
  numericAnswer?: { value: number; tolerance: number };
  retryOf?: string;
};

export type ApModule = {
  id: string;
  title: string;
  frameworkUnit: string;
  focus: string;
  explanation: string[];
  workedExample: { prompt: string; steps: string[] };
  misconception: { claim: string; correction: string };
  questions: ApQuestion[];
  objectives?: string[];
  prerequisites?: string[];
  reviewCards?: Array<{ id: string; front: string; back: string }>;
};

export type ApCourse = {
  slug: string;
  title: string;
  category: ApCategory;
  summary: string;
  officialUrl: string;
  frameworkNote: string;
  assessment: 'exam' | 'portfolio' | 'research' | 'mixed';
  modules: ApModule[];
};

export type ApCourseSummary = Omit<ApCourse, 'modules'> & {
  contentSha256: string;
  modules: Array<Pick<ApModule, 'id' | 'title' | 'frameworkUnit' | 'focus'>>;
  questionCount: number;
};
