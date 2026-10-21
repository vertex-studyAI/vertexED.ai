import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { requireActiveSubscription } from '../_lib/subscription.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { callWikiTool, listWikiTools } from '../_lib/wikiMcpClient.js';
import { runMcpToolLoop, ToolLoopError } from '../_lib/mcpToolLoop.js';

const MAX_QUESTION_CHARS = 2000;
const MAX_SOURCES = 6;

const SYSTEM_INSTRUCTION = [
  "You are VertexED's MYP study-guide tutor.",
  'The wiki tools are your only source of truth about the MYP guides, papers and command terms —',
  'never answer from prior knowledge about MYP content, and never invent a page, session or mark scheme.',
  'Always call search_wiki before answering a content question; follow up with read_wiki_section when a',
  'search hit points at a table or heading you need in full. If the tools turn up nothing relevant, say so',
  'plainly and suggest what the student could look at instead.',
  'Cite what you used inline as [Subject - Page > Heading]. Be concise, and explain exam technique',
  'when the question is about how to answer rather than what the answer is.',
].join(' ');

/** Pull the wiki pages the model actually read out of its tool calls. */
function collectSources(toolCalls) {
  const sources = [];
  const seen = new Set();

  const add = (entry) => {
    if (!entry?.path) return;
    const key = `${entry.path}#${entry.heading ?? ''}`;
    if (seen.has(key)) return;
    seen.add(key);
    sources.push(entry);
  };

  for (const call of toolCalls) {
    const structured = call.structured;
    if (!structured || call.isError) continue;

    if (Array.isArray(structured.results)) {
      for (const hit of structured.results) {
        add({ label: hit.label, heading: hit.heading, path: `${hit.pagePath}#${hit.anchor}`, url: hit.url });
      }
    }
    if (structured.section) {
      const { label, heading, path, anchor, url } = structured.section;
      add({ label, heading, path: `${path}#${anchor}`, url });
    }
    if (structured.page) {
      const { label, path, url } = structured.page;
      add({ label, path, url });
    }
  }

  return sources.slice(0, MAX_SOURCES);
}

function buildPrompt({ question, history, currentGuidePath }) {
  const recentHistory = Array.isArray(history)
    ? history
        .slice(-4)
        .map((entry) => `${entry?.role === 'assistant' ? 'Tutor' : 'Student'}: ${String(entry?.text ?? '').slice(0, 600)}`)
        .join('\n')
    : '';

  return [
    currentGuidePath ? `The student currently has this guide page open: ${currentGuidePath}` : '',
    recentHistory ? `RECENT CONVERSATION:\n${recentHistory}` : '',
    `STUDENT QUESTION: ${question}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (!(await requireActiveSubscription(user, res))) return;
  if (rejectOversizedJsonBody(req, res, 64 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'study-guide-chat', res))) return;

  // Same key resolution as /api/ask, including the legacy ChatbotKey alias.
  const apiKey = process.env.OPENAI_API_KEY || process.env.ChatbotKey || process.env.CHATBOT_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Study guide AI is not configured. Add OPENAI_API_KEY to .env.local and restart the development server.' });

  const { question, history, context } = readJsonBody(req) ?? {};
  if (typeof question !== 'string' || !question.trim()) return res.status(400).json({ error: 'Ask a question first.' });
  if (question.length > MAX_QUESTION_CHARS) return res.status(400).json({ error: `Question too long (max ${MAX_QUESTION_CHARS} characters).` });

  const currentGuidePath = typeof context?.guidePath === 'string' ? context.guidePath : undefined;

  try {
    const tools = await listWikiTools();
    // A mini model keeps tool-driven guide answers economical; the work here is
    // retrieval and summarising, not reasoning from scratch.
    const model = process.env.OPENAI_STUDY_GUIDE_MODEL || 'gpt-4.1-mini';

    const { answer, toolCalls } = await runMcpToolLoop({
      apiKey,
      model,
      systemInstruction: SYSTEM_INSTRUCTION,
      prompt: buildPrompt({ question: question.trim(), history, currentGuidePath }),
      tools,
      callTool: (name, args) => callWikiTool(name, args, { currentGuidePath }),
    });

    if (!answer) return res.status(502).json({ error: 'Study guide AI returned no answer.' });

    return res.status(200).json({
      answer,
      sources: collectSources(toolCalls),
      // Lets the panel show what the tutor looked up before answering.
      lookups: toolCalls.map(({ name, args }) => ({ name, args })),
    });
  } catch (error) {
    if (error instanceof ToolLoopError) {
      console.error('OpenAI study guide error:', error.status, error.detail);
      return res.status(502).json({ error: 'Study guide AI request failed. Please try again shortly.' });
    }
    console.error('study-guide-chat error:', error);
    return res.status(500).json({ error: 'Could not search the study guides.' });
  }
}
