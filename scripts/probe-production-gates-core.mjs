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
