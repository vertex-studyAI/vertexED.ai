import { createHash } from 'node:crypto';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
}

export function sha256Json(value) {
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

export function createRequestEvidence({ provider, model, temperature, maxTokens, messages }) {
  const request = { provider, model, temperature, maxTokens, messages };
  return {
    schema: 'vertexed.provider_request.v1',
    provider,
    model,
    temperature,
    maxTokens,
    requestSha256: sha256Json(request),
  };
}

export function createResponseEvidence(answer, { retainText = false } = {}) {
  if (typeof answer !== 'string') throw new TypeError('provider answer must be a string');
  return {
    responseSha256: createHash('sha256').update(answer).digest('hex'),
    responseChars: answer.length,
    responseRetained: retainText,
    ...(retainText ? { responseText: answer } : {}),
  };
}

export function compareDecisionRows(previous, current) {
  const before = new Map(previous.map(row => [row.id, row]));
  return current.map(row => {
    const prior = before.get(row.id);
    return {
      id: row.id,
      comparable: Boolean(prior),
      scoreChanged: Boolean(prior) && prior.score !== row.score,
      decisionChanged: Boolean(prior) && prior.passed !== row.passed,
      responseChanged: Boolean(prior) && prior.responseSha256 !== row.responseSha256,
    };
  });
}
