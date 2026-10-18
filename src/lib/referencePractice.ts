/** Deliberately bounded numeric input. Never evaluate learner text as code. */
export function parseReferenceAnswer(input: string): number | null {
  const text = input.trim().replace(/−/g, '-');
  const number = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  const parts = text.split('/').map((part) => part.trim());
  if (parts.length > 2 || parts.some((part) => !number.test(part))) return null;
  const numerator = Number(parts[0]);
  const denominator = parts.length === 2 ? Number(parts[1]) : 1;
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  const value = numerator / denominator;
  return Number.isFinite(value) ? value : null;
}

export function checkReferenceAnswer(input: string, expected: number, tolerance = 0.000001) {
  const value = parseReferenceAnswer(input);
  if (value === null) return 'invalid' as const;
  return Math.abs(value - expected) <= tolerance + Number.EPSILON * Math.max(1, Math.abs(expected))
    ? 'correct' as const : 'retry' as const;
}
