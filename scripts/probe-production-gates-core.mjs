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

  if (String(healthProbe?.httpCode ?? '000') !== '200') {
    return 'BLOCKED_DOMAIN_HEALTH_UNREACHABLE';
  }

  const domainRevision = healthProbe?.json?.revision;
  if (!domainRevision || !canonicalRevision) {
    return 'BLOCKED_DOMAIN_REVISION_UNCONFIRMED';
  }
  if (domainRevision !== canonicalRevision) {
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
  if (shallowCode !== '200' || shallowProbe?.json?.ok !== true) return 'BLOCKED_PROVIDER_HEALTH_CONTRACT';

  const revision = shallowProbe?.json?.revision;
  if (typeof revision !== 'string' || !/^[0-9a-f]{40}$/i.test(revision)) {
    return 'BLOCKED_PROVIDER_REVISION_UNCONFIRMED';
  }

  if (readinessProbe?.curlExit !== 0 || readinessCode === '000') return 'BLOCKED_PROVIDER_READINESS_UNREACHABLE';
  const checks = readinessProbe?.json?.checks;
  const allChecks = checks && typeof checks === 'object' && Object.values(checks).every(Boolean);
  if (
    readinessCode !== '200' ||
    readinessProbe?.json?.ok !== true ||
    readinessProbe?.json?.status !== 'ready' ||
    !allChecks
  ) {
    return 'BLOCKED_PROVIDER_DEGRADED';
  }

  return 'READY_PROVIDER_CANDIDATE';
}

export function providerCandidatePasses(verdict) {
  return verdict === 'READY_PROVIDER_CANDIDATE';
}
