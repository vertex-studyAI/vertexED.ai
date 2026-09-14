import { createHash } from 'node:crypto';

const assertFiniteProbability = (value, label) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${label} must be a finite probability in [0, 1]`);
  }
  return value;
};

const assertId = (value, label) => {
  if (typeof value !== 'string' || value.trim() === '' || value.length > 160) {
    throw new TypeError(`${label} must be a non-empty bounded string`);
  }
  return value.trim();
};

const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;

function summarizeSubset(rows) {
  if (!rows.length) return null;
  const accuracy = mean(rows.map(row => row.correct ? 1 : 0));
  const meanConfidence = mean(rows.map(row => row.confidence));
  const brier = mean(rows.map(row => (row.confidence - (row.correct ? 1 : 0)) ** 2));
  return {
    n: rows.length,
    accuracy,
    mean_confidence: meanConfidence,
    calibration_gap_confidence_minus_accuracy: meanConfidence - accuracy,
    brier_score: brier,
  };
}

export function analyzeCalibration(rows, { bins = 10 } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new TypeError('calibration rows must be a non-empty array');
  }
  if (!Number.isInteger(bins) || bins < 2 || bins > 50) {
    throw new RangeError('bins must be an integer in [2, 50]');
  }

  const seen = new Set();
  const normalized = rows.map((row, index) => {
    if (!row || typeof row !== 'object') throw new TypeError(`row ${index} must be an object`);
    const participantId = assertId(row.participant_id, 'participant_id');
    const itemId = assertId(row.item_id, 'item_id');
    const key = `${participantId}\u0000${itemId}`;
    if (seen.has(key)) throw new Error(`duplicate participant/item row: ${participantId}/${itemId}`);
    seen.add(key);
    if (typeof row.correct !== 'boolean') throw new TypeError('correct must be boolean');
    if (typeof row.support_present !== 'boolean') throw new TypeError('support_present must be boolean');
    return {
      participant_id: participantId,
      item_id: itemId,
      confidence: assertFiniteProbability(row.confidence, 'confidence'),
      correct: row.correct,
      support_present: row.support_present,
    };
  });

  const table = Array.from({ length: bins }, (_, binIndex) => {
    const lower = binIndex / bins;
    const upper = (binIndex + 1) / bins;
    const subset = normalized.filter(row => (
      row.confidence >= lower
      && (binIndex === bins - 1 ? row.confidence <= upper : row.confidence < upper)
    ));
    if (!subset.length) {
      return { bin: binIndex, lower, upper, n: 0, mean_confidence: null, accuracy: null, absolute_gap: null };
    }
    const confidence = mean(subset.map(row => row.confidence));
    const accuracy = mean(subset.map(row => row.correct ? 1 : 0));
    return {
      bin: binIndex,
      lower,
      upper,
      n: subset.length,
      mean_confidence: confidence,
      accuracy,
      absolute_gap: Math.abs(confidence - accuracy),
    };
  });

  const ece = table.reduce((sum, bin) => (
    sum + (bin.n / normalized.length) * (bin.absolute_gap ?? 0)
  ), 0);

  const overall = summarizeSubset(normalized);
  const withSupport = summarizeSubset(normalized.filter(row => row.support_present));
  const withoutSupport = summarizeSubset(normalized.filter(row => !row.support_present));

  const participantIds = [...new Set(normalized.map(row => row.participant_id))].sort();
  const byParticipant = Object.fromEntries(participantIds.map(participantId => [
    participantId,
    summarizeSubset(normalized.filter(row => row.participant_id === participantId)),
  ]));

  return {
    schema_version: 'vertexed-calibration-analysis-v1',
    input_sha256: createHash('sha256').update(JSON.stringify(normalized)).digest('hex'),
    overall: { ...overall, expected_calibration_error: ece },
    reliability_bins: table,
    support_strata: {
      with_support: withSupport,
      without_support: withoutSupport,
    },
    by_participant: byParticipant,
    interpretation_guard: (
      'Confidence calibration is descriptive of these scored items. Support presence is a stratum, '
      + 'not a randomized causal treatment unless the study design independently establishes that.'
    ),
    evidence_status: normalized.length >= 200 ? 'RESULT_READY' : 'EXPLORATORY_OR_INCOMPLETE',
  };
}
