export type StudyPack = {
  version: '2026-10-21.1';
  references?: Array<{ title: string; url: string; note: string }>;
  notes: Array<{ title: string; paragraphs: string[] }>;
  workedExamples: Array<{ id: string; prompt: string; steps: string[]; conclusion: string }>;
  flashcards: Array<{ id: string; front: string; back: string }>;
  diagrams: Array<{
    id: string; title: string; description: string;
    nodes: Array<{ id: string; label: string; detail: string }>;
    edges: Array<{ from: string; to: string; label: string }>;
  }>;
};
