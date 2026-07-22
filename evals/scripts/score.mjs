/**
 * Deterministic scoring engine for AI eval rubrics.
 *
 * See evals/ask/rubric.md for the schema and the score formula.
 * Pure functions, no I/O, fully unit-tested in evals/tests/scoring.test.mjs.
 */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(text) {
  return typeof text === 'string' ? text.toLowerCase() : '';
}

function countMatches(haystack, needles) {
  let count = 0;
  for (const needle of needles) {
    if (normalize(haystack).includes(normalize(needle))) count += 1;
  }
  return count;
}

function regexMatchesCount(text, regex) {
  if (!regex) return 0;
  try {
    const re = new RegExp(regex, 'gi');
    return (text.match(re) || []).length;
  } catch {
    return 0;
  }
}

function findSourceCitation(text) {
  return /\[source:\s*[^\]]+\]/i.test(text || '');
}

function groupContainsAny(text, groups) {
  if (!Array.isArray(groups) || groups.length === 0) return true;
  return groups.some((group) => {
    if (!Array.isArray(group) || group.length === 0) return false;
    return group.every((needle) => normalize(text).includes(normalize(needle)));
  });
}

/**
 * @param {string} responseText
 * @param {object} rubric
 * @returns {{ score: number, breakdown: object, reasons: string[] }}
 */
export function scoreResponse(responseText, rubric) {
  const reasons = [];
  const breakdown = {};
  let base = 5;

  const text = typeof responseText === 'string' ? responseText : '';

  // required-content groups
  if (rubric.mustContainAny && rubric.mustContainAny.length > 0) {
    const ok = groupContainsAny(text, rubric.mustContainAny);
    breakdown.mustContainAnyPassed = ok;
    if (!ok) {
      base -= 2;
      reasons.push('mustContainAny: no group fully matched');
    }
  }

  // banned-content
  if (Array.isArray(rubric.mustNotContain) && rubric.mustNotContain.length > 0) {
    const hits = countMatches(text, rubric.mustNotContain);
    breakdown.mustNotContainHits = hits;
    if (hits > 0) {
      base -= 3 * hits;
      reasons.push(`mustNotContain: ${hits} banned phrase(s) found`);
    }
  }

  // length bounds
  const len = text.length;
  breakdown.length = len;
  if (typeof rubric.minLength === 'number' && len < rubric.minLength) {
    base -= 1;
    reasons.push(`minLength: ${len} < ${rubric.minLength}`);
  }
  if (typeof rubric.maxLength === 'number' && len > rubric.maxLength) {
    base -= 1;
    reasons.push(`maxLength: ${len} > ${rubric.maxLength}`);
  }

  // source citation requirement
  if (rubric.mustCiteSources) {
    const cited = findSourceCitation(text);
    breakdown.cited = cited;
    if (!cited) {
      base -= 2;
      reasons.push('mustCiteSources: no [Source: ...] citation');
    }
  }

  // encourage signals
  const encourageMatches = [];
  if (Array.isArray(rubric.encourages)) {
    for (const item of rubric.encourages) {
      if (!item || typeof item.regex !== 'string') continue;
      const c = regexMatchesCount(text, item.regex);
      encourageMatches.push({ label: item.label, count: c });
      base += c * 0.25;
    }
  }
  breakdown.encourageMatches = encourageMatches;

  // discourage signals
  const discourageMatches = [];
  if (Array.isArray(rubric.discourages)) {
    for (const item of rubric.discourages) {
      if (!item || typeof item.regex !== 'string') continue;
      const c = regexMatchesCount(text, item.regex);
      discourageMatches.push({ label: item.label, count: c });
      base -= c * 0.5;
    }
  }
  breakdown.discourageMatches = discourageMatches;

  const score = clamp(Math.round(base), 1, 5);
  breakdown.adjustments = reasons;
  return { score, breakdown };
}

export const _internal = {
  clamp,
  normalize,
  countMatches,
  regexMatchesCount,
  findSourceCitation,
  groupContainsAny,
};