function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function evidenceReliability(evidenceType) {
  switch (evidenceType) {
    case 'deterministic_correct':
    case 'deterministic_incorrect':
      return 1;
    case 'reviewed_constructed_response':
      return 0.85;
    case 'retrieval_success':
      return 0.7;
    case 'retrieval_failure':
      return 0.65;
    default:
      return 0.5;
  }
}

export function masteryPercent(state = {}) {
  const alpha = Number(state.alpha ?? 1);
  const beta = Number(state.beta ?? 1);
  return Math.round((alpha / (alpha + beta)) * 100);
}

export function applyEvidenceToState(current = {}, evidence = {}) {
  const previousAlpha = Number(current.alpha ?? 1);
  const previousBeta = Number(current.beta ?? 1);
  const reliability = clamp(
    Number(evidence.reliability_weight ?? evidenceReliability(evidence.evidence_type)),
    0.2,
    1,
  );
  const normalizedScore = clamp(Number(evidence.score_normalized ?? 0), 0, 1);

  const next = {
    alpha: previousAlpha + normalizedScore * reliability,
    beta: previousBeta + (1 - normalizedScore) * reliability,
    evidence_count: Number(current.evidence_count ?? 0) + 1,
    last_evidence_at: evidence.observed_at ?? new Date().toISOString(),
  };

  return {
    ...next,
    mastery_percent: masteryPercent(next),
  };
}

export function nextReviewAt(state = {}, evidence = {}) {
  const percent = masteryPercent(state);
  const evidenceCount = Number(state.evidence_count ?? 0);
  const now = new Date(evidence.observed_at ?? Date.now());
  let days = 1;

  if (percent >= 85 && evidenceCount >= 4) days = 14;
  else if (percent >= 70 && evidenceCount >= 3) days = 7;
  else if (percent >= 55) days = 3;

  if (Number(evidence.score_normalized ?? 0) < 0.5) {
    days = Math.min(days, 1);
  }

  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString();
}
