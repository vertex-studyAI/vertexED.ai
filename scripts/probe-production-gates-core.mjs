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
