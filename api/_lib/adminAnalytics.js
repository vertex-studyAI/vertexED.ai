const MAX_ROWS = 2_000;

export function normaliseAnalyticsDays(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return [7, 30, 90].includes(parsed) ? parsed : 30;
}

function safeToken(value, fallback = 'unknown') {
  return typeof value === 'string' && /^[a-z0-9_.:/-]{1,120}$/i.test(value) ? value : fallback;
}

function dateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) ? value.slice(0, 10) : null;
}

/** Aggregate a fixed privacy-safe projection. Prompts, answers and identities never enter this function. */
export function buildAdminAnalytics(rows, { days, generatedAt = new Date().toISOString(), truncated = false } = {}) {
  const records = Array.isArray(rows) ? rows.slice(0, MAX_ROWS) : [];
  const capabilities = new Map();
  const daily = new Map();
  let providerRuns = 0;
  let providerSuccesses = 0;
  let feedback = 0;
  let negativeFeedback = 0;
  let incorrectFeedback = 0;
  let failedEvents = 0;

  for (const row of records) {
    const capability = safeToken(row?.capability);
    const current = capabilities.get(capability) ?? { capability, events: 0, providerRuns: 0, providerSuccesses: 0, feedback: 0, negativeFeedback: 0, incorrectFeedback: 0, failedEvents: 0 };
    current.events += 1;
    if (row?.event_type === 'provider_run') {
      providerRuns += 1; current.providerRuns += 1;
      if (row.outcome === 'success') { providerSuccesses += 1; current.providerSuccesses += 1; }
    }
    if (row?.event_type === 'ai_feedback') {
      feedback += 1; current.feedback += 1;
      if (row.feedback === 'incorrect') { incorrectFeedback += 1; current.incorrectFeedback += 1; }
      if (row.feedback === 'incorrect' || row.feedback === 'not_helpful') { negativeFeedback += 1; current.negativeFeedback += 1; }
    }
    if (row?.outcome === 'failed') { failedEvents += 1; current.failedEvents += 1; }
    capabilities.set(capability, current);

    const date = dateKey(row?.recorded_at);
    if (date) {
      const point = daily.get(date) ?? { date, events: 0, failedEvents: 0, feedback: 0 };
      point.events += 1;
      if (row.outcome === 'failed') point.failedEvents += 1;
      if (row.event_type === 'ai_feedback') point.feedback += 1;
      daily.set(date, point);
    }
  }

  return {
    generatedAt,
    days: normaliseAnalyticsDays(days),
    truncated: Boolean(truncated),
    recordCount: records.length,
    metrics: { providerRuns, providerSuccesses, feedback, negativeFeedback, incorrectFeedback, failedEvents },
    capabilities: [...capabilities.values()].sort((left, right) => right.events - left.events || left.capability.localeCompare(right.capability)),
    daily: [...daily.values()].sort((left, right) => left.date.localeCompare(right.date)),
    privacy: 'Aggregate operational telemetry only. This view excludes learner identities, prompts, answers and saved study content.',
  };
}
