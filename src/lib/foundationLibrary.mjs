import { z } from 'zod';
import { learningLessonSchema } from '../../contracts/learningLibrary.js';

const digest = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const entrySchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), subject: z.string().min(1), unit: z.string().min(1),
  topic: z.string().min(1), revision: z.string().min(1), json: z.string(), markdown: z.string().nullable(),
  contentHash: digest, markdownHash: digest, answerVersion: digest,
  questionCount: z.number().int().positive(), flashcardCount: z.number().int().positive(), noteWords: z.number().int().positive(),
  editorialStatus: z.literal('unreviewed'),
}).strict().superRefine((entry, ctx) => {
  if (entry.json !== `/learning-library/${entry.id}.json` || (entry.markdown !== null && entry.markdown !== `/learning-library/${entry.id}.md`)) {
    ctx.addIssue({ code: 'custom', message: 'Unexpected library asset path.' });
  }
});
export const foundationManifestSchema = z.object({ schemaVersion: z.literal(1), scope: z.string(), entries: z.array(entrySchema).max(10000) }).strict()
  .refine(value => new Set(value.entries.map(entry => entry.id)).size === value.entries.length, 'Duplicate lesson identity.');

export async function loadFoundationManifest(signal, request = fetch) {
  const response = await request('/learning-library/manifest.json', { signal, cache: 'no-store' });
  if (!response.ok) throw new Error('The lesson catalogue could not be loaded. Try again.');
  return foundationManifestSchema.parse(await response.json());
}

export async function verifyFoundationBytes(body, expected, subtle = globalThis.crypto.subtle) {
  const bytes = await subtle.digest('SHA-256', new TextEncoder().encode(body));
  const hash = `sha256:${Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')}`;
  if (hash !== expected) throw new Error('This resource has changed or is incomplete. Reload the catalogue before continuing.');
}

export async function loadFoundationLesson(entry, signal, request = fetch) {
  entrySchema.parse(entry);
  const response = await request(entry.json, { signal, cache: 'no-store' });
  if (response.status === 403 || response.status === 404) throw new Error('This lesson is awaiting subject review or is no longer available.');
  if (!response.ok) throw new Error('The lesson could not be loaded. Try again.');
  const body = await response.text();
  await verifyFoundationBytes(body, entry.contentHash);
  const lesson = learningLessonSchema.parse(JSON.parse(body));
  if (lesson.id !== entry.id || lesson.revision !== entry.revision || lesson.questions.length !== entry.questionCount || lesson.flashcards.length !== entry.flashcardCount) {
    throw new Error('The lesson does not match this catalogue revision.');
  }
  return lesson;
}

export function checkFoundationAnswer(question, answer) {
  if (!answer.trim()) return { status: 'unanswered', message: 'Write an answer before checking.' };
  if (question.type === 'mcq') return { status: answer === question.answer ? 'match' : 'different', message: answer === question.answer ? 'Matches the practice key.' : 'Does not match the practice key. Review the reasoning.' };
  // Numeric extended responses still require reasoning and rubric review, not automatic full marks.
  if (question.type === 'calculation' && question.numericAnswer) {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(answer.trim())) return { status: 'review', message: 'Compare your working and units with the solution. Numeric checking accepts a number only.' };
    const value = Number(answer);
    const match = Number.isFinite(value) && Math.abs(value - question.numericAnswer.value) <= Math.max(question.numericAnswer.tolerance, Number.EPSILON * Math.max(1, Math.abs(value)) * 8);
    return { status: match ? 'match' : 'different', message: match ? 'Numeric value matches. Check your method and units against the rubric.' : 'Numeric value differs. Review your method and units.' };
  }
  return { status: 'review', message: 'Self-review required. Compare your reasoning with the solution and marking points.' };
}

const progressSchema = z.object({ version: z.literal(1), bookmarked: z.boolean(),
  answers: z.record(z.string().max(20000)), reviewed: z.array(z.string()).max(1000), updatedAt: z.string().datetime() }).strict();
export const emptyFoundationProgress = () => ({ version: 1, bookmarked: false, answers: {}, reviewed: [], updatedAt: new Date().toISOString() });
export const foundationProgressKey = (owner, entry) => `vertex_foundation:${encodeURIComponent(owner)}:${entry.id}:${entry.contentHash}`;
export function readFoundationProgress(storage, key) {
  try {
    const raw = storage.getItem(key);
    return { raw, value: raw === null ? emptyFoundationProgress() : progressSchema.parse(JSON.parse(raw)), error: null };
  } catch {
    return { raw: null, value: emptyFoundationProgress(), error: 'Saved work could not be read. Existing device data has been preserved. Saving is blocked; export your current answers before leaving.' };
  }
}
export function saveFoundationProgress(storage, key, value, expectedRaw) {
  const parsed = progressSchema.parse(value);
  if (!storage) throw new Error('Device storage is unavailable. Your answers remain on this page; export them before leaving.');
  if (storage.getItem(key) !== expectedRaw) throw new Error('Saved work changed in another tab. Export your answers, then reload before saving.');
  const raw = JSON.stringify(parsed);
  try { storage.setItem(key, raw); }
  catch { throw new Error('Answers were not saved. Device storage may be full or unavailable. Export your answers before leaving.'); }
  return raw;
}
