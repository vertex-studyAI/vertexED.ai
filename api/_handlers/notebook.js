import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { formatSourcesForPrompt, NOTEBOOK_OUTPUT_MODES } from '../_lib/grounding.js';

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
    return res.status(500).json({ error: 'AI not configured' });
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
    const userPrompt = `${spec.instruction}

NOTEBOOK: ${notebookTitle}
${customPrompt ? `STUDENT INSTRUCTIONS: ${customPrompt}` : ''}

SOURCES:
${sourceBlock}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.NOTEBOOK_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Apex, VertexED\'s study intelligence. Generate high-quality, exam-focused study materials grounded strictly in the provided sources. Never fabricate content outside the sources.',
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
        max_tokens: spec.json ? 2000 : 2500,
        ...(spec.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      console.error('Notebook generation failed:', response.status);
      return res.status(502).json({ error: 'Generation failed. Try again shortly.' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? '';

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
        });
      }

      const flashcards = (parsed.flashcards || [])
        .filter((c) => c?.front && c?.back)
        .slice(0, 20)
        .map((c) => ({
          front: String(c.front).trim().slice(0, 300),
          back: String(c.back).trim().slice(0, 500),
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
      });
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
    });
  } catch (err) {
    console.error('Notebook handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
