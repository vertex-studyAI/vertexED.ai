import {
  evidenceProfile,
  rankLeads,
  reportingBlockers,
  validateLead,
} from './core.mjs';

function normalizeLeads(leads) {
  if (!Array.isArray(leads) || leads.length === 0) {
    throw new TypeError('leads must be a non-empty array');
  }
  const normalized = leads.map(validateLead);
  const ids = new Set();
  for (const lead of normalized) {
    if (ids.has(lead.id)) throw new TypeError(`duplicate lead id: ${lead.id}`);
    ids.add(lead.id);
  }
  return normalized;
}

function decisionFirst(left, right) {
  const leftOrder = left.decision === 'REPORTABLE_CANDIDATE' ? 0 : 1;
  const rightOrder = right.decision === 'REPORTABLE_CANDIDATE' ? 0 : 1;
  return leftOrder - rightOrder;
}

export function rankRecencyBaseline(leadsInput) {
  const leads = normalizeLeads(leadsInput);
  return leads
    .map((lead) => ({
      id: lead.id,
      decision: 'REPORTABLE_CANDIDATE',
      rank_value: -lead.ageHours,
      risk: lead.risk,
    }))
    .sort((left, right) => right.rank_value - left.rank_value || left.id.localeCompare(right.id));
}

export function rankMeanEvidenceBaseline(leadsInput) {
  const leads = normalizeLeads(leadsInput);
  return leads
    .map((lead) => {
      const profile = evidenceProfile(lead);
      return {
        id: lead.id,
        decision: profile.evidenceMean >= 0.45 ? 'REPORTABLE_CANDIDATE' : 'HOLD_FOR_VERIFICATION',
        rank_value: profile.evidenceMean,
        risk: lead.risk,
      };
    })
    .sort((left, right) => {
      const decisionOrder = decisionFirst(left, right);
      if (decisionOrder !== 0) return decisionOrder;
      if (right.rank_value !== left.rank_value) return right.rank_value - left.rank_value;
      return left.id.localeCompare(right.id);
    });
}

export function rankHardBlockersBaseline(leadsInput) {
  const leads = normalizeLeads(leadsInput);
  return leads
    .map((lead) => ({
      id: lead.id,
      decision: reportingBlockers(lead).length === 0 ? 'REPORTABLE_CANDIDATE' : 'HOLD_FOR_VERIFICATION',
      rank_value: null,
      risk: lead.risk,
    }))
    .sort((left, right) => decisionFirst(left, right) || left.id.localeCompare(right.id));
}

export function rankCandidate(leadsInput) {
  const leads = normalizeLeads(leadsInput);
  const riskById = new Map(leads.map((lead) => [lead.id, lead.risk]));
  return rankLeads(leads).map((entry) => ({
    id: entry.id,
    decision: entry.decision,
    rank_value: entry.score,
    risk: riskById.get(entry.id),
  }));
}

function normalizeLabels(labelsInput, expectedIds) {
  if (!Array.isArray(labelsInput) || labelsInput.length === 0) {
    throw new TypeError('labels must be a non-empty array');
  }
  const labels = new Map();
  for (const row of labelsInput) {
    if (!row || typeof row !== 'object') throw new TypeError('each label row must be an object');
    const id = String(row.lead_id ?? '').trim();
    if (!id) throw new TypeError('label lead_id is required');
    if (!expectedIds.has(id)) throw new TypeError(`label references unknown lead id: ${id}`);
    if (labels.has(id)) throw new TypeError(`duplicate label lead_id: ${id}`);
    if (!['REPORTABLE', 'HOLD'].includes(row.label)) {
      throw new TypeError(`unsupported label for ${id}`);
    }
    labels.set(id, row.label);
  }
  if (labels.size !== expectedIds.size) {
    const missing = [...expectedIds].filter((id) => !labels.has(id));
    throw new TypeError(`labels must cover every frozen lead; missing: ${missing.join(', ')}`);
  }
  return labels;
}

function safeRatio(numerator, denominator) {
  return denominator === 0 ? null : numerator / denominator;
}

export function classificationMetrics(rankedRows, labelsInput) {
  if (!Array.isArray(rankedRows) || rankedRows.length === 0) {
    throw new TypeError('rankedRows must be a non-empty array');
  }
  const ids = new Set(rankedRows.map((row) => row.id));
  if (ids.size !== rankedRows.length) throw new TypeError('rankedRows must have unique ids');
  const labels = normalizeLabels(labelsInput, ids);

  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;
  let highRiskFp = 0;
  let highRiskTn = 0;

  for (const row of rankedRows) {
    const predictedPositive = row.decision === 'REPORTABLE_CANDIDATE';
    const actualPositive = labels.get(row.id) === 'REPORTABLE';
    if (predictedPositive && actualPositive) tp += 1;
    else if (predictedPositive && !actualPositive) {
      fp += 1;
      if (row.risk >= 0.7) highRiskFp += 1;
    } else if (!predictedPositive && !actualPositive) {
      tn += 1;
      if (row.risk >= 0.7) highRiskTn += 1;
    } else fn += 1;
  }

  const recall = safeRatio(tp, tp + fn);
  const specificity = safeRatio(tn, tn + fp);
  const precision = safeRatio(tp, tp + fp);
  const falsePromotionRate = safeRatio(fp, fp + tn);
  const falseHoldRate = safeRatio(fn, fn + tp);
  const balancedAccuracy = recall === null || specificity === null ? null : (recall + specificity) / 2;
  const f1 = precision === null || recall === null || precision + recall === 0
    ? null
    : (2 * precision * recall) / (precision + recall);
  const topKPrecision = (k) => {
    const count = Math.min(k, rankedRows.length);
    if (count === 0) return null;
    const reportable = rankedRows.slice(0, count).filter((row) => labels.get(row.id) === 'REPORTABLE').length;
    return reportable / count;
  };

  return {
    counts: { tp, fp, tn, fn },
    precision,
    recall,
    specificity,
    f1,
    false_promotion_rate: falsePromotionRate,
    false_hold_rate: falseHoldRate,
    balanced_accuracy: balancedAccuracy,
    top5_precision: topKPrecision(5),
    top10_precision: topKPrecision(10),
    decision_coverage: safeRatio(tp + fp, rankedRows.length),
    high_risk_negative_examples: highRiskFp + highRiskTn,
    high_risk_false_promotion_rate: safeRatio(highRiskFp, highRiskFp + highRiskTn),
  };
}

export function evaluateFrozenSystems(leadsInput, labelsInput) {
  const systems = {
    B0_RECENCY_ONLY: rankRecencyBaseline(leadsInput),
    B1_MEAN_EVIDENCE_ONLY: rankMeanEvidenceBaseline(leadsInput),
    B2_HARD_BLOCKERS_ONLY: rankHardBlockersBaseline(leadsInput),
    CANDIDATE_FULL_TRIAGE: rankCandidate(leadsInput),
  };
  return Object.fromEntries(
    Object.entries(systems).map(([name, rows]) => [name, {
      ranking: rows.map((row, index) => ({ rank: index + 1, ...row })),
      metrics: classificationMetrics(rows, labelsInput),
    }]),
  );
}
