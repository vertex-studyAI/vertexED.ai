import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function evaluateAuditReport(report) {
  const vulnerabilities = report?.metadata?.vulnerabilities;
  if (!vulnerabilities || typeof vulnerabilities !== 'object' || Array.isArray(vulnerabilities)) {
    return { ok: false, retryable: true, reason: 'missing metadata.vulnerabilities' };
  }

  for (const severity of ['high', 'critical']) {
    const count = Number(vulnerabilities[severity]);
    if (!Number.isInteger(count) || count < 0) {
      return { ok: false, retryable: true, reason: `invalid ${severity} vulnerability count` };
    }
    if (count !== 0) {
      return { ok: false, retryable: false, reason: `${count} ${severity} production vulnerabilities` };
    }
  }

  return { ok: true, retryable: false, reason: 'no high or critical production vulnerabilities' };
}

export function parseAuditReport(text) {
  try {
    return { report: JSON.parse(text), error: null };
  } catch (error) {
    return { report: null, error: String(error?.message ?? error) };
  }
}

function integerEnv(name, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const raw = process.env[name];
  const value = raw == null || raw === '' ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new RangeError(`${name} must be an integer in [${min},${max}]`);
  }
  return value;
}

function npmInvocation(args) {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) return { command: process.execPath, args: [npmExecPath, ...args] };
  return { command: process.platform === 'win32' ? 'npm.cmd' : 'npm', args };
}

export function buildAuditArgs() {
  return [
    'audit',
    '--omit=dev',
    '--package-lock-only',
    '--audit-level=high',
    '--json',
    '--fetch-timeout=150000',
    '--fetch-retries=0',
  ];
}

export function runAuditAttempt({ timeoutMs, evidenceDir, attempt }) {
  const invocation = npmInvocation(buildAuditArgs());
  const result = spawnSync(invocation.command, invocation.args, {
    cwd: process.cwd(),
    env: process.env,
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 16 * 1024 * 1024,
  });

  mkdirSync(evidenceDir, { recursive: true });
  const stdout = String(result.stdout ?? '');
  const stderr = String(result.stderr ?? '');
  writeFileSync(resolve(evidenceDir, `attempt-${attempt}.stdout.json`), stdout, 'utf8');
  writeFileSync(resolve(evidenceDir, `attempt-${attempt}.stderr.log`), stderr, 'utf8');
  writeFileSync(resolve(evidenceDir, `attempt-${attempt}.status.txt`), `${result.status ?? ''}\n`, 'utf8');
  writeFileSync(resolve(evidenceDir, `attempt-${attempt}.signal.txt`), `${result.signal ?? ''}\n`, 'utf8');
  writeFileSync(resolve(evidenceDir, `attempt-${attempt}.error.txt`), `${result.error ? String(result.error.message ?? result.error) : ''}\n`, 'utf8');

  const timedOut = result.error?.code === 'ETIMEDOUT';
  if (timedOut) return { ok: false, retryable: true, reason: `audit attempt ${attempt} timed out`, stdout, stderr };

  const parsed = parseAuditReport(stdout);
  if (parsed.error) {
    return {
      ok: false,
      retryable: true,
      reason: `audit attempt ${attempt} returned invalid JSON: ${parsed.error}`,
      stdout,
      stderr,
    };
  }

  const evaluation = evaluateAuditReport(parsed.report);
  if (!evaluation.ok) return { ...evaluation, stdout, stderr };

  if (result.status !== 0) {
    return {
      ok: false,
      retryable: true,
      reason: `audit attempt ${attempt} returned status ${result.status} despite a clean high/critical report`,
      stdout,
      stderr,
    };
  }

  return { ok: true, retryable: false, reason: evaluation.reason, stdout, stderr };
}

export function runProductionAudit({
  attempts = integerEnv('VERTEXED_AUDIT_ATTEMPTS', 3, { min: 1, max: 3 }),
  timeoutMs = integerEnv('VERTEXED_AUDIT_TIMEOUT_MS', 180_000, { min: 30_000, max: 300_000 }),
  evidenceDir = resolve(process.env.VERTEXED_AUDIT_EVIDENCE_DIR ?? 'ci-evidence/npm-audit'),
} = {}) {
  let lastResult;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    lastResult = runAuditAttempt({ timeoutMs, evidenceDir, attempt });
    if (lastResult.ok) {
      writeFileSync(resolve(evidenceDir, 'result.txt'), `success\nattempt=${attempt}\n${lastResult.reason}\n`, 'utf8');
      return { ...lastResult, attempt };
    }

    const message = `[audit:prod] ${lastResult.reason}`;
    if (lastResult.retryable && attempt < attempts) {
      console.warn(`${message}; retrying with a fresh advisory request`);
      continue;
    }

    writeFileSync(resolve(evidenceDir, 'result.txt'), `failure\nattempt=${attempt}\n${lastResult.reason}\n`, 'utf8');
    throw new Error(lastResult.reason);
  }

  throw new Error(lastResult?.reason ?? 'production dependency audit failed without a result');
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
const thisPath = fileURLToPath(import.meta.url);
if (invokedPath === thisPath) {
  try {
    const result = runProductionAudit();
    console.log(`[audit:prod] PASS on attempt ${result.attempt}: ${result.reason}`);
  } catch (error) {
    console.error(`[audit:prod] FAIL: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}
