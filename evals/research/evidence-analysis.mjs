import { createHash } from 'node:crypto';

const finite = (value, label) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${label} must be finite`);
  return value;
};

const bounded = (value, label, lower = 0, upper = 100) => {
  finite(value, label);
  if (value < lower || value > upper) throw new RangeError(`${label} must be in [${lower}, ${upper}]`);
  return value;
};

const mean = values => values.reduce((total, value) => total + value, 0) / values.length;
const median = values => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};

const rng = seed => () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

function percentile(values, probability) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(probability * sorted.length))];
}

function bootstrapMeanInterval(values, resamples = 20_000, seed = 20260913) {
  if (!values.length) return null;
  const random = rng(seed);
  const estimates = [];
  for (let sample = 0; sample < resamples; sample += 1) {
    let total = 0;
    for (let index = 0; index < values.length; index += 1) {
      total += values[Math.floor(random() * values.length)];
    }
    estimates.push(total / values.length);
  }
  return [percentile(estimates, 0.025), percentile(estimates, 0.975)];
}

export function analyzeLearning(rows, { resamples = 20_000 } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) throw new TypeError('learning rows must be nonempty');
  const participants = new Map();
  for (const row of rows) {
    if (!row || typeof row.participant_id !== 'string' || !row.participant_id) throw new TypeError('participant_id is required');
    if (!['vertexed', 'control'].includes(row.condition)) throw new TypeError('condition must be vertexed or control');
    if (typeof row.started !== 'boolean' || typeof row.completed !== 'boolean') throw new TypeError('started/completed must be boolean');
    if (row.completed && !row.started) throw new Error('completed session cannot be unstarted');
    bounded(row.pre_percent, 'pre_percent');
    if (row.completed) bounded(row.post_percent, 'post_percent');
    if (row.delayed_percent !== null) bounded(row.delayed_percent, 'delayed_percent');
    const record = participants.get(row.participant_id) ?? {};
    if (record[row.condition]) throw new Error(`duplicate participant-condition: ${row.participant_id}/${row.condition}`);
    record[row.condition] = row;
    participants.set(row.participant_id, record);
  }
  const paired = [];
  const delayed = [];
  const missing = [];
  for (const [participantId, record] of participants) {
    if (!record.vertexed || !record.control || !record.vertexed.completed || !record.control.completed) {
      missing.push(participantId);
      continue;
    }
    paired.push(
      (record.vertexed.post_percent - record.vertexed.pre_percent)
      - (record.control.post_percent - record.control.pre_percent),
    );
    if (record.vertexed.delayed_percent !== null && record.control.delayed_percent !== null) {
      delayed.push(
        (record.vertexed.delayed_percent - record.vertexed.pre_percent)
        - (record.control.delayed_percent - record.control.pre_percent),
      );
    }
  }
  const started = condition => rows.filter(row => row.condition === condition && row.started).length;
  const completed = condition => rows.filter(row => row.condition === condition && row.completed).length;
  const leaveOneOut = paired.length > 1 ? paired.map((_, index) => mean(paired.filter((__, other) => other !== index))) : [];
  return {
    schema_version: 'vertexed-learning-analysis-v1',
    input_sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex'),
    participants: participants.size,
    complete_pairs: paired.length,
    missing_pair_participants: missing.sort(),
    attrition: Object.fromEntries(['vertexed', 'control'].map(condition => [condition, {
      started: started(condition), completed: completed(condition),
      fraction: started(condition) ? 1 - completed(condition) / started(condition) : null,
    }])),
    primary: paired.length ? {
      mean_percentage_points: mean(paired), median_percentage_points: median(paired),
      bootstrap_95_interval: bootstrapMeanInterval(paired, resamples),
      positive: paired.filter(value => value > 0).length,
      zero: paired.filter(value => value === 0).length,
      negative: paired.filter(value => value < 0).length,
      leave_one_out_range: leaveOneOut.length ? [Math.min(...leaveOneOut), Math.max(...leaveOneOut)] : null,
    } : null,
    delayed: delayed.length ? { complete_pairs: delayed.length, mean_percentage_points: mean(delayed), bootstrap_95_interval: bootstrapMeanInterval(delayed, resamples, 20260914) } : null,
    evidence_status: paired.length >= 30 ? 'RESULT_READY' : 'EXPLORATORY_OR_INCOMPLETE',
  };
}

export function analyzeGrading(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new TypeError('grading rows must be nonempty');
  const ids = new Set();
  const normalized = rows.map(row => {
    if (!row || typeof row.submission_id !== 'string' || !row.submission_id || ids.has(row.submission_id)) throw new Error('submission_id must be unique');
    ids.add(row.submission_id);
    if (!Array.isArray(row.human_scores) || row.human_scores.length < 2) throw new Error('at least two blinded human scores are required');
    row.human_scores.forEach((value, index) => bounded(value, `human_scores[${index}]`));
    bounded(row.adjudicated_score, 'adjudicated_score');
    bounded(row.provider_score, 'provider_score');
    bounded(row.confidence, 'confidence', 0, 1);
    if (typeof row.subgroup !== 'string' || !row.subgroup) throw new TypeError('subgroup is required');
    return row;
  });
  const summarize = subset => ({
    n: subset.length,
    provider_mae: mean(subset.map(row => Math.abs(row.provider_score - row.adjudicated_score))),
    human_pair_mae: mean(subset.map(row => Math.abs(row.human_scores[0] - row.human_scores[1]))),
    within_five_points: mean(subset.map(row => Math.abs(row.provider_score - row.adjudicated_score) <= 5 ? 1 : 0)),
    brier_at_pass_50: mean(subset.map(row => (row.confidence - (row.adjudicated_score >= 50 ? 1 : 0)) ** 2)),
  });
  const groups = [...new Set(normalized.map(row => row.subgroup))].sort();
  const subgroup = Object.fromEntries(groups.map(group => [group, summarize(normalized.filter(row => row.subgroup === group))]));
  return {
    schema_version: 'vertexed-grading-analysis-v1',
    input_sha256: createHash('sha256').update(JSON.stringify(rows)).digest('hex'),
    overall: summarize(normalized), subgroup,
    worst_subgroup_provider_mae: Math.max(...Object.values(subgroup).map(value => value.provider_mae)),
    evidence_status: normalized.length >= 200 && groups.every(group => subgroup[group].n >= 30) ? 'RESULT_READY' : 'EXPLORATORY_OR_INCOMPLETE',
  };
}
