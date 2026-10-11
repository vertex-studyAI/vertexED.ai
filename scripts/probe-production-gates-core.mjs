const V3_READINESS_CHECKS = [
  'authentication', 'waitlist', 'coreAi', 'plannerAi', 'durableRateLimiting',
  'databaseConnection', 'atomicRateLimitRpc', 'learnerStateStorage',
  'batchLearnerStateSync', 'examSessionStorage', 'observabilityStorage',
  'singletonIntegrity',
];

// v4 is the separately reviewed readiness successor in PR #1070. Recognizing
// its complete payload does not apply its migrations or alter the live API.
const READINESS_CHECKS_BY_CONTRACT = {
  '3': V3_READINESS_CHECKS,
  '4': [...V3_READINESS_CHECKS, 'expiringHashedInvites', 'automaticTimestamps'],
};

function fullRevision(value) {
  return typeof value === 'string' && /^[0-9a-f]{40}$/i.test(value)
    ? value.toLowerCase()
    : null;
}

function isHealthyPayload(payload, status) {
  return payload?.ok === true && payload?.service === 'vertexed'
    && payload?.status === status
    && typeof payload?.healthContract === 'string'
    && Object.hasOwn(READINESS_CHECKS_BY_CONTRACT, payload.healthContract);
}

function hasCompleteReadiness(payload) {
  const checks = payload?.checks;
  const required = READINESS_CHECKS_BY_CONTRACT[payload?.healthContract];
  return Array.isArray(required)
    && checks !== null && typeof checks === 'object' && !Array.isArray(checks)
    && required.every((key) => Object.hasOwn(checks, key) && checks[key] === true)
    && Object.values(checks).every((value) => value === true)
    && !payload.databaseError && payload.detail !== 'redacted';
}

export function classifyAgentsDeployment(probe) {
  const httpCode = String(probe?.httpCode ?? '000');
  const curlExit = probe?.curlExit;

  if (curlExit === 0 && httpCode === '401') {
    return 'LIVE_AUTH_REQUIRED';
  }
  if (curlExit === 0 && httpCode === '200') {
    return 'BLOCKED_UNAUTHENTICATED_ACCESS';
  }
  if (httpCode === '404') {
    return 'NOT_IN_PRODUCTION';
  }
  if (curlExit !== 0 || httpCode === '000') {
    return 'UNREACHABLE';
  }
  return `HTTP_${httpCode}`;
}

export function agentsGatePasses(verdict) {
  return verdict === 'LIVE_AUTH_REQUIRED';
}

export function classifyCanonicalDomain({ rootClass, healthProbe, canonicalRevision }) {
  if (rootClass !== 'HTTP_REACHABLE') {
    if (rootClass === 'TLS_FAIL_BEFORE_HTTP') return 'BLOCKED_TLS_FAIL_BEFORE_HTTP';
    if (rootClass === 'DNS_NXDOMAIN_OR_EMPTY') return 'BLOCKED_DNS_EMPTY';
    return `BLOCKED_${rootClass}`;
  }

  if (healthProbe?.curlExit !== 0 || String(healthProbe?.httpCode ?? '000') !== '200') {
    return 'BLOCKED_DOMAIN_HEALTH_UNREACHABLE';
  }

  if (!isHealthyPayload(healthProbe?.json, 'alive')) {
    return 'BLOCKED_DOMAIN_HEALTH_CONTRACT';
  }

  const domainRevision = fullRevision(healthProbe?.json?.revision);
  const referenceRevision = fullRevision(canonicalRevision);
  if (!domainRevision || !referenceRevision) {
    return 'BLOCKED_DOMAIN_REVISION_UNCONFIRMED';
  }
  if (domainRevision !== referenceRevision) {
    return 'BLOCKED_DOMAIN_REVISION_MISMATCH';
  }

  return 'READY_CANONICAL_DOMAIN';
}

export function canonicalDomainGatePasses(verdict) {
  return verdict === 'READY_CANONICAL_DOMAIN';
}


export function classifyProviderCandidate({ shallowProbe, readinessProbe }) {
  const shallowCode = String(shallowProbe?.httpCode ?? '000');
  const readinessCode = String(readinessProbe?.httpCode ?? '000');
  if (shallowProbe?.curlExit !== 0 || shallowCode === '000') return 'BLOCKED_PROVIDER_UNREACHABLE';
  if (shallowCode !== '200' || !isHealthyPayload(shallowProbe?.json, 'alive')) return 'BLOCKED_PROVIDER_HEALTH_CONTRACT';

  const revision = fullRevision(shallowProbe?.json?.revision);
  if (!revision) {
    return 'BLOCKED_PROVIDER_REVISION_UNCONFIRMED';
  }

  if (readinessProbe?.curlExit !== 0 || readinessCode === '000') return 'BLOCKED_PROVIDER_READINESS_UNREACHABLE';
  const readinessRevision = fullRevision(readinessProbe?.json?.revision);
  if (!readinessRevision) return 'BLOCKED_PROVIDER_READINESS_REVISION_UNCONFIRMED';
  if (readinessRevision !== revision) return 'BLOCKED_PROVIDER_READINESS_REVISION_MISMATCH';
  if (readinessProbe?.json?.healthContract !== shallowProbe?.json?.healthContract) {
    return 'BLOCKED_PROVIDER_READINESS_CONTRACT_MISMATCH';
  }
  if (
    readinessCode !== '200' ||
    !isHealthyPayload(readinessProbe?.json, 'ready') ||
    !hasCompleteReadiness(readinessProbe?.json)
  ) {
    return 'BLOCKED_PROVIDER_DEGRADED';
  }

  return 'READY_PROVIDER_CANDIDATE';
}

export function providerCandidatePasses(verdict) {
  return verdict === 'READY_PROVIDER_CANDIDATE';
}

export function classifyReadinessGate({ shallowProbe, readinessProbe }) {
  const verdict = classifyProviderCandidate({ shallowProbe, readinessProbe });
  if (providerCandidatePasses(verdict)) return 'READY';
  if (readinessProbe?.json?.databaseError === 'readiness_rpc_missing') {
    return 'BLOCKED_READINESS_RPC_MISSING';
  }
  if (readinessProbe?.json?.checks?.durableRateLimiting === false) {
    return 'BLOCKED_MISSING_WAITLIST_RATE_LIMIT_SALT_OR_DEGRADED';
  }
  return verdict;
}
