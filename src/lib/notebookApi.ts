import { authFetch } from '@/lib/apiAuth';
import type { GroundedSourcePayload, NotebookOutputKind } from '@/lib/notebook';

export type NotebookGenerateRequest = {
  mode: NotebookOutputKind;
  sources: GroundedSourcePayload[];
  notebookTitle?: string;
  customPrompt?: string;
};

export type NotebookGenerateResponse = {
  mode: NotebookOutputKind;
  title: string;
  content: string;
  generatedAt: string;
  flashcards?: Array<{ front: string; back: string }>;
  quiz?: import('@/lib/notebook').QuizQuestion[];
  suggestedQuestions?: string[];
  isAudioScript?: boolean;
  error?: string;
};

export async function generateNotebookOutput(
  request: NotebookGenerateRequest,
): Promise<NotebookGenerateResponse> {
  const response = await authFetch('/api/notebook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = (await response.json()) as NotebookGenerateResponse;
  if (!response.ok) {
    throw new Error(data.error ?? `Generation failed (${response.status})`);
  }
  return data;
}
