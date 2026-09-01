const PSEUDONYMOUS_ID = /^[A-Za-z0-9_-]{6,64}$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

export const PILOT_EXPORT_SCHEMA = 'vertexed-pilot-analytics-v1';

const asFiniteNumber = (value) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeScore = (assessment) => {
  if (!assessment || typeof assessment !== 'object') return null;
  const score = asFiniteNumber(assessment.score);
  const max = asFiniteNumber(assessment.max);
  const id = typeof assessment.id === 'string' ? assessment.id.trim() : '';
  if (!id || score === null || max === null || max <= 0 || score < 0 || score > max) return null;
  return { id, score, max };
};

const normalizeTimestamp = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!ISO_TIMESTAMP.test(trimmed) || Number.isNaN(Date.parse(trimmed))) return null;
  return trimmed;
};

const requiredText = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

export const isPseudonymousParticipantId = (value) =>
  typeof value === 'string' && PSEUDONYMOUS_ID.test(value) && !value.includes('@');

export function normalizePilotSession(record) {
  if (!record || typeof record !== 'object') return null;
  if (record.consent_opt_in !== true) return null;
  if (!isPseudonymousParticipantId(record.participant_id)) return null;

  const curriculum = requiredText(record.curriculum);
  const subject = requiredText(record.subject);
  const topic = requiredText(record.topic);
  const sessionId = requiredText(record.session_id);
  const pre = normalizeScore(record.pre_assessment);
  const post = normalizeScore(record.post_assessment);
  const interventionStart = normalizeTimestamp(record.intervention_start);
  const interventionEnd = normalizeTimestamp(record.intervention_end);
  const startedAt = normalizeTimestamp(record.started_at);
  const completedAt = record.completed_at == null ? null : normalizeTimestamp(record.completed_at);
  const completedPracticeLoops = asFiniteNumber(record.completed_practice_loops);
  const completedReviewLoops = asFiniteNumber(record.completed_review_loops);
  const usefulness = record.usefulness_rating == null ? null : asFiniteNumber(record.usefulness_rating);

  if (
    !curriculum ||
    !subject ||
    !topic ||
    !sessionId ||
    !pre ||
    !interventionStart ||
    !interventionEnd ||
    !startedAt ||
    completedPracticeLoops === null ||
    completedReviewLoops === null ||
    completedPracticeLoops < 0 ||
    completedReviewLoops < 0 ||
    !Number.isInteger(completedPracticeLoops) ||
    !Number.isInteger(completedReviewLoops)
  ) {
    return null;
  }

  if (Date.parse(interventionEnd) < Date.parse(interventionStart)) return null;
  if (completedAt && Date.parse(completedAt) < Date.parse(startedAt)) return null;
  if (usefulness !== null && (usefulness < 1 || usefulness > 5)) return null;

  const completionFlag = record.completion_flag === true;
  if (completionFlag && (!post || !completedAt)) return null;

  return {
    participant_id: record.participant_id,
    session_id: sessionId,
    curriculum,
    subject,
    topic,
    pre_assessment_id: pre.id,
    pre_score: pre.score,
    pre_max: pre.max,
    intervention_start: interventionStart,
    intervention_end: interventionEnd,
    completed_practice_loops: completedPracticeLoops,
    completed_review_loops: completedReviewLoops,
    post_assessment_id: post?.id ?? null,
    post_score: post?.score ?? null,
    post_max: post?.max ?? null,
    started_at: startedAt,
    completed_at: completedAt,
    completion_flag: completionFlag,
    usefulness_rating: usefulness,
  };
}

const normalizePilotRecords = (records) => {
  if (!Array.isArray(records)) throw new TypeError('records must be an array');
  const sessions = [];
  const seenSessionKeys = new Set();
  let rejectedRecordCount = 0;

  for (const record of records) {
    const session = normalizePilotSession(record);
    if (!session) {
      rejectedRecordCount += 1;
      continue;
    }

    const key = `${session.participant_id}\u0000${session.session_id}`;
    if (seenSessionKeys.has(key)) {
      throw new Error('duplicate participant/session record');
    }
    seenSessionKeys.add(key);
    sessions.push(session);
  }

  return { sessions, rejectedRecordCount };
};

const round = (value, digits = 4) => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};

const percent = (score, max) => round((score / max) * 100);
const unique = (values) => [...new Set(values)];

const summarizeNormalizedPilotSessions = (sessions) => {
  const participantIds = unique(sessions.map((session) => session.participant_id));
  const completedSessions = sessions.filter(
    (session) => session.completion_flag && session.post_score !== null && session.post_max !== null,
  );
  const completedParticipants = unique(completedSessions.map((session) => session.participant_id));
  const pairedDeltas = completedSessions.map(
    (session) => percent(session.post_score, session.post_max) - percent(session.pre_score, session.pre_max),
  );
  const prePercents = sessions.map((session) => percent(session.pre_score, session.pre_max));
  const postPercents = completedSessions.map((session) => percent(session.post_score, session.post_max));
  const sessionCountByParticipant = new Map();

  for (const session of sessions) {
    sessionCountByParticipant.set(
      session.participant_id,
      (sessionCountByParticipant.get(session.participant_id) ?? 0) + 1,
    );
  }

  const repeatParticipants = [...sessionCountByParticipant.values()].filter((count) => count > 1).length;
  const timestamps = sessions.flatMap((session) =>
    [session.started_at, session.completed_at, session.intervention_start, session.intervention_end].filter(Boolean),
  );

  return {
    n_enrolled: participantIds.length,
    n_completed: completedParticipants.length,
    n_sessions: sessions.length,
    n_completed_sessions: completedSessions.length,
    dropout_or_missing_data_count: participantIds.length - completedParticipants.length,
    missing_or_incomplete_session_count: sessions.length - completedSessions.length,
    pre_percent_mean: prePercents.length ? round(mean(prePercents)) : null,
    pre_percent_median: prePercents.length ? round(median(prePercents)) : null,
    post_percent_mean: postPercents.length ? round(mean(postPercents)) : null,
    post_percent_median: postPercents.length ? round(median(postPercents)) : null,
    paired_delta_percent_mean: pairedDeltas.length ? round(mean(pairedDeltas)) : null,
    paired_delta_percent_median: pairedDeltas.length ? round(median(pairedDeltas)) : null,
    paired_delta_count: pairedDeltas.length,
    repeat_participant_count: repeatParticipants,
    repeat_session_rate: participantIds.length ? round(repeatParticipants / participantIds.length) : null,
    completed_review_loops: sessions.reduce((sum, session) => sum + session.completed_review_loops, 0),
    completed_practice_loops: sessions.reduce((sum, session) => sum + session.completed_practice_loops, 0),
    measurement_window_start: timestamps.length ? [...timestamps].sort()[0] : null,
    measurement_window_end: timestamps.length ? [...timestamps].sort().at(-1) : null,
  };
};

export function summarizePilotSessions(records) {
  return summarizeNormalizedPilotSessions(normalizePilotRecords(records).sessions);
}

export function buildPilotExport(records, metadata) {
  if (!metadata || typeof metadata !== 'object') throw new TypeError('metadata is required');
  const generatedAt = normalizeTimestamp(metadata.generated_at);
  const sourceRevision = requiredText(metadata.source_revision);
  const source = requiredText(metadata.source);
  if (!generatedAt || !sourceRevision || !source) {
    throw new TypeError('metadata.generated_at, metadata.source_revision, and metadata.source are required');
  }

  const { sessions, rejectedRecordCount } = normalizePilotRecords(records);
  return {
    schema: PILOT_EXPORT_SCHEMA,
    metadata: {
      generated_at: generatedAt,
      source_revision: sourceRevision,
      source,
      consent_rule: 'consent_opt_in must be true',
      participant_identity: 'pseudonymous-only; email-like identifiers are rejected',
      claim_boundary: 'descriptive convenience-pilot evidence; not causal efficacy evidence',
      input_record_count: records.length,
      accepted_session_count: sessions.length,
      rejected_record_count: rejectedRecordCount,
    },
    aggregate: summarizeNormalizedPilotSessions(sessions),
    sessions,
  };
}

export function buildParticipantPilotExport(records, participantId, metadata) {
  if (!isPseudonymousParticipantId(participantId)) {
    throw new TypeError('participantId must be a pseudonymous identifier');
  }
  return buildPilotExport(
    records.filter((record) => record?.participant_id === participantId),
    metadata,
  );
}

const CSV_COLUMNS = [
  'participant_id',
  'session_id',
  'curriculum',
  'subject',
  'topic',
  'pre_assessment_id',
  'pre_score',
  'pre_max',
  'intervention_start',
  'intervention_end',
  'completed_practice_loops',
  'completed_review_loops',
  'post_assessment_id',
  'post_score',
  'post_max',
  'started_at',
  'completed_at',
  'completion_flag',
  'usefulness_rating',
];

const csvCell = (value) => {
  if (value == null) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function pilotSessionsToCsv(sessions) {
  const normalized = normalizePilotRecords(sessions).sessions;
  const rows = normalized.map((session) => CSV_COLUMNS.map((column) => csvCell(session[column])).join(','));
  return `${CSV_COLUMNS.join(',')}\n${rows.join('\n')}${rows.length ? '\n' : ''}`;
}
