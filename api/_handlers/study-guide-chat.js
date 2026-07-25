import { verifyAuthUser, readJsonBody, rejectOversizedJsonBody } from '../_lib/auth.js';
import { rateLimitUserEndpoint } from '../_lib/rateLimit.js';
import { retrieveStudyGuideContext } from '../_lib/studyGuideRetrieval.js';

const MAX_QUESTION_CHARS = 2000;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (rejectOversizedJsonBody(req, res, 64 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'study-guide-chat', res))) return;

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Study guide AI is not configured. Add GEMINI_API_KEY to .env.local and restart the development server.' });

  const { question, history, context } = readJsonBody(req) ?? {};
  if (typeof question !== 'string' || !question.trim()) return res.status(400).json({ error: 'Ask a question first.' });
  if (question.length > MAX_QUESTION_CHARS) return res.status(400).json({ error: `Question too long (max ${MAX_QUESTION_CHARS} characters).` });

  try {
    const currentGuidePath = typeof context?.guidePath === 'string' ? context.guidePath : undefined;
    const passages = await retrieveStudyGuideContext(question, { currentGuidePath });
    const sourceText = passages.length
      ? passages.map((source, index) => `[${index + 1}] ${source.label} (${source.path})\n${source.text}`).join('\n\n')
      : 'No directly matching guide passage was found.';
    const recentHistory = Array.isArray(history) ? history.slice(-4).map((entry) => `${entry?.role === 'assistant' ? 'Tutor' : 'Student'}: ${String(entry?.text ?? '').slice(0, 600)}`).join('\n') : '';
    const prompt = `Use only the retrieved MYP study-guide passages below for factual claims. If they do not answer the question, say so plainly. Be concise, explain exam technique when relevant, and cite sources inline as [Subject - title].\n\nRETRIEVED PASSAGES:\n${sourceText}\n\nRECENT CONVERSATION:\n${recentHistory || '(none)'}\n\nSTUDENT QUESTION: ${question.trim()}`;
    // Flash Lite keeps retrieval-grounded guide answers economical. The former
    // 2.5 Lite model is no longer enabled for newly created Gemini projects.
    const model = process.env.GEMINI_STUDY_GUIDE_MODEL || 'gemini-3.1-flash-lite';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'You are VertexED\'s MYP study-guide tutor. Do not invent guide content or claim to have read passages not provided.' }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Gemini study guide error:', response.status, data?.error?.message);
      return res.status(502).json({ error: 'Study guide AI request failed. Please try again shortly.' });
    }
    const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!answer) return res.status(502).json({ error: 'Study guide AI returned no answer.' });
    return res.status(200).json({ answer, sources: passages.map(({ label, path }) => ({ label, path })) });
  } catch (error) {
    console.error('study-guide-chat error:', error);
    return res.status(500).json({ error: 'Could not search the study guides.' });
  }
}
