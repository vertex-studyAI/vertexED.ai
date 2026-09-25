function normalizeSubject(value) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
      .replace(/\b(higher|standard|sl|hl|aa|ai)\b/g, ' ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    : '';
}

export function canonicalPracticeSubject(value) {
  const normalized = normalizeSubject(value);
  if (/\bmath(s|ematics)?\b/.test(normalized)) return 'mathematics';
  if (/^calculus (ab|bc)$/.test(normalized)) return 'mathematics';
  return normalized;
}

export function practiceSubjectMatches(subject, drillSubject) {
  const canonicalSubject = canonicalPracticeSubject(subject);
  return Boolean(canonicalSubject) && canonicalSubject === canonicalPracticeSubject(drillSubject);
}
