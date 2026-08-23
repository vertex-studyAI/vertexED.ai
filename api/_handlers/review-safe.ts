import { OpenAI } from 'openai';
import { describeReviewImages, ReviewImageProcessingError } from '../_lib/reviewVision.js';

export const config = {
  maxDuration: 60,
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { verifyAuthUser, rejectOversizedJsonBody } = await import('../_lib/auth.js');
  const { rateLimitUserEndpoint } = await import('../_lib/rateLimit.js');
  const { validateReviewImages } = await import('../_lib/security.js');

  const user = await verifyAuthUser(req, res);
  if (!user) return;
  if (rejectOversizedJsonBody(req, res, 6 * 1024 * 1024)) return;
  if (!(await rateLimitUserEndpoint(user.id, 'review', res))) return;

  const apiKey = process.env.OPENAI_API_KEY || process.env.ChatbotKey;
  if (!apiKey) {
    console.error('[review-safe] OpenAI API key is not configured');
    res.status(500).json({ error: 'Server configuration error: No API key set' });
    return;
  }

  try {
    const { input_as_text, prompt, questionImages, answerImages } = req.body ?? {};
    let combinedInput = String(input_as_text || prompt || '').trim();

    const questionCheck = validateReviewImages(questionImages);
    if (!questionCheck.ok) {
      return res.status(400).json({ error: questionCheck.error });
    }

    const answerCheck = validateReviewImages(answerImages);
    if (!answerCheck.ok) {
      return res.status(400).json({ error: answerCheck.error });
    }

    const hasQuestionImages = questionCheck.images.length > 0;
    const hasAnswerImages = answerCheck.images.length > 0;
    const allImages = [...questionCheck.images, ...answerCheck.images];

    if (!combinedInput && allImages.length === 0) {
      return res.status(400).json({ error: 'No input provided' });
    }

    if (hasQuestionImages) {
      combinedInput += `\n\n[User has attached ${questionCheck.images.length} image(s) for the QUESTION]`;
    }
    if (hasAnswerImages) {
      combinedInput += `\n\n[User has attached ${answerCheck.images.length} image(s) for the ANSWER]`;
    }

    if (allImages.length > 0) {
      try {
        const client = new OpenAI({ apiKey });
        const imageDescription = await describeReviewImages(client, allImages);
        combinedInput += `\n\n[Image Context]: ${imageDescription}`;
      } catch (error) {
        if (error instanceof ReviewImageProcessingError) {
          console.error('[review-safe] Attached image preprocessing failed');
          return res.status(502).json({
            error: 'We could not process the attached images. Please try again.',
            retryable: true,
          });
        }
        throw error;
      }
    }

    // The generated grading workflow is reused unchanged, but receives only
    // successfully extracted image evidence. Passing an empty image list here
    // prevents the old best-effort vision branch from silently grading without
    // image context.
    const { runWorkflow } = await import('./review.ts');
    const result = await runWorkflow({ input_as_text: combinedInput, images: [] });

    const { normalizeReviewResponse } = await import('../_lib/reviewResponse.js');
    const normalized = normalizeReviewResponse(result);
    res.status(200).json(normalized);
  } catch (error) {
    console.error('[review-safe] Review workflow failed');
    res.status(500).json({ error: 'Workflow execution failed' });
  }
}
