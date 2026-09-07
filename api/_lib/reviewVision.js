import { logProviderRun } from './providerTelemetry.js';

export class ReviewImageProcessingError extends Error {
  constructor(message = 'Attached image preprocessing failed.', options = {}) {
    super(message, options);
    this.name = 'ReviewImageProcessingError';
    this.code = 'REVIEW_IMAGE_PREPROCESSING_FAILED';
    this.retryable = true;
  }
}

/**
 * Convert already-validated review images into textual evidence for the grading
 * workflow. Image-dependent grading must fail closed if this step cannot
 * produce usable evidence.
 */
export async function describeReviewImages(client, images, contentRole = 'submitted material') {
  if (!Array.isArray(images) || images.length === 0) return '';

  let response;
  const startedAt = Date.now();
  try {
    response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Transcribe and describe only the ${contentRole} shown in these images. Preserve wording, symbols, equations, labels, and line order as exactly as possible. Do not solve, grade, correct, or add content.`,
          },
          ...images.map((image) => ({
            type: 'image_url',
            image_url: { url: image },
          })),
        ],
      }],
    });
    await logProviderRun({
      capability: 'answer_review_vision',
      provider: 'openai',
      model: 'gpt-4o',
      status: 200,
      durationMs: Date.now() - startedAt,
    });
  } catch (cause) {
    await logProviderRun({
      capability: 'answer_review_vision',
      provider: 'openai',
      model: 'gpt-4o',
      durationMs: Date.now() - startedAt,
      error: true,
    });
    throw new ReviewImageProcessingError(undefined, { cause });
  }

  const description = response?.choices?.[0]?.message?.content;
  if (typeof description !== 'string' || !description.trim()) {
    throw new ReviewImageProcessingError('Attached images produced no usable evidence.');
  }

  return description.trim();
}
