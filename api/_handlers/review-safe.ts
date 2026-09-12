import { OpenAI } from 'openai';
import { describeReviewImages, ReviewImageProcessingError } from '../_lib/reviewVision.js';
import {
  buildAnswerReviewPrompt,
  createAnswerReviewResult,
  extractAnswerReviewGrade,
  normalizeAnswerReviewInput,
} from '../_lib/answerReview.js';
import { logProviderRun } from '../_lib/providerTelemetry.js';
import { fetchWithTimeout } from '../_lib/fetchWithTimeout.js';

export const config = { maxDuration: 60, runtime: 'nodejs' };

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.ChatbotKey || process.env.CHATBOT_KEY;
}

function getReviewModel() {
  return process.env.OPENAI_REVIEW_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

async function requestStructuredReview(apiKey: string, prompt: string) {
  const model = getReviewModel();
  const startedAt = Date.now();
  let response: Response;
  try {
    response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2400,
        response_format: { type: 'json_object' },
      }),
    }, 30_000);
    await logProviderRun({ capability: 'answer_review', provider: 'openai', model, status: response.status, durationMs: Date.now() - startedAt });
  } catch (error) {
    await logProviderRun({ capability: 'answer_review', provider: 'openai', model, durationMs: Date.now() - startedAt, error: true });
    throw error;
  }
  if (!response.ok) throw new Error(`Review provider returned ${response.status}.`);
  const payload = await response.json();
  const raw = payload?.choices?.[0]?.message?.content;
  const grade = extractAnswerReviewGrade(raw);
  if (!grade) throw new Error('Review provider returned an invalid structured result.');
  return { grade, model };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { verifyAuthUser, rejectOversizedJsonBody } = await import('../_lib/auth.js');
  const { rateLimitUserEndpoint } = await import('../_lib/rateLimit.js');
  const { MAX_REVIEW_IMAGES, validateReviewImages } = await import('../_lib/security.js');

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (rejectOversizedJsonBody(req, res, 6 * 1024 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'review', res))) return;

  const body = req.body ?? {};
  const questionCheck = validateReviewImages(body.questionImages);
  if (!questionCheck.ok) return res.status(400).json({ error: questionCheck.error });
  const answerCheck = validateReviewImages(body.answerImages);
  if (!answerCheck.ok) return res.status(400).json({ error: answerCheck.error });
  if (questionCheck.images.length + answerCheck.images.length > MAX_REVIEW_IMAGES) {
    return res.status(400).json({ error: `Too many images (max ${MAX_REVIEW_IMAGES} across question and answer).` });
  }

  const hasQuestion = typeof body.question === 'string' && body.question.trim();
  const hasAnswer = typeof body.answer === 'string' && body.answer.trim();
  if (!hasQuestion && questionCheck.images.length === 0) {
    return res.status(400).json({ error: 'Add the question as text or an image.' });
  }
  if (!hasAnswer && answerCheck.images.length === 0) {
    return res.status(400).json({ error: 'Add the student answer as text or an image.' });
  }

  const apiKey = getApiKey();
  if (!apiKey && (questionCheck.images.length || answerCheck.images.length)) {
    return res.status(503).json({
      error: 'Image review is temporarily unavailable. Type the question and answer to continue.',
      retryable: true,
    });
  }

  try {
    let extractedQuestion = '';
    let extractedAnswer = '';
    if (apiKey && (questionCheck.images.length || answerCheck.images.length)) {
      const client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 0 });
      try {
        [extractedQuestion, extractedAnswer] = await Promise.all([
          describeReviewImages(client, questionCheck.images, 'question'),
          describeReviewImages(client, answerCheck.images, 'student answer'),
        ]);
      } catch (error) {
        if (error instanceof ReviewImageProcessingError) {
          console.error('[review-safe] Attached image preprocessing failed');
          return res.status(502).json({
            error: 'We could not read the attached images reliably. Retake the photo or type the content and try again.',
            retryable: true,
          });
        }
        throw error;
      }
    }

    const input = normalizeAnswerReviewInput(body, { question: extractedQuestion, answer: extractedAnswer });
    if (!apiKey) return res.status(200).json(createAnswerReviewResult({ input, degraded: true }));

    try {
      const provider = await requestStructuredReview(apiKey, buildAnswerReviewPrompt(input));
      return res.status(200).json(createAnswerReviewResult({
        input, rawGrade: provider.grade, model: provider.model, degraded: false,
      }));
    } catch {
      console.error('[review-safe] Structured review provider failed');
      return res.status(200).json(createAnswerReviewResult({
        input, model: getReviewModel() || 'unavailable', degraded: true,
      }));
    }
  } catch {
    console.error('[review-safe] Review failed');
    return res.status(500).json({ error: 'Review could not be completed. Please try again.' });
  }
}
