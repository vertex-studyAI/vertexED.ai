import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import {
  formatSourcesForPrompt,
  NOTEBOOK_OUTPUT_MODES,
  validateSourceCitations,
  validateStructuredSourceIds,
} from '../_lib/grounding.js';
import { fetchProvider } from '../_lib/providerRequest.js';
import { routeAiRequest } from '../_lib/aiRouting.js';
import { validateNotebookOutput } from '../../contracts/learningOutputs.js';
import { callChatProvider, createSafetyIdentifier, DEFAULT_OPENAI_PRIMARY_MODEL, extractChatAnswer, resolveOpenAiConfig } from '../_lib/aiProviders.js';
import { VERTEX_AGENTS } from '../_lib/vertexAgents.js';

const ALLOWED_MODES = new Set(Object.keys(NOTEBOOK_OUTPUT_MODES));

const NOTEBOOK_SCHEMAS = {
  'suggested-questions': {
    type: 'object', properties: { questions: { type: 'array', minItems: 1, maxItems: 15, items: { type: 'string' } } },
    required: ['questions'], additionalProperties: false,
  },
  quiz: {
    type: 'object', properties: { questions: { type: 'array', minItems: 1, maxItems: 12, items: {
      type: 'object',
      properties: {
        question: { type: 'string' }, type: { enum: ['mcq', 'short'] }, options: { type: 'array', items: { type: 'string' } },
        answer: { type: 'string' }, explanation: { type: 'string' }, marks: { type: 'integer' }, sourceIds: { type: 'array', minItems: 1, items: { type: 'string' } },
      },
      required: ['question', 'type', 'options', 'answer', 'explanation', 'marks', 'sourceIds'], additionalProperties: false,
    } } }, required: ['questions'], additionalProperties: false,
  },
  flashcards: {
    type: 'object', properties: { flashcards: { type: 'array', minItems: 1, maxItems: 20, items: {
      type: 'object',
      properties: { front: { type: 'string' }, back: { type: 'string' }, sourceIds: { type: 'array', minItems: 1, items: { type: 'string' } } },
      required: ['front', 'back', 'sourceIds'], additionalProperties: false,
    } } }, required: ['flashcards'], additionalProperties: false,
  },
};

function schemaForNotebookMode(mode) {
  if (mode === 'suggested-questions') return NOTEBOOK_SCHEMAS['suggested-questions'];
  if (mode === 'quiz') return NOTEBOOK_SCHEMAS.quiz;
  return NOTEBOOK_SCHEMAS.flashcards;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res, 512 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'notebook', res))) return;

  let openAiConfig;
  try {
    openAiConfig = resolveOpenAiConfig(process.env);
  } catch {
    return res.status(503).json({ error: 'AI not configured' });
  }

  try {
    const body = readJsonBody(req);
    const mode = typeof body?.mode === 'string' ? body.mode.trim() : '';
    const sources = Array.isArray(body?.sources) ? body.sources : [];
    const notebookTitle =
      typeof body?.notebookTitle === 'string' ? body.notebookTitle.trim().slice(0, 120) : 'Study Notebook';
    const customPrompt =
      typeof body?.customPrompt === 'string' ? body.customPrompt.trim().slice(0, 500) : '';

    if (!ALLOWED_MODES.has(mode)) {
      return res.status(400).json({ error: `Invalid mode. Allowed: ${[...ALLOWED_MODES].join(', ')}` });
    }

    const sourceBlock = formatSourcesForPrompt(sources);
    if (!sourceBlock) {
      return res.status(400).json({ error: 'Add at least one source with content before generating.' });
    }

    const spec = NOTEBOOK_OUTPUT_MODES[mode];
    const citationInstruction = spec.json
      ? ''
      : '\nCite factual claims inline as [Source: id], using only exact IDs from SOURCE headers.';
    const userPrompt = `${spec.instruction}${citationInstruction}

NOTEBOOK: ${notebookTitle}
${customPrompt ? `STUDENT INSTRUCTIONS: ${customPrompt}` : ''}

SOURCES:
${sourceBlock}`;

    const route = routeAiRequest({ capability: 'notebook', text: customPrompt, defaultModel: process.env.NOTEBOOK_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_PRIMARY_MODEL, maxTokens: spec.json ? 2000 : 2500 });
    const model = route.model;
    const result = await callChatProvider({
      config: openAiConfig,
      model,
      messages: [
        { role: 'system', content: VERTEX_AGENTS.notebookResearcher.instructions },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.35,
      maxTokens: route.maxTokens,
      safetyIdentifier: createSafetyIdentifier(user.id),
      capability: 'notebook',
      ...(spec.json ? { jsonSchema: schemaForNotebookMode(mode), schemaName: `vertexed_notebook_${mode}` } : {}),
      fetchImpl: (url, options) => fetchProvider({ capability: 'notebook', provider: 'openai', model, url, options }),
    });

    if (!result.response.ok) {
      console.error('Notebook generation failed:', result.response.status);
      return res.status(502).json({ error: 'Generation failed. Try again shortly.' });
    }

    const raw = extractChatAnswer(JSON.parse(result.raw)) ?? '';

    if (!raw) {
      return res.status(502).json({ error: 'AI returned empty output.' });
    }

    if (spec.json) {
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}') + 1;
        if (start >= 0 && end > start) parsed = JSON.parse(raw.slice(start, end));
      }

      const validated = validateNotebookOutput(mode, parsed);
      if (!validated.success) return res.status(502).json({ error: 'Generated material was incomplete or invalid. Your sources are unchanged; please retry.' });
      parsed = validated.data;

      const structuredSourceIds = spec.quiz
        ? parsed.questions.flatMap((question) => question.sourceIds)
        : spec.flashcards
          ? parsed.flashcards.flatMap((card) => card.sourceIds)
          : [];
      const grounding = spec.quiz || spec.flashcards
        ? validateStructuredSourceIds(structuredSourceIds, sources)
        : null;
      if (grounding && grounding.status !== 'verified') {
        return res.status(502).json({ error: 'Generated material contained unverifiable source references. Your sources are unchanged; please retry.' });
      }

      if (spec.questions) {
        const questions = (parsed.questions || [])
          .map((q) => String(q).trim())
          .filter(Boolean)
          .slice(0, 15);
        const content = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
        return res.status(200).json({
          mode,
          title: spec.label,
          content,
          suggestedQuestions: questions,
          generatedAt: new Date().toISOString(),
        });
      }

      if (spec.quiz) {
        const questions = (parsed.questions || []).slice(0, 12).map((q, i) => ({
          question: String(q.question || '').trim().slice(0, 500),
          type: q.type === 'mcq' ? 'mcq' : 'short',
          options: Array.isArray(q.options) ? q.options.map((o) => String(o).slice(0, 200)).slice(0, 6) : [],
          answer: String(q.answer || '').trim().slice(0, 300),
          explanation: String(q.explanation || '').trim().slice(0, 500),
          marks: typeof q.marks === 'number' ? q.marks : 1,
          sourceIds: q.sourceIds,
          id: `q-${i}`,
        })).filter((q) => q.question);

        const content = questions
          .map(
            (q, i) =>
              `### Q${i + 1} (${q.marks} mark${q.marks === 1 ? '' : 's'})\n${q.question}${
                q.type === 'mcq' && q.options.length
                  ? `\n${q.options.map((o, j) => `- ${String.fromCharCode(65 + j)}) ${o}`).join('\n')}`
                  : ''
              }\n\n**Answer:** ${q.answer}\n*${q.explanation}*`,
          )
          .join('\n\n');

        return res.status(200).json({
          mode,
          title: spec.label,
          content,
          quiz: questions,
          generatedAt: new Date().toISOString(),
          citations: grounding?.citations,
          sources: grounding?.sources,
        });
      }

      const flashcards = (parsed.flashcards || [])
        .filter((c) => c?.front && c?.back)
        .slice(0, 20)
        .map((c) => ({
          front: String(c.front).trim().slice(0, 300),
          back: String(c.back).trim().slice(0, 500),
          sourceIds: c.sourceIds,
        }));

      const markdown = flashcards
        .map((c, i) => `### Card ${i + 1}\n**Q:** ${c.front}\n**A:** ${c.back}`)
        .join('\n\n');

      return res.status(200).json({
        mode,
        title: spec.label,
        content: markdown,
        flashcards,
        generatedAt: new Date().toISOString(),
        citations: grounding?.citations,
        sources: grounding?.sources,
      });
    }

    const grounding = validateSourceCitations(raw, sources);
    if (grounding.status !== 'verified') {
      return res.status(502).json({ error: 'Generated material contained missing or unverifiable source references. Your sources are unchanged; please retry.' });
    }

    const isAudio =
      mode === 'audio-script' ||
      mode === 'audio-brief' ||
      mode === 'audio-critique' ||
      mode === 'audio-debate';

    return res.status(200).json({
      mode,
      title: spec.label,
      content: raw,
      isAudioScript: isAudio,
      generatedAt: new Date().toISOString(),
      citations: grounding.citations,
      sources: grounding.sources,
    });
  } catch (err) {
    console.error('Notebook handler error:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
