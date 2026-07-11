/**
 * Study Notebook domain — NotebookLM-inspired multi-source workspaces.
 * Persistence: localStorage with optional cloud artifact sync.
 */

import type { StudyArtifact } from '@/lib/userContent';

export type NotebookSourceType = 'text' | 'paste' | 'artifact' | 'transcript' | 'file';

export type NotebookSource = {
  id: string;
  type: NotebookSourceType;
  title: string;
  content: string;
  wordCount: number;
  createdAt: string;
  enabled: boolean;
};

export type NotebookOutputKind =
  | 'study-guide'
  | 'briefing'
  | 'faq'
  | 'audio-script'
  | 'audio-brief'
  | 'audio-critique'
  | 'audio-debate'
  | 'timeline'
  | 'flashcards'
  | 'quiz'
  | 'glossary'
  | 'outline'
  | 'mind-map'
  | 'compare'
  | 'suggested-questions'
  | 'world-model'
  | 'board-deep-dive';

export type QuizQuestion = {
  id: string;
  question: string;
  type: 'mcq' | 'short';
  options: string[];
  answer: string;
  explanation: string;
  marks: number;
};

export type NotebookOutput = {
  id: string;
  kind: NotebookOutputKind;
  title: string;
  content: string;
  generatedAt: string;
  flashcards?: Array<{ front: string; back: string }>;
  quiz?: QuizQuestion[];
  suggestedQuestions?: string[];
  isAudioScript?: boolean;
};

export type StudyNotebook = {
  id: string;
  title: string;
  subject: string;
  sources: NotebookSource[];
  outputs: NotebookOutput[];
  suggestedQuestions: string[];
  createdAt: string;
  updatedAt: string;
};

export type GroundedSourcePayload = {
  id: string;
  title: string;
  excerpt: string;
};

const STORAGE_KEY = 'vertex_study_notebooks_v1';
const MAX_NOTEBOOKS = 12;
const MAX_SOURCES_PER_NOTEBOOK = 20;
const MAX_SOURCE_CHARS = 50_000;
const MAX_TOTAL_GROUNDING_CHARS = 100_000;

export const NOTEBOOK_STUDIO_GROUPS: Array<{
  id: string;
  label: string;
  kinds: NotebookOutputKind[];
}> = [
  {
    id: 'learn',
    label: 'Learn',
    kinds: ['study-guide', 'outline', 'glossary', 'mind-map', 'timeline'],
  },
  {
    id: 'review',
    label: 'Review',
    kinds: ['quiz', 'flashcards', 'faq', 'suggested-questions'],
  },
  {
    id: 'audio',
    label: 'Audio',
    kinds: ['audio-script', 'audio-brief', 'audio-critique', 'audio-debate'],
  },
  {
    id: 'analyze',
    label: 'Analyze',
    kinds: ['briefing', 'compare', 'world-model', 'board-deep-dive'],
  },
];

export const NOTEBOOK_OUTPUT_META: Record<
  NotebookOutputKind,
  { label: string; description: string; icon: string }
> = {
  'study-guide': {
    label: 'Study Guide',
    description: 'Structured concepts, traps, and practice questions',
    icon: 'book',
  },
  briefing: {
    label: 'Briefing Doc',
    description: 'One-page summary — key claims, definitions, and open questions from your sources',
    icon: 'file',
  },
  faq: {
    label: 'FAQ',
    description: 'Exam-style Q&A grounded in your material',
    icon: 'help',
  },
  'audio-script': {
    label: 'Deep Dive',
    description: 'Two-voice script walking through arguments and examples in your sources',
    icon: 'mic',
  },
  'audio-brief': {
    label: 'Brief',
    description: 'Under-2-minute essential takeaways',
    icon: 'mic',
  },
  'audio-critique': {
    label: 'Critique',
    description: 'Constructive evaluation of arguments in your sources',
    icon: 'mic',
  },
  'audio-debate': {
    label: 'Debate',
    description: 'Structured opposing views with exam-ready conclusion',
    icon: 'mic',
  },
  timeline: {
    label: 'Timeline',
    description: 'Chronological or logical progression of ideas',
    icon: 'clock',
  },
  flashcards: {
    label: 'Flashcards',
    description: 'Retrieval-ready cards — push to your SR deck',
    icon: 'layers',
  },
  quiz: {
    label: 'Practice Quiz',
    description: 'MCQ and short-answer questions with mark-scheme hints',
    icon: 'check',
  },
  glossary: {
    label: 'Glossary',
    description: 'Key terms table with exam tips',
    icon: 'list',
  },
  outline: {
    label: 'Outline',
    description: 'Hierarchical table of contents for revision',
    icon: 'tree',
  },
  'mind-map': {
    label: 'Concept Map',
    description: 'Visual map of how ideas connect',
    icon: 'network',
  },
  compare: {
    label: 'Compare Sources',
    description: 'Agreements, tensions, and synthesis across sources',
    icon: 'git',
  },
  'suggested-questions': {
    label: 'Ask This',
    description: 'Starter questions for Apex — grounded in what your sources actually say',
    icon: 'spark',
  },
  'world-model': {
    label: 'World Model',
    description: 'Topic layers and prerequisites mapped from your sources — weak links flagged',
    icon: 'network',
  },
  'board-deep-dive': {
    label: 'Board Deep Dive',
    description: 'Long-form guide for your board — command words, mark bands, and common traps',
    icon: 'graduation',
  },
};

/** Migrate legacy notebooks missing suggestedQuestions */
function normalizeNotebook(nb: StudyNotebook): StudyNotebook {
  return {
    ...nb,
    suggestedQuestions: nb.suggestedQuestions ?? [],
  };
}

function readAll(): StudyNotebook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? (JSON.parse(raw) as StudyNotebook[]) : [];
    return list.map(normalizeNotebook);
  } catch {
    return [];
  }
}

function writeAll(notebooks: StudyNotebook[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks.slice(0, MAX_NOTEBOOKS)));
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function listNotebooks(): StudyNotebook[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getNotebook(id: string): StudyNotebook | null {
  return readAll().find((n) => n.id === id) ?? null;
}

export function createNotebook(title = 'Untitled notebook', subject = ''): StudyNotebook {
  const now = new Date().toISOString();
  const notebook: StudyNotebook = {
    id: newId('nb'),
    title: title.trim().slice(0, 120) || 'Untitled notebook',
    subject: subject.trim().slice(0, 80),
    sources: [],
    outputs: [],
    suggestedQuestions: [],
    createdAt: now,
    updatedAt: now,
  };
  writeAll([notebook, ...readAll()]);
  return notebook;
}

export function updateNotebook(id: string, patch: Partial<Pick<StudyNotebook, 'title' | 'subject'>>): StudyNotebook | null {
  const notebooks = readAll();
  const idx = notebooks.findIndex((n) => n.id === id);
  if (idx < 0) return null;

  const updated: StudyNotebook = {
    ...notebooks[idx],
    ...patch,
    title: patch.title !== undefined ? patch.title.trim().slice(0, 120) || notebooks[idx].title : notebooks[idx].title,
    subject: patch.subject !== undefined ? patch.subject.trim().slice(0, 80) : notebooks[idx].subject,
    updatedAt: new Date().toISOString(),
  };
  notebooks[idx] = updated;
  writeAll(notebooks);
  return updated;
}

export function deleteNotebook(id: string): void {
  writeAll(readAll().filter((n) => n.id !== id));
}

export function addTextSource(
  notebookId: string,
  title: string,
  content: string,
  type: NotebookSourceType = 'paste',
): StudyNotebook | null {
  const notebooks = readAll();
  const idx = notebooks.findIndex((n) => n.id === notebookId);
  if (idx < 0) return null;

  const trimmed = content.trim().slice(0, MAX_SOURCE_CHARS);
  if (!trimmed) return notebooks[idx];

  const nb = notebooks[idx];
  if (nb.sources.length >= MAX_SOURCES_PER_NOTEBOOK) return nb;

  const source: NotebookSource = {
    id: newId('src'),
    type,
    title: title.trim().slice(0, 120) || 'Untitled source',
    content: trimmed,
    wordCount: countWords(trimmed),
    createdAt: new Date().toISOString(),
    enabled: true,
  };

  notebooks[idx] = {
    ...nb,
    sources: [source, ...nb.sources],
    updatedAt: new Date().toISOString(),
  };
  writeAll(notebooks);
  return notebooks[idx];
}

export function removeSource(notebookId: string, sourceId: string): StudyNotebook | null {
  const notebooks = readAll();
  const idx = notebooks.findIndex((n) => n.id === notebookId);
  if (idx < 0) return null;

  notebooks[idx] = {
    ...notebooks[idx],
    sources: notebooks[idx].sources.filter((s) => s.id !== sourceId),
    updatedAt: new Date().toISOString(),
  };
  writeAll(notebooks);
  return notebooks[idx];
}

export function toggleSource(notebookId: string, sourceId: string, enabled: boolean): StudyNotebook | null {
  const notebooks = readAll();
  const idx = notebooks.findIndex((n) => n.id === notebookId);
  if (idx < 0) return null;

  notebooks[idx] = {
    ...notebooks[idx],
    sources: notebooks[idx].sources.map((s) => (s.id === sourceId ? { ...s, enabled } : s)),
    updatedAt: new Date().toISOString(),
  };
  writeAll(notebooks);
  return notebooks[idx];
}

export function saveOutput(
  notebookId: string,
  output: Omit<NotebookOutput, 'id'>,
): StudyNotebook | null {
  const notebooks = readAll();
  const idx = notebooks.findIndex((n) => n.id === notebookId);
  if (idx < 0) return null;

  const entry: NotebookOutput = { ...output, id: newId('out') };
  const existing = notebooks[idx].outputs.filter((o) => o.kind !== output.kind);
  const patch: StudyNotebook = {
    ...notebooks[idx],
    outputs: [entry, ...existing],
    updatedAt: new Date().toISOString(),
  };
  if (output.suggestedQuestions?.length) {
    patch.suggestedQuestions = output.suggestedQuestions;
  }
  notebooks[idx] = patch;
  writeAll(notebooks);
  return notebooks[idx];
}

export function exportNotebookJson(notebook: StudyNotebook): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `vertex-notebook-${notebook.title.slice(0, 40).replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getEnabledSources(notebook: StudyNotebook): NotebookSource[] {
  return notebook.sources.filter((s) => s.enabled && s.content.trim());
}

export function buildGroundingPayload(notebook: StudyNotebook): GroundedSourcePayload[] {
  const enabled = getEnabledSources(notebook);
  let budget = MAX_TOTAL_GROUNDING_CHARS;
  const payloads: GroundedSourcePayload[] = [];

  for (const source of enabled) {
    if (budget <= 500) break;
    const excerpt = source.content.length > budget ? source.content.slice(0, budget) : source.content;
    payloads.push({ id: source.id, title: source.title, excerpt });
    budget -= excerpt.length;
  }

  return payloads;
}

export function totalSourceWords(notebook: StudyNotebook): number {
  return getEnabledSources(notebook).reduce((sum, s) => sum + s.wordCount, 0);
}

/** Import text from a saved study artifact */
export function sourceFromArtifact(artifact: StudyArtifact): { title: string; content: string } | null {
  const payload = artifact.payload;
  if (artifact.kind === 'note') {
    const notes = typeof payload.notes === 'string' ? payload.notes : '';
    const topic = typeof payload.topic === 'string' ? payload.topic : artifact.title ?? 'Notes';
    if (!notes.trim()) return null;
    return { title: topic, content: notes };
  }
  if (artifact.kind === 'review') {
    const answer = typeof payload.studentAnswer === 'string' ? payload.studentAnswer : '';
    const feedback = typeof payload.feedback === 'string' ? payload.feedback : '';
    const combined = [answer, feedback].filter(Boolean).join('\n\n---\n\n');
    if (!combined.trim()) return null;
    return { title: artifact.title ?? 'Answer review', content: combined };
  }
  if (artifact.kind === 'paper') {
    const paper = typeof payload.paper === 'string' ? payload.paper : '';
    if (!paper.trim()) return null;
    return { title: artifact.title ?? 'Mock paper', content: paper };
  }
  return null;
}

export function getOutputByKind(notebook: StudyNotebook, kind: NotebookOutputKind): NotebookOutput | null {
  return notebook.outputs.find((o) => o.kind === kind) ?? null;
}
