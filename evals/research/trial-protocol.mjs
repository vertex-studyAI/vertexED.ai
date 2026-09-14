import { createHash } from 'node:crypto';

const assertId = (value, label) => {
  if (typeof value !== 'string' || value.trim() === '' || value.length > 160) {
    throw new TypeError(`${label} must be a non-empty bounded string`);
  }
  return value.trim();
};

const sha256 = value => createHash('sha256').update(value).digest('hex');

export function generateBalancedAssignments(participantIds, {
  seed,
  conditions = ['vertexed', 'control'],
} = {}) {
  if (!Array.isArray(participantIds) || participantIds.length === 0) {
    throw new TypeError('participantIds must be a non-empty array');
  }
  const normalized = participantIds.map(participantId => assertId(participantId, 'participant_id'));
  if (new Set(normalized).size !== normalized.length) throw new Error('participantIds must be unique');
  const normalizedSeed = assertId(seed, 'seed');
  if (!Array.isArray(conditions) || conditions.length < 2) {
    throw new TypeError('conditions must contain at least two arms');
  }
  const normalizedConditions = conditions.map(condition => assertId(condition, 'condition'));
  if (new Set(normalizedConditions).size !== normalizedConditions.length) {
    throw new Error('conditions must be unique');
  }

  const ranked = normalized
    .map(participantId => ({
      participant_id: participantId,
      rank_key: sha256(`vertexed-assignment-v1\0${normalizedSeed}\0${participantId}`),
    }))
    .sort((left, right) => left.rank_key.localeCompare(right.rank_key));

  const assignments = ranked.map((row, index) => ({
    participant_id: row.participant_id,
    planned_condition: normalizedConditions[index % normalizedConditions.length],
    assignment_token: sha256(`vertexed-token-v1\0${normalizedSeed}\0${row.participant_id}`).slice(0, 24),
  }));

  return {
    schema_version: 'vertexed-balanced-randomization-v1',
    algorithm: 'sha256-rank-then-cyclic-balanced-assignment',
    seed_commitment_sha256: sha256(normalizedSeed),
    participant_manifest_sha256: sha256(JSON.stringify([...normalized].sort())),
    conditions: normalizedConditions,
    assignments,
    arm_counts: Object.fromEntries(normalizedConditions.map(condition => [
      condition,
      assignments.filter(row => row.planned_condition === condition).length,
    ])),
    guard: (
      'For confirmatory use, choose the seed independently and commit its SHA-256 plus the participant '
      + 'manifest before treatment exposure or outcome inspection. Disclose the seed later for audit. '
      + 'This function makes the assignment reproducible; it cannot prove the seed was chosen prospectively.'
    ),
  };
}

export function validateTrialManifest(rows, {
  requiredMinutes = 60,
  allowedConditions = ['vertexed', 'control'],
  maxHeadroomPrePercent = null,
} = {}) {
  if (!Array.isArray(rows) || rows.length === 0) throw new TypeError('trial manifest must be non-empty');
  if (!Number.isFinite(requiredMinutes) || requiredMinutes <= 0) throw new RangeError('requiredMinutes must be positive');
  if (!Array.isArray(allowedConditions) || allowedConditions.length < 2) throw new TypeError('allowedConditions must contain at least two arms');
  if (maxHeadroomPrePercent !== null && (
    typeof maxHeadroomPrePercent !== 'number'
    || !Number.isFinite(maxHeadroomPrePercent)
    || maxHeadroomPrePercent <= 0
    || maxHeadroomPrePercent >= 100
  )) throw new RangeError('maxHeadroomPrePercent must be null or a percentage in (0, 100)');

  const conditions = new Set(allowedConditions);
  const participants = new Set();
  const assignmentTokens = new Set();
  const normalized = rows.map((row, index) => {
    if (!row || typeof row !== 'object') throw new TypeError(`row ${index} must be an object`);
    const participantId = assertId(row.participant_id, 'participant_id');
    if (participants.has(participantId)) throw new Error(`duplicate participant_id: ${participantId}`);
    participants.add(participantId);
    const assignmentToken = assertId(row.assignment_token, 'assignment_token');
    if (assignmentTokens.has(assignmentToken)) throw new Error(`duplicate assignment_token: ${assignmentToken}`);
    assignmentTokens.add(assignmentToken);
    if (!conditions.has(row.condition)) throw new Error(`unsupported condition: ${row.condition}`);
    if (row.planned_condition !== row.condition) {
      throw new Error(`assignment mismatch for ${participantId}: planned=${row.planned_condition} observed=${row.condition}`);
    }
    if (row.duration_minutes !== requiredMinutes) {
      throw new Error(`duration mismatch for ${participantId}: expected ${requiredMinutes}`);
    }
    const topicId = assertId(row.topic_id, 'topic_id');
    const assessmentFormId = assertId(row.assessment_form_id, 'assessment_form_id');
    if (typeof row.pre_percent !== 'number' || !Number.isFinite(row.pre_percent) || row.pre_percent < 0 || row.pre_percent > 100) {
      throw new RangeError('pre_percent must be in [0, 100]');
    }
    if (maxHeadroomPrePercent !== null && row.pre_percent > maxHeadroomPrePercent) {
      throw new Error(`headroom rule violated for ${participantId}`);
    }
    return {
      participant_id: participantId,
      assignment_token: assignmentToken,
      condition: row.condition,
      planned_condition: row.planned_condition,
      duration_minutes: row.duration_minutes,
      topic_id: topicId,
      assessment_form_id: assessmentFormId,
      pre_percent: row.pre_percent,
    };
  });

  const armCounts = Object.fromEntries(allowedConditions.map(condition => [
    condition,
    normalized.filter(row => row.condition === condition).length,
  ]));
  const topics = [...new Set(normalized.map(row => row.topic_id))].sort();
  const forms = [...new Set(normalized.map(row => row.assessment_form_id))].sort();

  return {
    schema_version: 'vertexed-trial-manifest-v1',
    input_sha256: createHash('sha256').update(JSON.stringify(normalized)).digest('hex'),
    participants: normalized.length,
    arm_counts: armCounts,
    topics,
    assessment_forms: forms,
    required_minutes: requiredMinutes,
    headroom_threshold_pre_percent: maxHeadroomPrePercent,
    guard: (
      'This validator checks adherence to a predeclared assignment manifest, equal session duration, '
      + 'topic/form identity and an optional predeclared headroom threshold. It does not prove that '
      + 'the assignment sequence was generated randomly; preserve the randomization-generation artifact separately.'
    ),
  };
}
