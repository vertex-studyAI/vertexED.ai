import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { fetchProvider } from '../_lib/providerRequest.js';
import { routeAiRequest } from '../_lib/aiRouting.js';
import { callChatProvider, createSafetyIdentifier, DEFAULT_OPENAI_PRIMARY_MODEL, extractChatAnswer, resolveOpenAiConfig } from '../_lib/aiProviders.js';
import { VERTEX_AGENTS } from '../_lib/vertexAgents.js';

function countWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean).length;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await verifyAuthUser(req, res);
  if (!user) return;

  if (rejectOversizedJsonBody(req, res, 64 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'board-resource', res))) return;

  let openAiConfig;
  try {
    openAiConfig = resolveOpenAiConfig(process.env);
  } catch {
    return res.status(503).json({ error: 'AI not configured' });
  }

  try {
    const body = readJsonBody(req);
    const boardLabel = typeof body.boardLabel === 'string' ? body.boardLabel.slice(0, 40) : 'Exam Board';
    const title = typeof body.title === 'string' ? body.title.slice(0, 200) : 'Study Guide';
    const subject = typeof body.subject === 'string' ? body.subject.slice(0, 80) : '';
    const description = typeof body.description === 'string' ? body.description.slice(0, 500) : '';
    const targetWords = Math.min(2500, Math.max(1000, Number(body.targetWords) || 1200));
    const commandTerms = Array.isArray(body.commandTerms)
      ? body.commandTerms.slice(0, 20).map((t) => String(t).slice(0, 40))
      : [];
    const features = Array.isArray(body.features)
      ? body.features.slice(0, 8).map((f) => String(f).slice(0, 80))
      : [];
    const grade = body.grade != null ? String(body.grade).slice(0, 4) : null;

    const prompt = `Draft an independent practice guide for a student preparing for ${boardLabel}: "${title}" (${subject}).

CONTEXT: ${description}
${grade ? `Grade/year: ${grade}` : ''}
Board features: ${features.join('; ') || 'standard exam format'}
Command terms to explain and use: ${commandTerms.join(', ') || 'standard'}

REQUIREMENTS:
- Minimum ${targetWords} words of substantive educational content (not filler)
- Use markdown: ## and ### headings, bullet lists, tables where helpful
- Include: (1) a clearly labelled summary of likely assessment demands, (2) topic breakdown, (3) ways to check work against an official mark scheme, (4) common mistakes, (5) revision schedule, (6) practice strategy using mocks, answer review, and flashcards
- Use board-specific terminology only where it is present in the supplied context. Do not invent paper structures, criteria, weightings, grade boundaries, or examiner guidance.
- State near the top that the guide is AI-generated independent practice material and must be checked against the learner's current official specification and teacher guidance.
- Original paraphrased explanations — do not copy copyrighted textbook text
- End with "Quick wins this week" — 5 actionable bullets
- Tone: direct, student-friendly, exam-focused`;

    const route = routeAiRequest({ capability: 'board-resource', text: description, defaultModel: process.env.BOARD_RESOURCE_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_PRIMARY_MODEL, maxTokens: 4000 });
    const model = route.model;
    const result = await callChatProvider({
      config: openAiConfig,
      model,
      messages: [
        {
          role: 'system',
          content: `${VERTEX_AGENTS.boardResourceEditor.instructions} You are not an examiner or an official representative of ${boardLabel}. Use original wording and do not reproduce copyrighted source material.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.45,
      maxTokens: route.maxTokens,
      safetyIdentifier: createSafetyIdentifier(user.id),
      capability: 'board-resource',
      fetchImpl: (url, options) => fetchProvider({ capability: 'board_resource', provider: 'openai', model, url, options }),
    });

    if (!result.response.ok) {
      console.error('Board resource generation failed:', result.response.status);
      return res.status(502).json({ error: 'Generation failed. Try again shortly.' });
    }

    const content = extractChatAnswer(JSON.parse(result.raw)) ?? '';

    if (!content || countWords(content) < 400) {
      return res.status(502).json({ error: 'Guide too short — retry.' });
    }

    return res.status(200).json({
      content,
      wordCount: countWords(content),
      generatedAt: new Date().toISOString(),
      generation: {
        status: 'AI_GENERATED_UNVERIFIED',
        provider: 'openai',
        model,
      },
    });
  } catch (err) {
    console.error('Board resource error:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
