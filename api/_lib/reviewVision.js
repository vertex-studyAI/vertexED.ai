import { AiUsageError } from './aiUsagePolicy.js';

/** Image-token accounting has no reviewed conservative bound in the beta
 * policy. Keep the historical helper boundary fail-closed, including direct
 * imports, until image admission is implemented in the shared paid wrapper. */
export async function describeReviewImages(_client, images) {
  if (!Array.isArray(images) || images.length === 0) return '';
  throw new AiUsageError('AI_MODEL_UNSUPPORTED', 503, 'Image review is unavailable under the current AI allowance. Type the question and answer to continue.');
}
