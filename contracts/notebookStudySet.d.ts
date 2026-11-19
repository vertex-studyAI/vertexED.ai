export type CurriculumPath = { curriculum: string; board: string; syllabusVersion: string; subject: string; unit: string; topic: string; subtopic: string };
export type GenerationRecord = { version: string; requestKey: string; factualStatus: 'unreviewed'; model: string; curriculum: CurriculumPath | null };
export const STUDY_SET_VERSION: string;
export const STUDY_SET_STEPS: readonly ['lesson', 'flashcards', 'quiz', 'study-guide'];
export const STUDY_CURRICULA: string[];
export const CURRICULUM_FIELDS: Array<keyof CurriculumPath>;
export function validCurriculumPath(value: unknown): value is CurriculumPath;
export function validGenerationRecord(value: unknown): value is GenerationRecord;
export function notebookRequestKey(request: { mode: string; sources: Array<{ id: string; title: string; excerpt: string }>; notebookTitle?: string; customPrompt?: string; curriculum?: CurriculumPath | null }): Promise<string>;
export function runNotebookStudySet<T extends { mode: string; generation?: GenerationRecord }>(options: {
  request: { sources: Array<{ id: string; title: string; excerpt: string }>; notebookTitle?: string; curriculum?: CurriculumPath | null };
  findSaved: (key: string) => unknown;
  generate: (request: { mode: typeof STUDY_SET_STEPS[number]; sources: Array<{ id: string; title: string; excerpt: string }>; notebookTitle?: string; curriculum?: CurriculumPath | null }) => Promise<T>;
  save: (result: T) => void | Promise<void>;
  onStep: (mode: typeof STUDY_SET_STEPS[number], status: string) => void;
  isCurrent: () => boolean;
}): Promise<{ status: string; completed: string[] }>;
