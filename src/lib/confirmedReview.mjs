/** Learner-attested marks may correct model suggestions; invalid edits never count. */
export function resolveConfirmedCriteria(criteria, overrides = {}) {
  if (!Array.isArray(criteria)) return null;
  const corrected = criteria.map(criterion => {
    const input = overrides[criterion.id];
    const score = input === undefined ? criterion.score : typeof input === 'string' && input.trim() === '' ? NaN : Number(input);
    return { ...criterion, score };
  });
  if (corrected.some(criterion => !Number.isFinite(criterion.score) || !Number.isFinite(criterion.maxScore) || criterion.maxScore <= 0 || criterion.score < 0 || criterion.score > criterion.maxScore)) return null;
  return corrected;
}
