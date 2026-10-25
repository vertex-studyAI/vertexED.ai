const SHA256 = /^[0-9a-f]{64}$/;
const ID = /^[a-z0-9][a-z0-9-]{2,79}$/;
const CAPABILITIES = new Set(['answer-review', 'chatbot', 'note', 'notebook', 'paper-generator', 'planner', 'quiz']);
const ASSERTIONS = new Set([
  'learner-attestation-does-not-create-measured-mastery',
  'generated-answer-does-not-create-measured-mastery',
  'unverified-source-does-not-publish',
]);

export function promoteFeedbackReview(review) {
  if (!review || typeof review !== 'object' || Array.isArray(review)) throw new Error('Review must be an object.');
  if (review.contractVersion !== 'vertexed.feedback-review.v1' || !ID.test(review.id || '') || !CAPABILITIES.has(review.capability)) throw new Error('Unsupported feedback review identity.');
  if (!SHA256.test(review.sourceFeedbackDigest || '')) throw new Error('Feedback identity must be a one-way SHA-256 digest.');
  const privacy = review.privacy;
  if (!privacy || privacy.explicitConsentForEval !== true || privacy.deidentifiedByReviewer !== true || privacy.containsUserContent !== false || privacy.freeTextIncluded !== false) throw new Error('Explicit de-identification and evaluation consent are required.');
  if (privacy.reviewerRole !== 'product-safety-reviewer' || !Number.isFinite(Date.parse(privacy.reviewedAt))) throw new Error('A bounded reviewer receipt is required.');

  const regression = review.regression;
  if (!regression || !ID.test(regression.inputClass || '') || !ASSERTIONS.has(regression.assertion)) throw new Error('Unsupported regression contract.');
  if (regression.before?.expected !== 'rejected' || regression.before?.observed !== 'accepted' || !SHA256.test(regression.before?.receiptSha256 || '')) throw new Error('The pre-fix failure must be evidenced.');
  if (regression.after?.expected !== 'rejected' || regression.after?.observed !== 'rejected' || !SHA256.test(regression.after?.receiptSha256 || '') || typeof regression.after?.testPath !== 'string' || !regression.after.testPath.startsWith('tests/')) throw new Error('The passing regression must be evidenced by a repository test.');

  return {
    contractVersion: 'vertexed.deidentified-regression.v1',
    id: review.id,
    sourceFeedbackDigest: review.sourceFeedbackDigest,
    capability: review.capability,
    inputClass: regression.inputClass,
    assertion: regression.assertion,
    privacy: {
      explicitConsentForEval: true,
      deidentifiedByReviewer: true,
      containsUserContent: false,
      freeTextIncluded: false,
      reviewedAt: new Date(privacy.reviewedAt).toISOString(),
      reviewerRole: privacy.reviewerRole,
    },
    before: regression.before,
    after: regression.after,
  };
}
