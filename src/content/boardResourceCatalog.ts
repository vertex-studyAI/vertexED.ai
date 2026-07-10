import type { ExamBoard } from '@/types/curriculum';

export type BoardGuideTopic = {
  id: string;
  subject: string;
  title: string;
  description: string;
  estimatedWords: number;
  tags: string[];
};

/** Curated deep-dive topics per board — AI expands to 1000+ words on demand */
export const BOARD_GUIDE_CATALOG: Partial<Record<ExamBoard, BoardGuideTopic[]>> = {
  IB_DP: [
    { id: 'ib-tok-framework', subject: 'TOK', title: 'TOK Knowledge Frameworks Masterclass', description: 'Areas of knowledge, ways of knowing, and how to structure a TOK essay that examiners reward.', estimatedWords: 1400, tags: ['TOK', 'essay', 'frameworks'] },
    { id: 'ib-math-aa-hl', subject: 'Math AA', title: 'IB Math AA HL: Calculus & Proof Strategy', description: 'Paper 1 non-calculator tactics, proof structures, and the topics that separate 6s from 7s.', estimatedWords: 1500, tags: ['math', 'calculus', 'HL'] },
    { id: 'ib-ee-guide', subject: 'Extended Essay', title: 'Extended Essay: From Research Question to Rubric', description: 'How to pick a viable RQ, structure 4000 words, and hit every criterion without padding.', estimatedWords: 1300, tags: ['EE', 'research'] },
    { id: 'ib-bio-ia', subject: 'Biology', title: 'Biology IA: Experimental Design & Analysis', description: 'Personal engagement, methodology, uncertainty, and statistical tests that satisfy moderators.', estimatedWords: 1200, tags: ['IA', 'sciences'] },
  ],
  IB_MYP: [
    { id: 'myp-criteria', subject: 'MYP', title: 'MYP Criteria A–D: What Examiners Want', description: 'Criterion language decoded with subject-specific examples across sciences and humanities.', estimatedWords: 1100, tags: ['criteria', 'MYP'] },
    { id: 'myp-interdisciplinary', subject: 'MYP', title: 'Interdisciplinary Units & Global Contexts', description: 'How to connect subjects and write IDU reflections that score on all four criteria.', estimatedWords: 1000, tags: ['IDU', 'contexts'] },
  ],
  IGCSE: [
    { id: 'igcse-math-extended', subject: 'Mathematics', title: 'IGCSE Extended Mathematics: Full Topic Map', description: 'Algebra through vectors — pacing guide, formula sheet habits, and Paper 2 extended techniques.', estimatedWords: 1600, tags: ['math', 'extended'] },
    { id: 'igcse-science-triple', subject: 'Sciences', title: 'IGCSE Triple Science: Practical & Theory Balance', description: 'Core vs extended content, required practicals, and how to structure 6-mark questions.', estimatedWords: 1400, tags: ['physics', 'chemistry', 'biology'] },
    { id: 'igcse-english-lang', subject: 'English', title: 'IGCSE English Language: Reading & Writing Papers', description: 'Summary, directed writing, and composition — timing and mark-scheme alignment.', estimatedWords: 1200, tags: ['english', 'writing'] },
  ],
  AP: [
    { id: 'ap-calc-ab-frq', subject: 'Calculus AB', title: 'AP Calculus AB: FRQ Playbook by Unit', description: 'Unit-by-unit FRQ patterns, calculator vs non-calculator strategy, and common partial-credit traps.', estimatedWords: 1500, tags: ['calculus', 'FRQ'] },
    { id: 'ap-bio-data', subject: 'Biology', title: 'AP Biology: Data Analysis & Experimental Design', description: 'Chi-square, standard error, graph interpretation, and how to earn every point on lab questions.', estimatedWords: 1300, tags: ['biology', 'data'] },
    { id: 'apush-dbq', subject: 'US History', title: 'AP US History: DBQ & LEQ Structure', description: 'Thesis formulas, document grouping, and outside evidence that satisfy the rubric.', estimatedWords: 1400, tags: ['history', 'DBQ'] },
    { id: 'ap-chem-titration', subject: 'Chemistry', title: 'AP Chemistry: Titration & Equilibrium Deep Dive', description: 'ICE tables, buffers, Ksp problems, and FRQ wording examiners expect.', estimatedWords: 1200, tags: ['chemistry'] },
  ],
  ICSE: [
    { id: 'icse-math-algebra', subject: 'Mathematics', title: 'ICSE Mathematics: Algebra to Trigonometry Mastery', description: 'Board-style step marking, factorisation patterns, and proving identities under time pressure.', estimatedWords: 1400, tags: ['math', 'algebra'] },
    { id: 'icse-physics-numericals', subject: 'Physics', title: 'ICSE Physics: Numericals & Diagrams Guide', description: 'Units, ray diagrams, circuits, and how to show working for full method marks.', estimatedWords: 1300, tags: ['physics'] },
    { id: 'icse-history-essays', subject: 'History', title: 'ICSE History: Source-Based & Essay Answers', description: 'Cause–event–consequence chains, timeline revision, and 5-mark vs 8-mark structure.', estimatedWords: 1200, tags: ['history'] },
    { id: 'icse-english-lit', subject: 'English', title: 'ICSE English Literature: Unseen & Prescribed Texts', description: 'Character analysis, theme paragraphs, and quotation integration ICSE examiners reward.', estimatedWords: 1100, tags: ['english', 'literature'] },
  ],
  GCSE: [
    { id: 'gcse-math-higher', subject: 'Mathematics', title: 'GCSE Maths Higher: Grade 7–9 Topic Sprint', description: 'Proof, vectors, trig identities, and the problem-solving questions that decide top grades.', estimatedWords: 1300, tags: ['math', 'higher'] },
    { id: 'gcse-combined-science', subject: 'Sciences', title: 'GCSE Combined Science: Required Practicals', description: 'Every required practical explained with method, risks, and typical 6-mark questions.', estimatedWords: 1400, tags: ['science', 'practicals'] },
  ],
  A_LEVELS: [
    { id: 'alevel-math-pure', subject: 'Mathematics', title: 'A Level Pure: Proof, Calculus & Series', description: 'Synoptic links, proof by induction, and integration techniques for Paper 1 & 2.', estimatedWords: 1500, tags: ['math', 'pure'] },
    { id: 'alevel-essay-structure', subject: 'Essay Subjects', title: 'A Level Essays: Line of Argument Framework', description: 'Introduction judgments, paragraph PEEL+, and conclusions that secure A/A* bands.', estimatedWords: 1200, tags: ['essay', 'history', 'english'] },
  ],
  CBSE: [
    { id: 'cbse-ncert-math', subject: 'Mathematics', title: 'CBSE Class 10–12 Mathematics: NCERT to Board', description: 'Chapter weightage, sample paper patterns, and step-marking for full credit.', estimatedWords: 1300, tags: ['math', 'NCERT'] },
    { id: 'cbse-science-practical', subject: 'Science', title: 'CBSE Science: Practical & Viva Preparation', description: 'Lab records, viva questions, and theory links for Physics, Chemistry, Biology.', estimatedWords: 1100, tags: ['practical', 'science'] },
  ],
};

export function getGuidesForBoard(board: ExamBoard | null): BoardGuideTopic[] {
  if (!board) return Object.values(BOARD_GUIDE_CATALOG).flat().slice(0, 8);
  return BOARD_GUIDE_CATALOG[board] ?? [];
}
