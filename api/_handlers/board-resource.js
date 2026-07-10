import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';

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
  if (!rateLimitUserEndpoint(user.id, 'board-resource', res)) return;

  const OPENAI_API_KEY =
    process.env.OPENAI_API_KEY || process.env.ChatbotKey || process.env.CHATBOT_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'AI not configured' });
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

    const prompt = `Write a comprehensive ${boardLabel} study resource: "${title}" (${subject}).

CONTEXT: ${description}
${grade ? `Grade/year: ${grade}` : ''}
Board features: ${features.join('; ') || 'standard exam format'}
Command terms to explain and use: ${commandTerms.join(', ') || 'standard'}

REQUIREMENTS:
- Minimum ${targetWords} words of substantive educational content (not filler)
- Use markdown: ## and ### headings, bullet lists, tables where helpful
- Include: (1) what the board expects, (2) topic breakdown, (3) mark-scheme thinking, (4) common mistakes, (5) revision schedule, (6) practice strategy with VertexED tools mentioned naturally (mock papers, answer review, flashcards)
- Board-specific terminology (${boardLabel} paper structure, criteria, units)
- Original paraphrased explanations — do not copy copyrighted textbook text
- End with "Quick wins this week" — 5 actionable bullets
- Tone: direct, student-friendly, exam-focused`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.BOARD_RESOURCE_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are VertexED's curriculum author. Write original, in-depth ${boardLabel} study guides that help students earn marks. Never plagiarize — synthesize exam technique from first principles.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.45,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      console.error('Board resource generation failed:', response.status);
      return res.status(502).json({ error: 'Generation failed. Try again shortly.' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() ?? '';

    if (!content || countWords(content) < 400) {
      return res.status(502).json({ error: 'Guide too short — retry.' });
    }

    return res.status(200).json({
      content,
      wordCount: countWords(content),
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Board resource error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
