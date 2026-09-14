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
import { routeAiRequest } from '../_lib/aiRouting.js';
import { callChatProvider, createSafetyIdentifier, DEFAULT_OPENAI_PRIMARY_MODEL, extractChatAnswer, resolveOpenAiConfig } from '../_lib/aiProviders.js';
import { VERTEX_AGENTS } from '../_lib/vertexAgents.js';

export const config = { maxDuration: 60, runtime: 'nodejs' };

function getApiKey() {
  return process.env.OPENAI_API_KEY || process.env.ChatbotKey || process.env.CHATBOT_KEY;
}

function getReviewModel() {
  return process.env.OPENAI_REVIEW_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_PRIMARY_MODEL;
}

const REVIEW_SCHEMA = {
  type: 'object', properties: { grade: {
    type: 'object', properties: {
      id: { type: 'string' }, score: { type: 'number' }, maxScore: { type: 'number' }, feedback: { type: 'string' }, includes: { type: 'string' }, confidence: { type: 'number' },
      criteria: { type: 'array', items: {
        type: 'object', properties: {
          id: { type: 'string' }, label: { type: 'string' }, score: { type: 'number' }, maxScore: { type: 'number' },
          feedback: { type: 'string' }, evidenceQuotes: { type: 'array', items: { type: 'string' } },
        }, required: ['id', 'label', 'score', 'maxScore', 'feedback', 'evidenceQuotes'], additionalProperties: false,
      } },
      errorCodes: { type: 'array', items: { type: 'string' } },
    }, required: ['id', 'score', 'maxScore', 'feedback', 'includes', 'confidence', 'criteria', 'errorCodes'], additionalProperties: false,
  } }, required: ['grade'], additionalProperties: false,
};

async function requestStructuredReview(config: any, prompt: string, userId: string) {
  const route = routeAiRequest({ capability: 'grading', defaultModel: getReviewModel(), maxTokens: 2400 });
  const model = route.model;
  const startedAt = Date.now();
  let response: Response;
  let raw = '';
  try {
    const result = await callChatProvider({
      config,
      model,
      messages: [
        { role: 'system', content: VERTEX_AGENTS.answerReviewer.instructions },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      maxTokens: route.maxTokens,
      safetyIdentifier: createSafetyIdentifier(userId),
      capability: 'answer-review',
      jsonSchema: REVIEW_SCHEMA,
      schemaName: 'vertexed_answer_review',
      fetchImpl: (url: string, options: any) => fetchWithTimeout(url, options, 30_000),
    });
    response = result.response;
    raw = result.raw;
    await logProviderRun({ capability: 'answer_review', provider: 'openai', model, status: response.status, durationMs: Date.now() - startedAt });
  } catch (error) {
    await logProviderRun({ capability: 'answer_review', provider: 'openai', model, durationMs: Date.now() - startedAt, error: true });
    throw error;
  }
  if (!response.ok) throw new Error(`Review provider returned ${response.status}.`);
  const answer = extractChatAnswer(JSON.parse(raw));
  const grade = extractAnswerReviewGrade(answer);
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
  let openAiConfig: any = null;
  try { openAiConfig = resolveOpenAiConfig(process.env); } catch { openAiConfig = null; }
  if (!openAiConfig && (questionCheck.images.length || answerCheck.images.length)) {
    return res.status(503).json({
      error: 'Image review is temporarily unavailable. Type the question and answer to continue.',
      retryable: true,
    });
  }

  try {
    let extractedQuestion = '';
    let extractedAnswer = '';
    if (openAiConfig && (questionCheck.images.length || answerCheck.images.length)) {
      const client = new OpenAI({ apiKey, project: openAiConfig.projectId || undefined, organization: openAiConfig.organizationId || undefined, timeout: 30_000, maxRetries: 0 });
      try {
        [extractedQuestion, extractedAnswer] = await Promise.all([
          describeReviewImages(client, questionCheck.images, 'question', createSafetyIdentifier(user.id)),
          describeReviewImages(client, answerCheck.images, 'student answer', createSafetyIdentifier(user.id)),
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
    if (!openAiConfig) return res.status(200).json(createAnswerReviewResult({ input, degraded: true }));

    try {
      const provider = await requestStructuredReview(openAiConfig, buildAnswerReviewPrompt(input), user.id);
      return res.status(200).json(createAnswerReviewResult({
        input, rawGrade: provider.grade, model: provider.model, degraded: false,
      }));
    } catch {
      console.error('[review-safe] Structured review provider failed');
      return res.status(200).json(createAnswerReviewResult({
        input, model: routeAiRequest({ capability: 'grading', defaultModel: getReviewModel(), maxTokens: 2400 }).model, degraded: true,
      }));
    }
  } catch {
    console.error('[review-safe] Review failed');
    return res.status(500).json({ error: 'Review could not be completed. Please try again.' });
  }
}
