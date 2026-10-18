import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { formatAiUsageAmount, formatAiUsageReset, loadAiUsage, parseAiUsage } from '../src/lib/aiUsage.mjs';

const fixture = (changes = {}) => {
  const startsAt = Math.floor(Date.now() / 86_400_000) * 86_400_000;
  return {
    currency: 'USD', policyVersion: 'beta-usd-2026-10-16-v1',
    period: { startsAt: new Date(startsAt).toISOString(), resetsAt: new Date(startsAt + 86_400_000).toISOString(), timeZone: 'UTC' },
    account: { limitMicros: 1_000_000, usedMicros: 200_000, reservedMicros: 100_000, remainingMicros: 700_000, carriedReservedMicros: 0 },
    project: { available: true }, concurrency: { accountLimit: 2, accountActive: 1, accountUncertain: 0, accountBlocked: false }, ...changes,
  };
};
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const response = value => ({ status: 200, json: async () => value });

test('valid account usage is normalized without project aggregate or other unknown fields', () => {
  const value = fixture({ project: { available: false, usedMicros: 9_000_000, otherUser: 'private' } });
  const parsed = parseAiUsage(value);
  assert.deepEqual(parsed.account, value.account);
  assert.equal(parsed.projectAvailable, false);
  assert.doesNotMatch(JSON.stringify(parsed), /9000000|private|otherUser/);
});

test('incomplete, nonfinite, negative, unsafe and incoherent amounts cannot become a zero or available balance', () => {
  for (const account of [undefined, {}, { ...fixture().account, usedMicros: -1 },
    { ...fixture().account, remainingMicros: NaN }, { ...fixture().account, reservedMicros: Number.MAX_SAFE_INTEGER + 1 },
    { ...fixture().account, usedMicros: '200000' }, { ...fixture().account, remainingMicros: 1 },
    { limitMicros: 1, usedMicros: Number.MAX_SAFE_INTEGER, reservedMicros: Number.MAX_SAFE_INTEGER, remainingMicros: 0, carriedReservedMicros: 0 }]) {
    assert.throws(() => parseAiUsage(fixture({ account })), /temporarily unavailable/);
  }
  for (const value of [null, {}, '<html>upstream error</html>', fixture({ project: {} }), fixture({ currency: 'EUR' }),
    fixture({ concurrency: { ...fixture().concurrency, accountActive: -1 } })]) assert.throws(() => parseAiUsage(value));
});

test('lowered or zero policy limits retain prior usage and report exhausted capacity rather than malformed data', () => {
  for (const limitMicros of [100_000, 0]) {
    const parsed = parseAiUsage(fixture({
      account: { limitMicros, usedMicros: 200_000, reservedMicros: 100_000, remainingMicros: 0, carriedReservedMicros: 300_000 },
      concurrency: { accountLimit: 1, accountActive: 2, accountUncertain: 1, accountBlocked: true },
    }));
    assert.equal(parsed.account.remainingMicros, 0);
    assert.equal(parsed.account.usedMicros, 200_000);
    assert.equal(parsed.concurrency.accountActive, 2);
  }
});

test('UTC daily periods must be current and complete', () => {
  const value = fixture();
  const start = Date.parse(value.period.startsAt), reset = Date.parse(value.period.resetsAt);
  assert.doesNotThrow(() => parseAiUsage(value, start));
  assert.throws(() => parseAiUsage(value, start - 1));
  assert.throws(() => parseAiUsage(value, reset));
  for (const period of [{ ...value.period, timeZone: 'local' }, { ...value.period, resetsAt: 'invalid' },
    { ...value.period, startsAt: new Date(start + 1).toISOString() }]) assert.throws(() => parseAiUsage(fixture({ period })));
});

test('micro-dollar formatting never rounds a positive balance down to zero and reset is explicitly UTC', () => {
  assert.equal(formatAiUsageAmount(1), 'USD 0.000001');
  assert.equal(formatAiUsageAmount(1_000_000), 'USD 1.00');
  assert.equal(formatAiUsageAmount(0), 'USD 0.00');
  assert.equal(formatAiUsageReset('2026-10-17T00:00:00.000Z'), '17 Oct 2026, 00:00 UTC');
  assert.throws(() => formatAiUsageAmount(-1));
});

test('usage requests use owner endpoint without a supplied identity or cache', async () => {
  let request;
  const result = await loadAiUsage(async (url, options) => { request = { url, options }; return response(fixture()); });
  assert.equal(request.url, '/api/ai-usage');
  assert.equal(request.options.method, 'GET');
  assert.equal(request.options.cache, 'no-store');
  assert.equal(request.options.body, undefined);
  assert.equal(result.account.remainingMicros, 700_000);
});

test('outage and malformed response bodies never masquerade as quota exhaustion', async () => {
  for (const result of [{ status: 503, json: async () => ({ error: 'private dependency information' }) },
    { status: 429, json: async () => ({ code: 'AI_BUDGET_EXHAUSTED' }) },
    { status: 200, json: async () => { throw new Error('private malformed upstream body'); } }, response({})]) {
    await assert.rejects(loadAiUsage(async () => result), { message: 'AI usage is temporarily unavailable.' });
  }
});

test('stalled headers and bodies stop at the deadline even when fetch ignores abort', async () => {
  for (const fetcher of [() => new Promise(() => {}), async () => ({ status: 200, json: () => new Promise(() => {}) })]) {
    let requestSignal;
    await assert.rejects(loadAiUsage((url, options) => { requestSignal = options.signal; return fetcher(); }, { timeoutMs: 5 }), /temporarily unavailable/);
    assert.equal(requestSignal.aborted, true);
  }
});

test('cancelling an old account request aborts body consumption without waiting for it', async () => {
  const controller = new AbortController();
  let requestSignal;
  const pending = loadAiUsage(async (url, options) => { requestSignal = options.signal; return { status: 200, json: () => new Promise(() => {}) }; }, { signal: controller.signal });
  await Promise.resolve();
  controller.abort();
  await assert.rejects(pending, /temporarily unavailable/);
  assert.equal(requestSignal.aborted, true);
});

const toModule = code => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
let harnessId = 0;
async function withUsage(fetcher, verify) {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/user-settings' });
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const timers = new Map(); let timerId = 0;
  dom.window.setTimeout = callback => { const id = ++timerId; timers.set(id, () => { timers.delete(id); callback(); }); return id; };
  dom.window.clearTimeout = id => timers.delete(id);
  const requests = [];
  globalThis.__usageTestFetch = (...args) => { requests.push(args); return fetcher(...args); };
  const mock = toModule(`export const authFetch = (...args) => globalThis.__usageTestFetch(...args); // ${++harnessId}`);
  let code = ts.transpileModule(fs.readFileSync('src/components/AiUsageSettings.tsx', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  for (const name of ['react', 'react/jsx-runtime']) code = code.replaceAll(`'${name}'`, JSON.stringify(import.meta.resolve(name))).replaceAll(`"${name}"`, JSON.stringify(import.meta.resolve(name)));
  code = code.replaceAll("'@/lib/apiAuth'", JSON.stringify(mock)).replaceAll("'@/lib/aiUsage.mjs'", JSON.stringify(pathToFileURL(`${process.cwd()}/src/lib/aiUsage.mjs`).href));
  const { default: Usage } = await import(toModule(code));
  const root = createRoot(dom.window.document.getElementById('root'));
  const render = accountId => act(async () => root.render(React.createElement(Usage, { accountId })));
  try {
    await render('account-a');
    await verify({ dom, requests, render, timers, text: () => dom.window.document.body.textContent });
  } finally {
    await act(async () => root.unmount());
    assert.equal(timers.size, 0, 'reset timer must be cleaned up');
    dom.window.close(); delete globalThis.window; delete globalThis.document;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT; delete globalThis.__usageTestFetch;
  }
}

test('usage screen shows account amounts and UTC reset without exposing project totals', () => withUsage(async () => response(fixture({ project: { available: true, usedMicros: 9_999_999, secret: 'another account' } })), ({ text, dom }) => {
  for (const label of ['Daily account limit', 'Used', 'Reserved', 'Remaining', 'USD 1.00', 'USD 0.20', 'USD 0.10', 'USD 0.70', 'UTC']) assert.ok(text().includes(label), label);
  assert.match(text(), /awaiting a confirmed outcome remain reserved/);
  assert.doesNotMatch(text(), /9.999999|another account/);
  assert.equal(dom.window.document.querySelector('button').disabled, false);
}));

test('quota exhaustion and shared-service unavailability have distinct truthful states', async () => {
  await withUsage(async () => response(fixture({ account: { limitMicros: 1_000_000, usedMicros: 900_000, reservedMicros: 100_000, remainingMicros: 0, carriedReservedMicros: 0 } })), ({ text }) => {
    assert.match(text(), /fully used or reserved/); assert.match(text(), /USD 0.00/); assert.doesNotMatch(text(), /temporarily unavailable/);
  });
  await withUsage(async () => response(fixture({ project: { available: false } })), ({ text }) => {
    assert.match(text(), /shared AI allowance is unavailable/); assert.match(text(), /USD 0.70/); assert.doesNotMatch(text(), /fully used or reserved/);
  });
});

test('unavailable usage shows no invented balances and retry recovers without navigating', async () => {
  let fail = true;
  await withUsage(async () => fail ? { status: 503 } : response(fixture()), async ({ text, dom, requests }) => {
    assert.match(text(), /temporarily unavailable/); assert.doesNotMatch(text(), /USD 0.00|Daily account limit/);
    fail = false;
    await act(async () => dom.window.document.querySelector('button').click());
    assert.match(text(), /USD 0.70/); assert.equal(requests.length, 2);
    assert.equal(dom.window.location.pathname, '/user-settings');
  });
});

test('switching accounts hides prior balances and rejects a late response from the old account', async () => {
  const pending = deferred(); let count = 0;
  await withUsage(async () => ++count === 1 ? pending.promise : response(fixture({ account: { limitMicros: 1_000_000, usedMicros: 600_000, reservedMicros: 0, remainingMicros: 400_000, carriedReservedMicros: 0 } })), async ({ render, text, requests }) => {
    assert.match(text(), /Checking your account/);
    await render('account-b');
    assert.equal(requests[0][1].signal.aborted, true);
    assert.match(text(), /USD 0.40/);
    await act(async () => pending.resolve(response(fixture())));
    assert.match(text(), /USD 0.40/); assert.doesNotMatch(text(), /USD 0.70/);
    await render(null);
    assert.doesNotMatch(text(), /USD 0.40/); assert.equal(requests.length, 2);
  });
});

test('earlier-day reservations stay separate from today’s balance and can continue to block request slots', () => withUsage(async () => response(fixture({
  account: { ...fixture().account, carriedReservedMicros: 500_000 },
  concurrency: { accountLimit: 2, accountActive: 2, accountUncertain: 1, accountBlocked: true },
})), ({ text }) => {
  assert.match(text(), /held request must be resolved/);
  assert.match(text(), /Reserved from earlier days: USD 0.50/);
  assert.match(text(), /Requests awaiting confirmation: 1/);
  assert.match(text(), /USD 0.70/);
  assert.match(text(), /still hold request slots after the daily reset/);
}));

test('missing carried-reservation or capacity fields fail closed instead of inventing zeroes', () => {
  const value = fixture(); delete value.account.carriedReservedMicros;
  assert.throws(() => parseAiUsage(value));
  for (const field of ['accountUncertain', 'accountBlocked']) {
    const missing = fixture(); delete missing.concurrency[field];
    assert.throws(() => parseAiUsage(missing));
  }
  assert.throws(() => parseAiUsage(fixture({ concurrency: { ...fixture().concurrency, accountBlocked: true } })));
});

test('UTC rollover refreshes the balance and retains the server’s unresolved earlier-day exposure', () => withUsage(async () => response(fixture({
  account: { ...fixture().account, carriedReservedMicros: 500_000 },
})), async ({ timers, requests, text }) => {
  assert.equal(timers.size, 1);
  const actualNow = Date.now;
  const reset = Date.parse(fixture().period.resetsAt);
  try {
    Date.now = () => reset;
    await act(async () => [...timers.values()][0]());
    assert.equal(requests.length, 2);
    assert.match(text(), /Reserved from earlier days: USD 0.50/);
    assert.ok(text().includes(formatAiUsageReset(new Date(reset + 86_400_000).toISOString())));
    assert.equal(timers.size, 1);
  } finally { Date.now = actualNow; }
}));

test('refresh clears old figures while loading and a failed refresh cannot leave an available balance', async () => {
  const pending = deferred(); let count = 0;
  await withUsage(async () => ++count === 1 ? response(fixture()) : pending.promise, async ({ text, dom }) => {
    await act(async () => dom.window.document.querySelector('button').click());
    assert.match(text(), /Checking your account/); assert.doesNotMatch(text(), /USD 0.70/);
    await act(async () => pending.resolve({ status: 503 }));
    assert.match(text(), /temporarily unavailable/); assert.doesNotMatch(text(), /USD 0.70/);
  });
});
