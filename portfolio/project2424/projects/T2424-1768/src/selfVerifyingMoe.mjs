function assertFinite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
}

function normalizeExperts(experts) {
  if (!Array.isArray(experts) || experts.length === 0) {
    throw new TypeError('experts must be a non-empty array');
  }

  const ids = new Set();
  return experts.map((expert, index) => {
    if (!expert || typeof expert.id !== 'string' || expert.id.trim() === '') {
      throw new TypeError(`expert ${index} must have a non-empty string id`);
    }
    if (ids.has(expert.id)) throw new TypeError(`duplicate expert id: ${expert.id}`);
    ids.add(expert.id);
    if (typeof expert.predict !== 'function') {
      throw new TypeError(`expert ${expert.id} must provide predict(sample)`);
    }
    if (typeof expert.verify !== 'function') {
      throw new TypeError(`expert ${expert.id} must provide verify({ sample, prediction })`);
    }
    return expert;
  });
}

function normalizeVerification(raw, expertId) {
  if (typeof raw === 'boolean') {
    return { accepted: raw, reason: raw ? 'accepted' : 'rejected' };
  }
  if (!raw || typeof raw !== 'object' || typeof raw.accepted !== 'boolean') {
    throw new TypeError(`expert ${expertId} verifier must return a boolean or { accepted, reason? }`);
  }
  if (raw.reason !== undefined && typeof raw.reason !== 'string') {
    throw new TypeError(`expert ${expertId} verifier reason must be a string when provided`);
  }
  return {
    accepted: raw.accepted,
    reason: raw.reason ?? (raw.accepted ? 'accepted' : 'rejected'),
  };
}

export function softmax(values) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('softmax values must be a non-empty array');
  }
  values.forEach((value, index) => assertFinite(value, `softmax value ${index}`));
  const maximum = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maximum));
  const denominator = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / denominator);
}

/**
 * Execute scalar experts, independently verify each returned value against the
 * expert's caller-supplied contract, and aggregate only accepted predictions.
 *
 * This is a contract-checking engine, not a proof system: a weak or circular
 * verifier can still accept a bad prediction. The returned audit record makes
 * every acceptance/rejection explicit so callers can fail closed.
 */
export function executeSelfVerifyingMoe({ sample, experts, router, minAccepted = 1 }) {
  const normalizedExperts = normalizeExperts(experts);
  if (typeof router !== 'function') throw new TypeError('router must be a function');
  if (!Number.isInteger(minAccepted) || minAccepted < 1 || minAccepted > normalizedExperts.length) {
    throw new TypeError('minAccepted must be an integer between 1 and the expert count');
  }

  const scores = router(sample, normalizedExperts);
  if (!Array.isArray(scores) || scores.length !== normalizedExperts.length) {
    throw new TypeError('router must return one finite score per expert');
  }
  scores.forEach((score, index) => assertFinite(score, `router score ${index}`));

  const audit = normalizedExperts.map((expert, index) => {
    const prediction = expert.predict(sample);
    assertFinite(prediction, `expert ${expert.id} prediction`);
    const verification = normalizeVerification(
      expert.verify({ sample, prediction, expertId: expert.id }),
      expert.id,
    );
    return {
      id: expert.id,
      index,
      score: scores[index],
      prediction,
      accepted: verification.accepted,
      reason: verification.reason,
    };
  });

  const accepted = audit.filter((entry) => entry.accepted);
  if (accepted.length < minAccepted) {
    return {
      prediction: null,
      exhausted: true,
      acceptedExperts: accepted.map(({ id }) => id),
      rejectedExperts: audit.filter((entry) => !entry.accepted).map(({ id }) => id),
      audit,
      weights: [],
    };
  }

  const weights = softmax(accepted.map(({ score }) => score));
  const prediction = accepted.reduce(
    (sum, entry, index) => sum + entry.prediction * weights[index],
    0,
  );

  return {
    prediction,
    exhausted: false,
    acceptedExperts: accepted.map(({ id }) => id),
    rejectedExperts: audit.filter((entry) => !entry.accepted).map(({ id }) => id),
    audit,
    weights,
  };
}

/**
 * Unverified reference used only as a negative/control baseline. It executes
 * every expert and combines all scalar predictions regardless of contracts.
 */
export function executeUnverifiedMoe({ sample, experts, router }) {
  const normalizedExperts = normalizeExperts(experts);
  if (typeof router !== 'function') throw new TypeError('router must be a function');
  const scores = router(sample, normalizedExperts);
  if (!Array.isArray(scores) || scores.length !== normalizedExperts.length) {
    throw new TypeError('router must return one finite score per expert');
  }
  scores.forEach((score, index) => assertFinite(score, `router score ${index}`));
  const predictions = normalizedExperts.map((expert) => {
    const prediction = expert.predict(sample);
    assertFinite(prediction, `expert ${expert.id} prediction`);
    return prediction;
  });
  const weights = softmax(scores);
  return {
    prediction: predictions.reduce((sum, value, index) => sum + value * weights[index], 0),
    weights,
  };
}
