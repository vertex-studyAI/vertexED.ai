const SUPPORTED_OUTCOMES = new Set(['needs-review', 'some-evidence', 'demonstrated-here']);

function normalizeText(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function canonicalSubject(value) {
  const normalized = normalizeText(value)
    .replace(/\b(higher|standard|sl|hl|aa|ai)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (/\bmath(s|ematics)?\b/.test(normalized)) return 'mathematics';
  if (/\bcomputer science\b|\bcomputing\b/.test(normalized)) return 'computer science';
  return normalized;
}

function topicScore(drill, topics) {
  if (!topics.length) return 0;
  const haystack = `${normalizeText(drill.topic)} ${normalizeText(drill.focus)}`;
  return topics.reduce((score, topic) => score + (topic && haystack.includes(topic) ? 1 : 0), 0);
}

export function parseBaselineTopics(value) {
  if (typeof value !== 'string') return [];
  return [...new Set(value.split(/[,\n]/).map(normalizeText).filter(Boolean))].slice(0, 40);
}

export function selectBaselineDrills({ drills, programme = '', subject = '', topics = [], limit = 3 }) {
  if (!Array.isArray(drills)) return [];
  const boundedLimit = Number.isInteger(limit) ? Math.min(5, Math.max(3, limit)) : 3;
  const canonical = canonicalSubject(subject);
  const normalizedProgramme = normalizeText(programme);
  const normalizedTopics = [...new Set(Array.isArray(topics)
    ? topics.map(normalizeText).filter(Boolean)
    : parseBaselineTopics(topics))];

  const candidates = drills
    .filter((drill) => normalizeText(drill.programme) === normalizedProgramme)
    .filter((drill) => canonicalSubject(drill.subject) === canonical)
    .map((drill, index) => ({ drill, index, topicScore: topicScore(drill, normalizedTopics) }))
    .sort((a, b) => b.topicScore - a.topicScore || a.index - b.index);

  if (candidates.length < boundedLimit) return [];

  const selected = [];
  const seenFocus = new Set();
  const selectCandidate = (candidate, { allowFocusRepeat = false } = {}) => {
    const focusKey = normalizeText(candidate.drill.focus).split(':')[0] || normalizeText(candidate.drill.focus);
    if ((!allowFocusRepeat && seenFocus.has(focusKey)) || selected.some((item) => item.id === candidate.drill.id)) return false;
    selected.push(candidate.drill);
    seenFocus.add(focusKey);
    return true;
  };

  // Preserve topic coverage before filling the remaining bounded slots. Without
  // this pass, several drills from one requested topic can tie on score and
  // crowd a later requested topic out solely because they appear earlier in
  // the editorial bank.
  for (const topic of normalizedTopics) {
    const candidate = candidates.find(({ drill }) => {
      const haystack = `${normalizeText(drill.topic)} ${normalizeText(drill.focus)}`;
      return haystack.includes(topic)
        && !selected.some((item) => item.id === drill.id);
    });
    if (candidate) selectCandidate(candidate, { allowFocusRepeat: true });
    if (selected.length === boundedLimit) return selected;
  }

  for (const candidate of candidates) {
    selectCandidate(candidate);
    if (selected.length === boundedLimit) return selected;
  }
  for (const candidate of candidates) {
    if (selected.some((item) => item.id === candidate.drill.id)) continue;
    selected.push(candidate.drill);
    if (selected.length === boundedLimit) break;
  }
  return selected;
}

export function createBaselineAttempt(drillIds, identity = {}) {
  const ids = Array.isArray(drillIds) ? drillIds.filter((id) => typeof id === 'string' && id.trim()).slice(0, 5) : [];
  return {
    version: 1,
    subject: typeof identity.subject === 'string' ? identity.subject : '',
    programme: typeof identity.programme === 'string' ? identity.programme : '',
    drillIds: ids,
    responses: Object.fromEntries(ids.map((id) => [id, {
      answer: '',
      attemptState: 'not-attempted',
      selfCheck: null,
      revealed: false,
    }])),
    completedAt: null,
  };
}

export function normalizeBaselineAttempt(value, expected = {}) {
  if (!value || typeof value !== 'object' || value.version !== 1 || !Array.isArray(value.drillIds)) return null;
  if (typeof expected.subject === 'string' && value.subject !== expected.subject) return null;
  if (typeof expected.programme === 'string' && value.programme !== expected.programme) return null;
  if (value.drillIds.length < 3 || value.drillIds.length > 5 || new Set(value.drillIds).size !== value.drillIds.length) return null;

  const responses = {};
  for (const id of value.drillIds) {
    if (typeof id !== 'string' || !id.trim()) return null;
    const raw = value.responses?.[id];
    if (!raw || typeof raw !== 'object') return null;
    const attemptState = ['not-attempted', 'attempted', 'unsure', 'skipped'].includes(raw.attemptState)
      ? raw.attemptState
      : 'not-attempted';
    const selfCheck = SUPPORTED_OUTCOMES.has(raw.selfCheck) ? raw.selfCheck : null;
    responses[id] = {
      answer: typeof raw.answer === 'string' ? raw.answer.slice(0, 6000) : '',
      attemptState,
      selfCheck: attemptState === 'attempted' ? selfCheck : null,
      revealed: raw.revealed === true,
    };
  }

  return {
    version: 1,
    subject: value.subject,
    programme: value.programme,
    drillIds: [...value.drillIds],
    responses,
    completedAt: typeof value.completedAt === 'string' ? value.completedAt : null,
  };
}

export function summarizeBaselineAttempt(attempt) {
  const normalized = normalizeBaselineAttempt(attempt, {
    subject: attempt?.subject,
    programme: attempt?.programme,
  });
  if (!normalized) return { label: 'No evidence yet', attempted: 0, unsure: 0, skipped: 0, notAttempted: 0, counts: {} };

  const values = Object.values(normalized.responses);
  const attempted = values.filter((item) => item.attemptState === 'attempted').length;
  const unsure = values.filter((item) => item.attemptState === 'unsure').length;
  const skipped = values.filter((item) => item.attemptState === 'skipped').length;
  const notAttempted = values.filter((item) => item.attemptState === 'not-attempted').length;
  const counts = {
    'needs-review': values.filter((item) => item.selfCheck === 'needs-review').length,
    'some-evidence': values.filter((item) => item.selfCheck === 'some-evidence').length,
    'demonstrated-here': values.filter((item) => item.selfCheck === 'demonstrated-here').length,
  };

  let label = 'No evidence yet';
  if (attempted > 0) {
    label = counts['needs-review'] > 0 ? 'Needs review' : 'Some evidence';
  }
  return { label, attempted, unsure, skipped, notAttempted, counts };
}

export function baselineNextAction(attempt) {
  const summary = summarizeBaselineAttempt(attempt);
  if (summary.attempted === 0) return 'Attempt one question before deciding what to review.';
  if (summary.counts['needs-review'] > 0) return 'Open focused practice and repair the question you marked needs review.';
  if (summary.unsure > 0 || summary.skipped > 0 || summary.notAttempted > 0) return 'Finish or revisit the unsure and skipped questions before widening the conclusion.';
  return 'Use focused practice on the same topic, then compare a fresh transfer question.';
}
