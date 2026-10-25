import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import {
  formatSourcesForPrompt,
  NOTEBOOK_OUTPUT_MODES,
  validateSourceCitations,
  validateStructuredSourceIds,
  prepareSourceContext,
} from '../_lib/grounding.js';
import { fetchProvider } from '../_lib/providerRequest.js';
import { routeAiRequest } from '../_lib/aiRouting.js';
import { validateNotebookOutput, lessonMarkdown } from '../../contracts/learningOutputs.js';
import { validCurriculumPath, notebookRequestKey, STUDY_SET_VERSION } from '../../contracts/notebookStudySet.js';
import { VERTEX_AGENTS } from '../_lib/vertexAgents.js';
import { extractGeneratedText } from '../_lib/aiProviders.js';

const ALLOWED_MODES = new Set(Object.keys(NOTEBOOK_OUTPUT_MODES));

function getOpenAiKey() {
  return process.env.ChatbotKey || process.env.OPENAI_API_KEY || process.env.CHATBOT_KEY;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res, 512 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'notebook', res))) return;

  const OPENAI_API_KEY = getOpenAiKey();
  if (!OPENAI_API_KEY) {
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
    const curriculum = body?.curriculum ?? null;
    if (curriculum !== null && !validCurriculumPath(curriculum)) {
      return res.status(400).json({ error: 'Provide the curriculum, board, syllabus version, subject and topic.' });
    }

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
${curriculum ? `COURSE CONTEXT (student supplied, unverified): ${JSON.stringify(curriculum)}` : ''}
${customPrompt ? `STUDENT INSTRUCTIONS: ${customPrompt}` : ''}

SOURCES:
${sourceBlock}`;

    const route = routeAiRequest({ capability: 'notebook', text: customPrompt, defaultModel: process.env.NOTEBOOK_MODEL || 'gpt-6-luna', maxTokens: spec.lesson ? 4000 : spec.json ? 2000 : 2500 });
    const model = route.model;
    const generation = { version: STUDY_SET_VERSION, model, factualStatus: 'unreviewed', curriculum,
      requestKey: await notebookRequestKey({ mode, sources, notebookTitle: body?.notebookTitle ?? '', customPrompt: body?.customPrompt ?? '', curriculum }) };
    const response = await fetchProvider({
      capability: 'notebook', provider: 'openai', model,
      url: 'https://api.openai.com/v1/chat/completions',
      options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              VERTEX_AGENTS.notebookResearcher.instructions,
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: route.maxTokens,
        ...(spec.json ? { response_format: { type: 'json_object' } } : {}),
      }),
      },
    });

    if (!response.ok) {
      console.error('Notebook generation failed:', response.status);
      return res.status(502).json({ error: 'Generation failed. Try again shortly.' });
    }

    const data = await response.json();
    const raw = extractGeneratedText(data);

    if (!raw) {
      return res.status(502).json({ error: 'AI could not complete this study material. Your sources are unchanged. Try a smaller selection or a different request.' });
    }

    if (spec.json) {
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        return res.status(502).json({ error: 'Generated material was incomplete or invalid. Your sources are unchanged; please retry.' });
      }

      const validated = validateNotebookOutput(mode, parsed);
      if (!validated.success) return res.status(502).json({ error: 'Generated material was incomplete or invalid. Your sources are unchanged; please retry.' });
      parsed = validated.data;

      const structuredSourceIds = spec.lesson
        ? [...parsed.sections, ...parsed.workedExamples, ...parsed.misconceptions].flatMap(item => item.sourceIds)
        : spec.quiz
        ? parsed.questions.flatMap((question) => question.sourceIds)
        : spec.flashcards
          ? parsed.flashcards.flatMap((card) => card.sourceIds)
          : [];
      const grounding = spec.lesson || spec.quiz || spec.flashcards
        ? validateStructuredSourceIds(structuredSourceIds, sources)
        : null;
      if (grounding && grounding.status !== 'verified') {
        return res.status(502).json({ error: 'Generated material contained unverifiable source references. Your sources are unchanged; please retry.' });
      }

      if (spec.lesson) {
        const content = lessonMarkdown(parsed);
        if (validateSourceCitations(content, sources).status !== 'verified') {
          return res.status(502).json({ error: 'Generated notes contained unverifiable inline references. Your sources are unchanged; please retry.' });
        }
        return res.status(200).json({ mode, title: parsed.title, content,
          generatedAt: new Date().toISOString(), generation, citations: grounding.citations, sources: grounding.sources });
      }

      if (spec.questions) {
        const questions = (parsed.questions || [])
          .map((q) => String(q).trim())
          .filter(Boolean)
          .slice(0, 15);
        const content = questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
        return res.status(200).json({
          mode,
          generation,
          title: spec.label,
          content,
          suggestedQuestions: questions,
          generatedAt: new Date().toISOString(),
          sources: prepareSourceContext(sources).sources.map(({ id, title }) => ({ id, title })),
        });
      }

      if (spec.quiz) {
        // The contract already bounds these fields. Cutting them again can
        // remove a condition or make a correct MCQ answer differ from its option.
        const questions = parsed.questions.map((q, i) => ({
          ...q,
          id: `q-${i}`,
        }));

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
          generation,
          title: spec.label,
          content,
          quiz: questions,
          generatedAt: new Date().toISOString(),
          citations: grounding?.citations,
          sources: grounding?.sources,
        });
      }

      const flashcards = parsed.flashcards;

      const markdown = flashcards
        .map((c, i) => `### Card ${i + 1}\n**Q:** ${c.front}\n**A:** ${c.back}`)
        .join('\n\n');

      return res.status(200).json({
        mode,
        generation,
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
      generation,
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
