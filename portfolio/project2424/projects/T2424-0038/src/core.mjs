const DEFAULT_WEIGHTS = Object.freeze({
  evidence: 0.34,
  independence: 0.18,
  primary: 0.12,
  novelty: 0.12,
  impact: 0.12,
  freshness: 0.08,
  riskPenalty: 0.16
});

function unitInterval(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1) {
    throw new RangeError(`${label} must be finite and in [0, 1]`);
  }
  return number;
}

function nonNegative(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new RangeError(`${label} must be finite and >= 0`);
  }
  return number;
}

function normalizePublisher(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return '';

  const urlCandidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const hostname = new URL(urlCandidate).hostname
      .replace(/\.$/, '')
      .replace(/^www\./, '');
    if (hostname) return hostname;
  } catch {
    // Free-form publisher labels are allowed; normalize only obvious host aliases.
  }

  return raw.replace(/\.$/, '').replace(/^www\./, '');
}

function validateSource(source, index) {
  if (!source || typeof source !== 'object') {
    throw new TypeError(`sources[${index}] must be an object`);
  }
  const publisher = normalizePublisher(source.publisher);
  if (!publisher) throw new TypeError(`sources[${index}].publisher is required`);
  const evidence = unitInterval(source.evidence ?? 0.5, `sources[${index}].evidence`);
  return {
    publisher,
    evidence,
    primary: source.primary === true,
    sourceType: String(source.sourceType ?? 'secondary').trim().toLowerCase() || 'secondary'
  };
}

export function validateLead(lead) {
  if (!lead || typeof lead !== 'object') throw new TypeError('lead must be an object');
  const id = String(lead.id ?? '').trim();
  const title = String(lead.title ?? '').trim();
  const claim = String(lead.claim ?? '').trim();
  if (!id) throw new TypeError('lead.id is required');
  if (!title) throw new TypeError('lead.title is required');
  if (!claim) throw new TypeError('lead.claim is required');
  if (!Array.isArray(lead.sources) || lead.sources.length === 0) {
    throw new TypeError('lead.sources must be a non-empty array');
  }
  return {
    id,
    title,
    claim,
    sources: lead.sources.map(validateSource),
    novelty: unitInterval(lead.novelty ?? 0.5, 'lead.novelty'),
    impact: unitInterval(lead.impact ?? 0.5, 'lead.impact'),
    risk: unitInterval(lead.risk ?? 0.5, 'lead.risk'),
    ageHours: nonNegative(lead.ageHours ?? 0, 'lead.ageHours')
  };
}

export function evidenceProfile(leadInput) {
  const lead = validateLead(leadInput);
  const publishers = new Set(lead.sources.map((source) => source.publisher));
  const sourceTypes = new Set(lead.sources.map((source) => source.sourceType));
  const primaryCount = lead.sources.filter((source) => source.primary).length;
  const evidenceMean = lead.sources.reduce((sum, source) => sum + source.evidence, 0) / lead.sources.length;
  const independence = Math.min(1, publishers.size / 4);
  const typeDiversity = Math.min(1, sourceTypes.size / 3);
  const primaryCoverage = Math.min(1, primaryCount / 2);
  return {
    lead,
    independentPublishers: publishers.size,
    sourceTypeCount: sourceTypes.size,
    primaryCount,
    evidenceMean,
    independence,
    typeDiversity,
    primaryCoverage
  };
}

export function reportingBlockers(leadInput) {
  const profile = evidenceProfile(leadInput);
  const blockers = [];
  if (profile.independentPublishers < 2) {
    blockers.push('needs at least two independent publishers');
  }
  if (profile.lead.risk >= 0.7 && profile.independentPublishers < 3) {
    blockers.push('high-risk claim needs at least three independent publishers');
  }
  if (profile.lead.risk >= 0.7 && profile.primaryCount === 0) {
    blockers.push('high-risk claim needs at least one primary source');
  }
  if (profile.evidenceMean < 0.45) {
    blockers.push('mean evidence quality is below the minimum threshold');
  }
  return blockers;
}

export function freshnessScore(ageHours, halfLifeHours = 72) {
  const age = nonNegative(ageHours, 'ageHours');
  const halfLife = Number(halfLifeHours);
  if (!Number.isFinite(halfLife) || halfLife <= 0) {
    throw new RangeError('halfLifeHours must be finite and > 0');
  }
  return 2 ** (-age / halfLife);
}

export function scoreLead(leadInput, weights = DEFAULT_WEIGHTS) {
  const profile = evidenceProfile(leadInput);
  const blockers = reportingBlockers(profile.lead);
  const w = { ...DEFAULT_WEIGHTS, ...weights };
  for (const [key, value] of Object.entries(w)) {
    if (!Number.isFinite(value) || value < 0) throw new RangeError(`weight ${key} must be finite and >= 0`);
  }

  const evidence = 0.75 * profile.evidenceMean + 0.25 * profile.typeDiversity;
  const freshness = freshnessScore(profile.lead.ageHours);
  const raw =
    w.evidence * evidence +
    w.independence * profile.independence +
    w.primary * profile.primaryCoverage +
    w.novelty * profile.lead.novelty +
    w.impact * profile.lead.impact +
    w.freshness * freshness -
    w.riskPenalty * profile.lead.risk;

  return {
    id: profile.lead.id,
    title: profile.lead.title,
    score: Math.max(0, raw),
    decision: blockers.length === 0 ? 'REPORTABLE_CANDIDATE' : 'HOLD_FOR_VERIFICATION',
    blockers,
    evidence: {
      independentPublishers: profile.independentPublishers,
      sourceTypeCount: profile.sourceTypeCount,
      primaryCount: profile.primaryCount,
      evidenceMean: profile.evidenceMean,
      freshness
    }
  };
}

export function rankLeads(leads, options = {}) {
  if (!Array.isArray(leads) || leads.length === 0) {
    throw new TypeError('leads must be a non-empty array');
  }
  const scored = leads.map((lead) => scoreLead(lead, options.weights));
  return scored.sort((left, right) => {
    const decisionOrder = (left.decision === 'REPORTABLE_CANDIDATE' ? 0 : 1) -
      (right.decision === 'REPORTABLE_CANDIDATE' ? 0 : 1);
    if (decisionOrder !== 0) return decisionOrder;
    if (right.score !== left.score) return right.score - left.score;
    return left.id.localeCompare(right.id);
  });
}

export function buildDecisionLedger(leads, options = {}) {
  return rankLeads(leads, options).map((entry, index) => ({
    rank: index + 1,
    ...entry
  }));
}
