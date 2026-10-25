/** Shared private-resource metadata. A course label is not verified alignment. */
export const STUDY_SET_VERSION = 'notebook-study-set-v1';
export const STUDY_SET_STEPS = ['lesson', 'flashcards', 'quiz', 'study-guide'];
export const STUDY_CURRICULA = ['IB_MYP', 'IB_DP', 'AP', 'GCSE', 'IGCSE', 'A_LEVELS', 'SAT', 'UNIVERSITY', 'CBSE', 'ICSE', 'OTHER'];
export const CURRICULUM_FIELDS = ['curriculum', 'board', 'syllabusVersion', 'subject', 'unit', 'topic', 'subtopic'];

export function validCurriculumPath(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).every(key => CURRICULUM_FIELDS.includes(key))
    && CURRICULUM_FIELDS.every(key => typeof value[key] === 'string' && value[key].length <= 160)
    && STUDY_CURRICULA.includes(value.curriculum)
    && ['board', 'syllabusVersion', 'subject', 'topic'].every(key => value[key].trim().length > 0);
}

export async function notebookRequestKey(request) {
  const canonical = JSON.stringify({ version: STUDY_SET_VERSION, mode: request.mode,
    title: request.notebookTitle ?? '', prompt: request.customPrompt ?? '', curriculum: request.curriculum ?? null,
    sources: request.sources.map(source => ({ id: source?.id, title: source?.title, excerpt: source?.excerpt ?? source?.content })) });
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return `sha256:${Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function validGenerationRecord(value) {
  return value !== null && typeof value === 'object' && value.version === STUDY_SET_VERSION
    && /^sha256:[a-f0-9]{64}$/.test(value.requestKey)
    && value.factualStatus === 'unreviewed' && typeof value.model === 'string' && value.model.length > 0 && value.model.length <= 160
    && (value.curriculum === null || validCurriculumPath(value.curriculum));
}

/** Sequential, checkpointed work. No hidden retries or requests after cancellation. */
export async function runNotebookStudySet({ request, findSaved, generate, save, onStep, isCurrent }) {
  const completed = [];
  for (const mode of STUDY_SET_STEPS) {
    if (!isCurrent()) return { status: 'paused', completed };
    const next = { ...request, mode };
    const requestKey = await notebookRequestKey(next);
    if (!isCurrent()) return { status: 'paused', completed };
    const cached = findSaved(requestKey);
    if (cached) { completed.push(mode); onStep(mode, 'reused'); continue; }
    onStep(mode, 'generating');
    const result = await generate(next);
    if (!isCurrent()) return { status: 'paused', completed };
    if (result.mode !== mode || !validGenerationRecord(result.generation) || result.generation.requestKey !== requestKey) {
      throw new Error('The generated resource does not match this request. Your saved work is unchanged.');
    }
    await save(result);
    completed.push(mode);
    onStep(mode, 'saved');
  }
  return { status: 'complete', completed };
}
