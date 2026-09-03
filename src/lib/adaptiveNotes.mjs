function clean(value, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function buildAdaptiveNoteRoute(weakness) {
  const subject = clean(weakness?.subject, 80);
  const topic = clean(weakness?.topic, 160);
  if (!subject || !topic) return '/notetaker';
  const params = new URLSearchParams({ adaptive: '1', subject, topic });
  return `/notetaker?${params.toString()}`;
}

export function resolveAdaptiveNoteTarget(searchParams, weaknesses) {
  if (!searchParams || searchParams.get('adaptive') !== '1') return null;
  const requestedSubject = clean(searchParams.get('subject'), 80);
  const requestedTopic = clean(searchParams.get('topic'), 160);
  if (!requestedSubject || !requestedTopic || !Array.isArray(weaknesses)) return null;

  const match = weaknesses.find((entry) => (
    clean(entry?.subject, 80) === requestedSubject &&
    clean(entry?.topic, 160) === requestedTopic &&
    Number.isFinite(Number(entry?.avgPercent)) &&
    Number.isFinite(Number(entry?.attempts))
  ));
  if (!match) return null;

  return {
    subject: requestedSubject,
    topic: requestedTopic,
    avgPercent: Math.max(0, Math.min(100, Number(match.avgPercent))),
    attempts: Math.max(1, Math.floor(Number(match.attempts))),
  };
}
