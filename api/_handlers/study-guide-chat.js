import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { retrieveStudyGuideContext } from '../_lib/studyGuideRetrieval.js';
import { fetchProvider } from '../_lib/providerRequest.js';
import { formatSourcesForPrompt, validateSourceCitations } from '../_lib/grounding.js';
import { callChatProvider, extractChatAnswer, resolveChatProvider } from '../_lib/aiProviders.js';

const MAX_QUESTION_CHARS = 2000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (rejectOversizedJsonBody(req, res, 64 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'study-guide-chat', res))) return;

  const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  let openAiConfig = null;
  if (!googleApiKey) {
    try {
      openAiConfig = resolveChatProvider(process.env);
    } catch {
      return res.status(503).json({ error: 'Study guide AI is not configured on the server.' });
    }
  }

  const { question, history, context } = readJsonBody(req) ?? {};
  if (typeof question !== 'string' || !question.trim()) return res.status(400).json({ error: 'Ask a question first.' });
  if (question.length > MAX_QUESTION_CHARS) return res.status(400).json({ error: `Question too long (max ${MAX_QUESTION_CHARS} characters).` });

  try {
    const trimmedQuestion = question.trim();
    const currentGuidePath = typeof context?.guidePath === 'string' ? context.guidePath : undefined;
    const passages = await retrieveStudyGuideContext(trimmedQuestion, { currentGuidePath });
    if (!passages.length) return res.status(200).json({ answer: 'No approved study-guide passage is available for this question yet. Check your teacher or current official syllabus. The guide collection is still undergoing editorial review.', sources: [], generation: { degraded: true, reason: 'no-approved-source' } });
    const groundingSources = passages.map((source, index) => ({
      id: `guide-${index + 1}`,
      title: source.label,
      content: source.text,
      path: source.path,
    }));
    const sourceText = formatSourcesForPrompt(groundingSources, 48_000);
    const historyEntries = Array.isArray(history) ? history.slice(-4) : [];
    const recentHistory = historyEntries
      .filter((entry, index) => {
        const role = entry?.role === 'assistant' ? 'assistant' : 'user';
        const text = String(entry?.text ?? '').trim();
        return !(index === historyEntries.length - 1 && role === 'user' && text === trimmedQuestion);
      })
      .map((entry) => `${entry?.role === 'assistant' ? 'Tutor' : 'Student'}: ${String(entry?.text ?? '').slice(0, 600)}`)
      .join('\n');
    const prompt = `Use only the retrieved MYP study-guide passages below for factual claims. If they do not answer the question, say so plainly. Be concise, explain exam technique when relevant, and cite factual claims inline as [Source: id] using only exact IDs from SOURCE headers.\n\nRETRIEVED PASSAGES:\n${sourceText}\n\nRECENT CONVERSATION:\n${recentHistory || '(none)'}\n\nSTUDENT QUESTION: ${trimmedQuestion}`;
    let response;
    let answer;
    if (googleApiKey) {
      const model = process.env.GEMINI_STUDY_GUIDE_MODEL || 'gemini-3.1-flash-lite';
      response = await fetchProvider({
        capability: 'study_guide_chat', provider: 'google', model,
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        options: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': googleApiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: 'You are VertexED\'s MYP study-guide tutor. Do not invent guide content or claim to have read passages not provided.' }] },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
          }),
        },
      });
      const data = await response.json();
      answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    } else {
      const models = [...new Set([openAiConfig.primaryModel, openAiConfig.fallbackModel].filter(Boolean))];
      for (const model of models) {
        const result = await callChatProvider({
          config: openAiConfig,
          model,
          messages: [
            { role: 'system', content: 'You are VertexED\'s MYP study-guide tutor. Use only supplied passages for factual claims and cite exact source IDs.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.2,
          maxTokens: 700,
        });
        response = result.response;
        if (response.ok) {
          try {
            answer = extractChatAnswer(JSON.parse(result.raw));
          } catch {
            answer = null;
          }
          if (answer) break;
        }
        if (response.status === 401) break;
      }
    }
    if (!response?.ok) {
      console.error('Study guide provider error:', response?.status ?? 'unavailable');
      return res.status(502).json({ error: 'Study guide AI request failed. Please try again shortly.' });
    }
    if (!answer) return res.status(502).json({ error: 'Study guide AI returned no answer.' });
    const grounding = validateSourceCitations(answer, groundingSources);
    if (grounding.status !== 'verified') {
      return res.status(502).json({ error: 'Study guide AI returned missing or unverifiable source references. Please retry.' });
    }
    const citedIds = new Set(grounding.citations.map((citation) => citation.id));
    return res.status(200).json({
      answer,
      citations: grounding.citations,
      sources: groundingSources
        .filter((source) => citedIds.has(source.id))
        .map(({ id, title: label, path, content }) => ({ id, label, path, excerpt: content.slice(0, 320) })),
    });
  } catch (error) {
    console.error('study-guide-chat error:', error instanceof Error ? error.name : 'UnknownError');
    return res.status(500).json({ error: 'Could not search the study guides.' });
  }
}
