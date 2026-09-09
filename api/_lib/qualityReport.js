function ratio(numerator, denominator) {
  return denominator > 0 ? Number((numerator / denominator).toFixed(4)) : null;
}

function safeCapability(value) {
  return typeof value === 'string' && /^[a-z0-9_.:/-]{1,120}$/.test(value) ? value : 'unknown';
}

export function buildQualityReport(events, gates, { generatedAt = new Date().toISOString(), truncated = false } = {}) {
  const rows = Array.isArray(events) ? events : [];
  const providerRuns = rows.filter((row) => row?.event_type === 'provider_run');
  const feedback = rows.filter((row) => row?.event_type === 'ai_feedback');
  const providerSuccesses = providerRuns.filter((row) => row.outcome === 'success').length;
  const incorrect = feedback.filter((row) => row.feedback === 'incorrect').length;
  const negative = feedback.filter((row) => ['not_helpful', 'incorrect'].includes(row.feedback)).length;
  const byCapability = {};

  for (const row of rows) {
    const capability = safeCapability(row?.capability);
    const current = byCapability[capability] ?? { events: 0, providerRuns: 0, providerFailures: 0, feedback: 0, incorrect: 0 };
    current.events += 1;
    if (row?.event_type === 'provider_run') {
      current.providerRuns += 1;
      if (row.outcome !== 'success') current.providerFailures += 1;
    }
    if (row?.event_type === 'ai_feedback') {
      current.feedback += 1;
      if (row.feedback === 'incorrect') current.incorrect += 1;
    }
    byCapability[capability] = current;
  }

  const metrics = {
    eventCount: rows.length,
    providerRunCount: providerRuns.length,
    feedbackCount: feedback.length,
    providerSuccessRate: ratio(providerSuccesses, providerRuns.length),
    incorrectFeedbackRate: ratio(incorrect, feedback.length),
    negativeFeedbackRate: ratio(negative, feedback.length),
  };
  const sufficientEvidence = !truncated
    && metrics.providerRunCount >= gates.minimumProviderRuns
    && metrics.feedbackCount >= gates.minimumFeedbackEvents;
  const passed = sufficientEvidence
    && metrics.providerSuccessRate >= gates.providerSuccessRateMin
    && metrics.incorrectFeedbackRate <= gates.incorrectFeedbackRateMax
    && metrics.negativeFeedbackRate <= gates.negativeFeedbackRateMax;

  return {
    contractVersion: 'vertexed.pilot-quality.v1',
    gateVersion: gates.gateVersion,
    generatedAt,
    status: sufficientEvidence ? (passed ? 'PASS' : 'FAIL') : 'INSUFFICIENT_EVIDENCE',
    truncated,
    metrics,
    gates,
    byCapability,
    claimBoundary: 'Operational pilot telemetry only. This report does not establish learning efficacy or causal educational impact.',
  };
}
