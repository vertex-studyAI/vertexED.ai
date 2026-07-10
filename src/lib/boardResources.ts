import type { ExamBoard } from '@/types/curriculum';
import { BOARD_CONFIGS, boardToApiLabel } from '@/lib/curriculum';
import { authFetch } from '@/lib/apiAuth';
import type { BoardGuideTopic } from '@/content/boardResourceCatalog';

export type BoardGuide = {
  id: string;
  board: ExamBoard;
  topicId: string;
  title: string;
  subject: string;
  content: string;
  wordCount: number;
  generatedAt: string;
};

const CACHE_KEY = 'vertex_board_guides_v1';
const MAX_CACHED = 24;

function readCache(): BoardGuide[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as BoardGuide[]) : [];
  } catch {
    return [];
  }
}

function writeCache(guides: BoardGuide[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(guides.slice(0, MAX_CACHED)));
}

export function getCachedGuide(board: ExamBoard, topicId: string): BoardGuide | null {
  return readCache().find((g) => g.board === board && g.topicId === topicId) ?? null;
}

export function listCachedGuides(board?: ExamBoard): BoardGuide[] {
  const all = readCache();
  return board ? all.filter((g) => g.board === board) : all;
}

export async function generateBoardGuide(
  board: ExamBoard,
  topic: BoardGuideTopic,
  grade?: number | null,
): Promise<BoardGuide> {
  const cached = getCachedGuide(board, topic.id);
  if (cached) return cached;

  const config = BOARD_CONFIGS[board];
  const response = await authFetch('/api/board-resource', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board,
      boardLabel: boardToApiLabel(board),
      topicId: topic.id,
      title: topic.title,
      subject: topic.subject,
      description: topic.description,
      tags: topic.tags,
      commandTerms: config.commandTerms,
      features: config.features,
      grade: grade ?? null,
      targetWords: Math.max(topic.estimatedWords, 1000),
    }),
  });

  const data = (await response.json()) as {
    content?: string;
    wordCount?: number;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'Guide generation failed');
  }

  const guide: BoardGuide = {
    id: `guide-${board}-${topic.id}`,
    board,
    topicId: topic.id,
    title: topic.title,
    subject: topic.subject,
    content: data.content ?? '',
    wordCount: data.wordCount ?? 0,
    generatedAt: new Date().toISOString(),
  };

  writeCache([guide, ...readCache().filter((g) => !(g.board === board && g.topicId === topic.id))]);
  return guide;
}

export function exportGuideMarkdown(guide: BoardGuide): void {
  const blob = new Blob([`# ${guide.title}\n\n${guide.content}`], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${guide.topicId}-${guide.board}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
