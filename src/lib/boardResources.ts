import type { ExamBoard } from '@/types/curriculum';
import { BOARD_CONFIGS, boardToApiLabel } from '@/lib/curriculum';
import { authFetch } from '@/lib/apiAuth';
import type { BoardGuideTopic } from '@/content/boardResourceCatalog';
import { resolveLocalStorage, safeStorageGet, safeStorageSet } from '@/lib/browserStorage.mjs';
import { userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';

export type BoardGuide = {
  id: string;
  board: ExamBoard;
  topicId: string;
  grade?: number | null;
  title: string;
  subject: string;
  content: string;
  wordCount: number;
  generatedAt: string;
  expiresAt: string;
  status: 'AI_GENERATED_UNVERIFIED';
  generation: {
    provider: string;
    model: string;
    checkedAgainstOfficialSpecification: false;
  };
};

const MAX_CACHED = 24;
const CACHE_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

function cacheKey(storageScope?: string | null) {
  return storageScope === undefined
    ? userContentStorageKeys().boardGuides
    : userContentStorageKeys(storageScope).boardGuides;
}

function storage() {
  return typeof window === 'undefined' ? null : resolveLocalStorage(window);
}

function readCache(storageScope?: string | null): BoardGuide[] {
  try {
    const raw = safeStorageGet(storage(), cacheKey(storageScope));
    const parsed = raw ? (JSON.parse(raw) as BoardGuide[]) : [];
    return Array.isArray(parsed)
      ? parsed.filter((guide) => guide?.status === 'AI_GENERATED_UNVERIFIED' && Boolean(guide.expiresAt))
      : [];
  } catch {
    return [];
  }
}

function writeCache(guides: BoardGuide[], storageScope?: string | null): boolean {
  return safeStorageSet(storage(), cacheKey(storageScope), JSON.stringify(guides.slice(0, MAX_CACHED)));
}

export function getCachedGuide(
  board: ExamBoard,
  topicId: string,
  grade?: number | null,
  storageScope?: string | null,
): BoardGuide | null {
  const now = Date.now();
  return readCache(storageScope).find((g) => (
    g.board === board && g.topicId === topicId && (g.grade ?? null) === (grade ?? null) && Date.parse(g.expiresAt) > now
  )) ?? null;
}

export function listCachedGuides(board?: ExamBoard, storageScope?: string | null): BoardGuide[] {
  const all = readCache(storageScope);
  return board ? all.filter((g) => g.board === board) : all;
}

export async function generateBoardGuide(
  board: ExamBoard,
  topic: BoardGuideTopic,
  grade?: number | null,
  storageScope?: string | null,
): Promise<BoardGuide> {
  const cached = getCachedGuide(board, topic.id, grade, storageScope);
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
    generatedAt?: string;
    generation?: { status?: string; provider?: string; model?: string };
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'Guide generation failed');
  }

  const generatedAt = data.generatedAt ?? new Date().toISOString();
  const guide: BoardGuide = {
    id: `guide-${board}-${topic.id}`,
    board,
    topicId: topic.id,
    grade: grade ?? null,
    title: topic.title,
    subject: topic.subject,
    content: data.content ?? '',
    wordCount: data.wordCount ?? 0,
    generatedAt,
    expiresAt: new Date(Date.parse(generatedAt) + CACHE_LIFETIME_MS).toISOString(),
    status: 'AI_GENERATED_UNVERIFIED',
    generation: {
      provider: data.generation?.provider ?? 'openai',
      model: data.generation?.model ?? 'unknown',
      checkedAgainstOfficialSpecification: false,
    },
  };

  writeCache(
    [
      guide,
      ...readCache(storageScope).filter(
        (g) => !(g.board === board && g.topicId === topic.id && (g.grade ?? null) === (grade ?? null)),
      ),
    ],
    storageScope,
  );
  return guide;
}

export function exportGuideMarkdown(guide: BoardGuide): void {
  const blob = new Blob([`# ${guide.title}\n\n> AI-generated, unverified study material. Check against the current official syllabus.\n> Generated: ${guide.generatedAt}; model: ${guide.generation.model}; board: ${guide.board}; grade: ${guide.grade ?? "unspecified"}.\n\n${guide.content}`], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${guide.topicId}-${guide.board}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
