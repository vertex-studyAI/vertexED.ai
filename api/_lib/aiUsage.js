import { AsyncLocalStorage } from 'node:async_hooks';
import { createHash } from 'node:crypto';
import { getServerSupabaseConfig } from './serverSupabase.js';
import { fetchBufferedResponseWithTimeout } from './fetchWithTimeout.js';
import { AI_USAGE_POLICY, AiUsageError, preparePaidRequest, actualPaidCost, requireCurrentAiPolicy } from './aiUsagePolicy.js';

const requests = new AsyncLocalStorage();
const dispatches = new AsyncLocalStorage();
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const digest = value => createHash('sha256').update(value).digest('hex');
const finite = value => Number.isSafeInteger(value) && value >= 0;
const limits = () => ({ p_account_limit_microusd: AI_USAGE_POLICY.accountLimit, p_project_limit_microusd: AI_USAGE_POLICY.projectLimit, p_account_concurrency: AI_USAGE_POLICY.accountConcurrency, p_project_concurrency: AI_USAGE_POLICY.projectConcurrency });

async function usageRpc(name, args) {
  const { url, key } = getServerSupabaseConfig();
  if (!url || !key) throw new AiUsageError();
  const response = await fetchBufferedResponseWithTimeout(`${url.replace(/\/$/, '')}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args),
  }, 12_000, fetch, 64 * 1024);
  if (!response.ok) throw new AiUsageError();
  const data = await response.json();
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new AiUsageError();
  return data;
}

/** Trusted server/test entrypoint. Never accept these dependencies from HTTP. */
export function runAiUsageContext({ userId, operationId, requestFingerprint, rpc = usageRpc, now = Date.now, signal }, task) {
  if (!uuid.test(userId || '')) throw new AiUsageError();
  if (typeof operationId !== 'string' || !/^[\x21-\x7e]{8,128}$/.test(operationId)) throw new AiUsageError('AI_OPERATION_ID_REQUIRED', 400, 'A valid Idempotency-Key is required for this AI request.', 0);
  return requests.run({ userId, operationId, requestFingerprint, rpc, now, signal, dispatchIndex: 0, failure: null }, task);
}

/** Internal cancellation signal for non-provider work in the same request. */
export function getAiUsageSignal() { return requests.getStore()?.signal; }

export function sendAiUsageError(res, error) {
  const failure = error instanceof AiUsageError ? error : new AiUsageError();
  res.setHeader('Cache-Control', 'private, no-store');
  if (failure.retryAfter > 0) res.setHeader('Retry-After', String(failure.retryAfter));
  return res.status(failure.status).json({ error: failure.message, code: failure.code });
}

export async function runAiUsageRequest(req, res, user, routeKey, task) {
  const originalJson = res.json;
  const controller = new AbortController();
  const aborted = () => controller.abort(new Error('AI request cancelled by the caller.'));
  const closed = () => { if (!res.writableEnded && !res.finished) aborted(); };
  req.once?.('aborted', aborted);
  res.once?.('close', closed);
  if (req.aborted) aborted();
  let context;
  try {
    return await runAiUsageContext({ userId: user.id, operationId: req.headers?.['idempotency-key'], requestFingerprint: digest(JSON.stringify([req.method, routeKey, req.body ?? null])), signal: controller.signal }, async () => {
      context = requests.getStore();
      // Existing handlers may catch provider errors and return a local fallback.
      // A denied/ambiguous paid operation must retain its explicit error state.
      res.json = function (body) {
        if (!context.failure) return originalJson.call(this, body);
        this.setHeader('Cache-Control', 'private, no-store');
        if (context.failure.retryAfter > 0) this.setHeader('Retry-After', String(context.failure.retryAfter));
        this.status(context.failure.status);
        return originalJson.call(this, { error: context.failure.message, code: context.failure.code });
      };
      await task();
    });
  } catch (error) {
    if (error instanceof AiUsageError || context?.failure) return sendAiUsageError(res, context?.failure || error);
    throw error;
  } finally { res.json = originalJson; req.removeListener?.('aborted', aborted); res.removeListener?.('close', closed); }
}

function admissionError(result, now) {
  if (['duplicate', 'idempotency_conflict'].includes(result?.reason)) return new AiUsageError('AI_OPERATION_EXISTS', 409, 'This AI operation already exists. Check its outcome before submitting another request.', 0);
  if (['account_limit', 'project_limit'].includes(result?.reason)) return new AiUsageError('AI_BUDGET_EXHAUSTED', 429, 'The daily AI allowance has been reached.', Math.max(1, Math.ceil((Date.parse(result.resets_at) - now) / 1000)) || 60);
  if (['account_concurrency', 'project_concurrency'].includes(result?.reason)) return new AiUsageError('AI_CAPACITY_EXCEEDED', 429, 'AI requests are already in progress or awaiting a confirmed outcome.', 60);
  return new AiUsageError();
}

export async function fetchPaidProviderResponse({ capability, provider, model, url, options, timeoutMs = 30_000, fetchImpl = fetch }) {
  const context = requests.getStore();
  if (!context) throw new AiUsageError();
  if (context.failure) throw context.failure;
  const nested = dispatches.getStore();
  if (nested) {
    if (nested.used || nested.url !== url || nested.body !== options?.body) throw (context.failure = new AiUsageError());
    nested.used = true;
    return fetchBufferedResponseWithTimeout(url, options, timeoutMs, fetchImpl);
  }
  let reservationId;
  let dispatched = false;
  let finished = false;
  try {
    const prepared = preparePaidRequest({ capability, provider, model, url, options }, context.now());
    const signal = options?.signal && context.signal ? AbortSignal.any([options.signal, context.signal]) : options?.signal || context.signal;
    prepared.options.signal = signal;
    const operationId = `${context.operationId}:${context.dispatchIndex++}`;
    const result = await context.rpc('reserve_ai_usage', { p_user_id: context.userId, p_operation_id: operationId,
      p_request_fingerprint: digest(JSON.stringify([context.requestFingerprint, capability, provider, prepared.model, url, prepared.options.body])),
      p_capability: capability, p_provider: provider, p_model: prepared.model, p_policy_version: AI_USAGE_POLICY.version,
      p_reserved_microusd: prepared.reservedMicros, ...limits() });
    if (result?.allowed !== true) throw admissionError(result, context.now());
    if (result.reason !== 'reserved' || result.state !== 'reserved' || !uuid.test(result.reservation_id || '') || result.reserved_microusd !== prepared.reservedMicros) throw new AiUsageError();
    reservationId = result.reservation_id;
    if (signal?.aborted) {
      const released = await context.rpc('settle_ai_usage', { p_user_id: context.userId, p_reservation_id: reservationId, p_outcome: 'released', p_actual_microusd: null });
      finished = released?.ok === true && released.state === 'released';
      throw signal.reason;
    }
    const marked = await context.rpc('mark_ai_usage_dispatched', { p_user_id: context.userId, p_reservation_id: reservationId });
    if (marked?.allowed !== true || marked.reason !== 'dispatched' || marked.state !== 'dispatched') throw new AiUsageError();
    dispatched = true;
    const response = await dispatches.run({ url, body: prepared.options.body, used: false }, () => fetchBufferedResponseWithTimeout(url, prepared.options, timeoutMs, fetchImpl));
    let outcome = 'failed';
    let actual = null;
    if (response.ok) {
      // Reading a clone is bounded: the original has already been fully buffered
      // under the byte cap and deadline, and downstream retains its Response.
      actual = actualPaidCost(await response.clone().json(), prepared);
      outcome = 'succeeded';
    }
    const settled = await context.rpc('settle_ai_usage', { p_user_id: context.userId, p_reservation_id: reservationId, p_outcome: outcome, p_actual_microusd: actual });
    if (settled?.ok !== true || settled.state !== outcome || settled.charged_microusd !== (outcome === 'succeeded' ? actual : prepared.reservedMicros) || settled.reserved_microusd !== 0) throw new AiUsageError();
    finished = true;
    return response;
  } catch (error) {
    if (reservationId && dispatched && !finished) {
      try { await context.rpc('settle_ai_usage', { p_user_id: context.userId, p_reservation_id: reservationId, p_outcome: 'uncertain', p_actual_microusd: null }); } catch { /* Keep durable dispatched exposure if settlement is unavailable. */ }
    }
    context.failure = error instanceof AiUsageError ? error : new AiUsageError();
    throw error;
  }
}

export async function readAiUsage(userId, rpc = usageRpc, now = Date.now(), allowExpiredPolicy = false) {
  if (!allowExpiredPolicy) requireCurrentAiPolicy(now);
  if (!uuid.test(userId || '')) throw new AiUsageError();
  const data = await rpc('read_ai_usage', { p_user_id: userId, ...limits() });
  const fields = ['account_limit_microusd', 'account_used_microusd', 'account_reserved_microusd', 'account_remaining_microusd', 'account_active_count', 'account_carried_reserved_microusd', 'account_uncertain_count'];
  const observed = Date.parse(data.observed_at);
  const start = Date.parse(data.period_start);
  const reset = Date.parse(data.resets_at);
  if (fields.some(key => !finite(data[key])) || data.account_limit_microusd !== AI_USAGE_POLICY.accountLimit || !Number.isFinite(observed) || !Number.isFinite(start) || !Number.isFinite(reset) || start > observed || observed >= reset || reset - start !== 86_400_000 || new Date(start).toISOString().slice(11) !== '00:00:00.000Z' || data.account_remaining_microusd !== Math.max(0, data.account_limit_microusd - data.account_used_microusd - data.account_reserved_microusd) || typeof data.project_available !== 'boolean' || typeof data.account_capacity_blocked !== 'boolean' || data.account_capacity_blocked !== (data.account_active_count >= AI_USAGE_POLICY.accountConcurrency) || data.account_uncertain_count > data.account_active_count) throw new AiUsageError();
  return { currency: 'USD', policyVersion: AI_USAGE_POLICY.version,
    period: { startsAt: data.period_start, resetsAt: data.resets_at, timeZone: 'UTC' },
    account: { limitMicros: data.account_limit_microusd, usedMicros: data.account_used_microusd, reservedMicros: data.account_reserved_microusd, remainingMicros: data.account_remaining_microusd, carriedReservedMicros: data.account_carried_reserved_microusd },
    project: { available: data.project_available },
    concurrency: { accountLimit: AI_USAGE_POLICY.accountConcurrency, accountActive: data.account_active_count, accountUncertain: data.account_uncertain_count, accountBlocked: data.account_capacity_blocked } };
}

// Owner privacy controls remain usable when pricing review expires. This is
// read-only and cannot reserve/dispatch; report the historical policy state.
export async function readAccountAiUsage(userId, rpc = usageRpc, now = Date.now()) {
  let pricingPolicyActive = true;
  try { requireCurrentAiPolicy(now); } catch { pricingPolicyActive = false; }
  return { ...await readAiUsage(userId, rpc, now, true), pricingPolicyActive };
}
