const unavailable = () => new Error('AI usage is temporarily unavailable.');
const isAmount = value => Number.isSafeInteger(value) && value >= 0;

/** Accept only a complete current-period account balance; never infer missing usage as zero. */
export function parseAiUsage(value, now = Date.now()) {
  const account = value?.account;
  const period = value?.period;
  const concurrency = value?.concurrency;
  const startsAt = typeof period?.startsAt === 'string' ? Date.parse(period.startsAt) : NaN;
  const resetsAt = typeof period?.resetsAt === 'string' ? Date.parse(period.resetsAt) : NaN;
  if (value?.currency !== 'USD' || typeof value?.policyVersion !== 'string' || !value.policyVersion
    || period?.timeZone !== 'UTC' || !Number.isFinite(startsAt) || !Number.isFinite(resetsAt)
    || startsAt % 86_400_000 !== 0 || resetsAt - startsAt !== 86_400_000
    || now < startsAt || now >= resetsAt
    || !account || !['limitMicros', 'usedMicros', 'reservedMicros', 'remainingMicros', 'carriedReservedMicros'].every(key => isAmount(account[key]))
    || !Number.isSafeInteger(account.usedMicros + account.reservedMicros)
    || account.remainingMicros !== Math.max(0, account.limitMicros - account.usedMicros - account.reservedMicros)
    || typeof value?.project?.available !== 'boolean'
    || !isAmount(concurrency?.accountLimit) || !isAmount(concurrency?.accountActive) || !isAmount(concurrency?.accountUncertain)
    || typeof concurrency.accountBlocked !== 'boolean'
    || concurrency.accountBlocked !== (concurrency.accountActive >= concurrency.accountLimit)) throw unavailable();

  // Whitelist owner-visible fields, even if a future server accidentally sends project totals.
  return {
    period: { startsAt: new Date(startsAt).toISOString(), resetsAt: new Date(resetsAt).toISOString() },
    account: {
      limitMicros: account.limitMicros, usedMicros: account.usedMicros,
      reservedMicros: account.reservedMicros, remainingMicros: account.remainingMicros,
      carriedReservedMicros: account.carriedReservedMicros,
    },
    projectAvailable: value.project.available,
    concurrency: { accountLimit: concurrency.accountLimit, accountActive: concurrency.accountActive,
      accountUncertain: concurrency.accountUncertain, accountBlocked: concurrency.accountBlocked },
  };
}

export function formatAiUsageAmount(micros) {
  if (!isAmount(micros)) throw unavailable();
  return `USD ${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(micros / 1_000_000)}`;
}

export function formatAiUsageReset(iso) {
  const instant = new Date(iso);
  if (!Number.isFinite(instant.getTime())) throw unavailable();
  return `${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' }).format(instant)} UTC`;
}

/** Bound both response headers and body, including fetch implementations that ignore abort. */
export async function loadAiUsage(fetcher, { signal, timeoutMs = 12_000, now = Date.now } = {}) {
  const controller = new AbortController();
  let timer;
  let rejectCancellation;
  const cancellation = new Promise((_, reject) => { rejectCancellation = reject; });
  const cancel = () => {
    controller.abort();
    rejectCancellation(unavailable());
  };
  if (signal?.aborted) throw unavailable();
  signal?.addEventListener('abort', cancel, { once: true });
  timer = setTimeout(cancel, timeoutMs);
  try {
    return await Promise.race([
      Promise.resolve().then(async () => {
        const response = await fetcher('/api/ai-usage', { method: 'GET', cache: 'no-store', signal: controller.signal });
        if (response.status !== 200) throw unavailable();
        return parseAiUsage(await response.json(), now());
      }),
      cancellation,
    ]);
  } catch {
    throw unavailable();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}
