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
export async function describeReviewImages(client, images) {
  if (!Array.isArray(images) || images.length === 0) return '';

  let response;
  try {
    response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze these images and provide a detailed description of their content, especially any text, diagrams, or questions present, to be used as context.',
          },
          ...images.map((image) => ({
            type: 'image_url',
            image_url: { url: image },
          })),
        ],
      }],
    });
  } catch (cause) {
    throw new ReviewImageProcessingError(undefined, { cause });
  }

  const description = response?.choices?.[0]?.message?.content;
  if (typeof description !== 'string' || !description.trim()) {
    throw new ReviewImageProcessingError('Attached images produced no usable evidence.');
  }

  return description.trim();
}
