export function extractMeasuredReviewScore(text, expectedMaxMarks) {
  if (typeof text !== 'string' || !text.trim()) return null;

  const expected = Number(expectedMaxMarks);
  if (!Number.isFinite(expected) || expected <= 0) return null;

  const matches = [...text.matchAll(/(-?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/g)];
  for (const match of matches) {
    const score = Number(match[1]);
    const maxScore = Number(match[2]);

    if (!Number.isFinite(score) || !Number.isFinite(maxScore)) continue;
    if (maxScore !== expected) continue;
    if (score < 0 || maxScore <= 0 || score > maxScore) continue;

    return { score, maxScore };
  }

  return null;
}
