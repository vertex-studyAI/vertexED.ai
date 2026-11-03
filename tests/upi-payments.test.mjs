import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseUpiCreditAlert } from '../api/_lib/upiAlertParser.js';
import { buildUpiUri, getPaymentConfig, isValidAlertSecret, normaliseUtr, publicOrder } from '../api/_lib/upiPayments.js';
import alertHandler from '../api/_handlers/payment-alert.js';
import paymentHandler from '../api/_handlers/payment.js';
import { createMocks } from './helpers/mock-http.mjs';

const SECRET = 'a'.repeat(48);
const USER = '11111111-1111-4111-8111-111111111111';
const ORDER = '33333333-3333-4333-8333-333333333333';

function withEnv(t, values) {
  for (const [key, value] of Object.entries(values)) {
    const previous = process.env[key];
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
    t.after(() => { if (previous === undefined) delete process.env[key]; else process.env[key] = previous; });
  }
}

test('credit alerts from common bank formats yield the amount in paise and the UTR', () => {
  const cases = [
    ['Dear Customer, Rs.199.37 has been credited to account **1234 by VPA asha@okaxis ASHA on 23-10-26. Your UPI transaction reference number is 612345678901. Thank you for banking with us.', 19937, '612345678901'],
    ['Received Rs.1,999.05 in your Kotak Bank A/c X1234 from asha@ybl on 23-10-26.UPI Ref:612345678902.', 199905, '612345678902'],
    ['Your A/C XXXXX123456 has credit by Rs 199.40 on 23Oct26 transfer from ASHA Ref No 612345678903 -SBI', 19940, '612345678903'],
    ['ICICI Bank Account XX123 credited with INR 199.08 on 23-Oct-26. Info: UPI:612345678904. Available Balance is INR 12,345.67.', 19908, '612345678904'],
    ['INR 199.11 credited to A/c no. XX1234 on 23-10-26 at 10:02:11 IST. Info- UPI/P2A/612345678905/ASHA KUMAR', 19911, '612345678905'],
    ['<p>Rs.&nbsp;199.50 has been <b>credited</b> to your account. RRN: 612345678906</p>', 19950, '612345678906'],
  ];
  for (const [text, amountPaise, utr] of cases) {
    assert.deepEqual(parseUpiCreditAlert(text), { ok: true, amountPaise, utr }, text);
  }
});

test('alerts that are not unambiguous credits are rejected, never guessed', () => {
  assert.equal(parseUpiCreditAlert('Rs.199.37 has been debited from account **1234 to VPA shop@okaxis. UPI Ref 612345678901').reason, 'debit_alert');
  assert.equal(parseUpiCreditAlert('Your OTP is 123456. Rs 199.00').reason, 'not_a_credit_alert');
  assert.equal(parseUpiCreditAlert('Rs 199.37 credited. Ref 612345678901 and 612345678902').ok, true);
  assert.equal(parseUpiCreditAlert('Rs 199.37 credited 612345678901 612345678902').reason, 'reference_not_found');
  assert.equal(parseUpiCreditAlert('Amount credited. UPI Ref 612345678901').reason, 'amount_not_found');
  // The balance is skipped; the first payment amount is used.
  assert.equal(parseUpiCreditAlert('Avl Bal Rs 5,000.00. Rs 199.37 credited. UPI Ref 612345678901').amountPaise, 19937);
  assert.equal(parseUpiCreditAlert('').reason, 'empty');
  // "Customers 1800" is not an amount of Rs 1800.
  assert.equal(parseUpiCreditAlert('Dear Customers 1800 202 6161 is our helpline. Rs.199.37 has been credited. UPI Ref 612345678901').amountPaise, 19937);
  assert.equal(parseUpiCreditAlert('Interest Rs 199.37 credited. UPI Ref 612345678901').amountPaise, 19937);
});

test('UPI links carry the exact reserved amount and stay within app limits', () => {
  const uri = buildUpiUri({ vpa: 'owner@okhdfcbank', payeeName: 'Vertex ED', amountPaise: 19937, note: 'VertexED 33333333' });
  // '@' stays literal: some UPI apps reject pa=owner%40okhdfcbank.
  assert.equal(uri, 'upi://pay?pa=owner@okhdfcbank&pn=Vertex%20ED&am=199.37&cu=INR&tn=VertexED%2033333333');
  assert.equal(buildUpiUri({ vpa: 'a.b@ok', payeeName: 'A&B=C', amountPaise: 100 }), 'upi://pay?pa=a.b@ok&pn=A%26B%3DC&am=1.00&cu=INR');
  const order = publicOrder({ id: ORDER, plan: 'monthly', status: 'pending', amount_paise: 19905, expires_at: new Date(Date.now() - 1).toISOString() },
    { vpa: 'owner@okhdfcbank', payeeName: 'VertexED' });
  assert.equal(order.status, 'expired');
  assert.equal(order.amount, '199.05');
});

test('payment configuration requires a valid UPI ID and sane plan prices', () => {
  assert.equal(getPaymentConfig({}).configured, false);
  assert.equal(getPaymentConfig({ UPI_PAYEE_VPA: 'not a vpa' }).configured, false);
  assert.equal(getPaymentConfig({ UPI_PAYEE_VPA: 'owner@okhdfcbank', UPI_PLAN_MONTHLY_PAISE: '50' }).configured, false);
  const config = getPaymentConfig({ UPI_PAYEE_VPA: 'owner@okhdfcbank', UPI_PLAN_MONTHLY_PAISE: '29900' });
  assert.equal(config.configured, true);
  assert.equal(config.plans.monthly, 29900);
  assert.equal(config.plans.yearly, 199900);
});

test('alert secret comparison is strict and refuses weak secrets', () => {
  assert.equal(isValidAlertSecret(SECRET, SECRET), true);
  assert.equal(isValidAlertSecret(`${SECRET}x`, SECRET), false);
  assert.equal(isValidAlertSecret(null, SECRET), false);
  assert.equal(isValidAlertSecret('short', 'short'), false);
  assert.equal(normaliseUtr(' 6123 4567 8901 '), '612345678901');
  assert.equal(normaliseUtr('61234567890'), null);
});

function alertFixture(t, { rpcResult = [{ outcome: 'matched', order_id: ORDER }], rpcStatus = 200 } = {}) {
  withEnv(t, {
    SUPABASE_URL: 'https://payments.supabase.co', SUPABASE_ANON_KEY: 'test-public-key', SUPABASE_SERVICE_ROLE_KEY: 'test-server-key',
    PAYMENT_ALERT_SECRET: SECRET, PAYMENT_ALERT_SENDERS: 'hdfcbank.net', NODE_ENV: 'test',
  });
  const rpcBodies = [];
  t.mock.method(globalThis, 'fetch', async (input, options = {}) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/rpc/consume_waitlist_rate_limit')) return Response.json({ allowed: true });
    if (url.pathname === '/rest/v1/rpc/record_payment_alert') {
      rpcBodies.push(JSON.parse(options.body));
      return Response.json(rpcResult, { status: rpcStatus });
    }
    assert.fail(`Unexpected request ${url.pathname}`);
  });
  return rpcBodies;
}

const HDFC_ALERT = {
  source: 'email', sender: 'HDFC Bank InstaAlerts <alerts@hdfcbank.net>', subject: 'You have received a UPI payment',
  text: 'Rs.199.37 has been credited to account **1234 by VPA asha@okaxis. Your UPI transaction reference number is 612345678901.',
  receivedAt: new Date().toISOString(),
};

test('the alert endpoint requires the forwarder secret before reading anything', async t => {
  const rpcBodies = alertFixture(t);
  for (const authorization of [undefined, 'Bearer wrong', `Bearer ${SECRET.slice(1)}`]) {
    const { req, res, getStatus } = createMocks({ headers: authorization ? { authorization } : {}, body: HDFC_ALERT });
    await alertHandler(req, res);
    assert.equal(getStatus(), 401);
  }
  assert.equal(rpcBodies.length, 0);
});

test('a forwarded credit alert is parsed and settled through the atomic database function', async t => {
  const rpcBodies = alertFixture(t);
  const { req, res, getStatus, getJson } = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: HDFC_ALERT });
  await alertHandler(req, res);
  assert.equal(getStatus(), 200);
  assert.deepEqual(getJson(), { outcome: 'matched', amountPaise: 19937 });
  assert.equal(rpcBodies.length, 1);
  assert.equal(rpcBodies[0].p_amount_paise, 19937);
  assert.equal(rpcBodies[0].p_utr, '612345678901');
  assert.equal(rpcBodies[0].p_source, 'email');
});

test('alerts from other senders or without a readable credit never reach the database', async t => {
  const rpcBodies = alertFixture(t);
  const foreign = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: { ...HDFC_ALERT, sender: 'alerts@hdfcbank.net.evil.test' } });
  await alertHandler(foreign.req, foreign.res);
  assert.equal(foreign.getJson().outcome, 'ignored');
  const debit = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: { ...HDFC_ALERT, text: 'Rs.199.37 has been debited. UPI Ref 612345678901' } });
  await alertHandler(debit.req, debit.res);
  assert.equal(debit.getStatus(), 422);
  // A display name that looks like the bank's address does not count.
  const disguised = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: { ...HDFC_ALERT, sender: '"alerts@hdfcbank.net" <alerts@evil.test>' } });
  await alertHandler(disguised.req, disguised.res);
  assert.equal(disguised.getJson().outcome, 'ignored');
  // A clock far off is a final rejection, so the forwarder stops retrying.
  const stale = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: { ...HDFC_ALERT, receivedAt: '2020-01-01T00:00:00Z' } });
  await alertHandler(stale.req, stale.res);
  assert.equal(stale.getStatus(), 422);
  assert.equal(rpcBodies.length, 0);
});

test('SMS alerts skip the email sender-domain check', async t => {
  const rpcBodies = alertFixture(t);
  const sms = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: { ...HDFC_ALERT, source: 'sms', sender: 'AX-HDFCBK' } });
  await alertHandler(sms.req, sms.res);
  assert.equal(sms.getStatus(), 200);
  assert.equal(rpcBodies[0].p_source, 'sms');
});

test('database validation errors are final; outages ask the forwarder to retry', async t => {
  await t.test('validation', async st => {
    alertFixture(st, { rpcResult: { code: 'P0001', message: 'Invalid payment alert input' }, rpcStatus: 400 });
    const { req, res, getStatus } = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: HDFC_ALERT });
    await alertHandler(req, res);
    assert.equal(getStatus(), 422);
  });
  await t.test('outage', async st => {
    alertFixture(st, { rpcResult: { code: '57P01', message: 'terminating connection' }, rpcStatus: 503 });
    const { req, res, getStatus } = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: HDFC_ALERT });
    await alertHandler(req, res);
    assert.equal(getStatus(), 503);
  });
});

test('wrong secrets do not use up the real forwarder\'s rate limit', async t => {
  withEnv(t, {
    SUPABASE_URL: 'https://payments.supabase.co', SUPABASE_ANON_KEY: 'test-public-key', SUPABASE_SERVICE_ROLE_KEY: 'test-server-key',
    PAYMENT_ALERT_SECRET: SECRET, PAYMENT_ALERT_SENDERS: 'hdfcbank.net', NODE_ENV: 'test',
  });
  const keys = [];
  t.mock.method(globalThis, 'fetch', async (input, options = {}) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith('/rpc/consume_waitlist_rate_limit')) {
      keys.push(JSON.stringify(JSON.parse(options.body)));
      return Response.json({ allowed: true });
    }
    if (url.pathname === '/rest/v1/rpc/record_payment_alert') return Response.json([{ outcome: 'matched', order_id: ORDER }]);
    assert.fail(`Unexpected request ${url.pathname}`);
  });
  const denied = createMocks({ headers: { authorization: 'Bearer wrong' }, body: HDFC_ALERT });
  await alertHandler(denied.req, denied.res);
  const allowed = createMocks({ headers: { authorization: `Bearer ${SECRET}` }, body: HDFC_ALERT });
  await alertHandler(allowed.req, allowed.res);
  assert.equal(allowed.getStatus(), 200);
  assert.equal(keys.length, 2);
  // Keys are hashed, so compare the two budgets instead of the key text.
  const [deniedBudget, forwarderBudget] = keys.map(key => JSON.parse(key));
  assert.notEqual(deniedBudget.rate_key, forwarderBudget.rate_key);
  assert.equal(deniedBudget.max_attempts, 60);
  assert.equal(forwarderBudget.max_attempts, 1200);
});

function loadForwarder() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(readFileSync(new URL('../scripts/payments/gmail-upi-forwarder.gs', import.meta.url), 'utf8'), context);
  return context;
}

function gmailMessage(from, authenticationResults) {
  return { getFrom: () => from, getHeader: name => (name === 'Authentication-Results' ? authenticationResults : '') };
}

test('the Gmail forwarder accepts only the exact bank address signed by the bank domain', () => {
  const forwarder = loadForwarder();
  const signed = 'mx.google.com;\r\n       dkim=pass header.i=@hdfcbank.net header.s=sel header.b=abc;\r\n       spf=pass smtp.mailfrom=alerts@hdfcbank.net;\r\n       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=hdfcbank.net';
  const bank = gmailMessage('HDFC Bank InstaAlerts <alerts@hdfcbank.net>', signed);
  assert.ok(forwarder.senderFor(bank));
  assert.equal(forwarder.isAuthenticated(bank, 'hdfcbank.net'), true);
  assert.equal(forwarder.isAuthenticated(gmailMessage('', 'mx.google.com; dkim=pass header.d=mail.hdfcbank.net header.s=x'), 'hdfcbank.net'), true);

  for (const from of ['alerts@hdfcbank.net.evil.test', 'Bank <alerts@hdfcbank.net.evil.test>', '"alerts@hdfcbank.net" <x@evil.test>', 'x-alerts@hdfcbank.net']) {
    assert.equal(forwarder.senderFor(gmailMessage(from, signed)), null, from);
  }
  for (const results of [
    'mx.google.com; dkim=pass header.i=@hdfcbank.net.evil.test header.s=x; dmarc=pass header.from=hdfcbank.net.evil.test',
    'mx.google.com; dkim=pass header.d=evilhdfcbank.net; dmarc=pass header.from=evilhdfcbank.net',
    'mx.google.com; dkim=fail header.i=@hdfcbank.net; dmarc=fail header.from=hdfcbank.net',
    'evil.test; dkim=pass header.i=@hdfcbank.net; dmarc=pass header.from=hdfcbank.net',
    '',
  ]) {
    assert.equal(forwarder.isAuthenticated(gmailMessage('alerts@hdfcbank.net', results), 'hdfcbank.net'), false, results);
  }
});

function paymentFixture(t, { vpa = 'owner@okhdfcbank', waitlistStatus = 'pending', claimOutcome = 'needs_review' } = {}) {
  withEnv(t, {
    SUPABASE_URL: 'https://payments.supabase.co', SUPABASE_ANON_KEY: 'test-public-key', SUPABASE_SERVICE_ROLE_KEY: 'test-server-key',
    UPI_PAYEE_VPA: vpa, UPI_PLAN_MONTHLY_PAISE: '19900', UPI_PLAN_YEARLY_PAISE: '199900', NODE_ENV: 'test',
  });
  const rpc = [];
  t.mock.method(globalThis, 'fetch', async (input, options = {}) => {
    const url = new URL(String(input));
    if (url.pathname === '/auth/v1/user') return Response.json({ id: USER, email: 'buyer@example.test', email_confirmed_at: '2026-10-16T00:00:00Z' });
    if (url.pathname.endsWith('/rpc/consume_waitlist_rate_limit')) return Response.json({ allowed: true });
    if (url.pathname === '/rest/v1/waitlist') return Response.json([{ id: 'w1', auth_user_id: USER, status: waitlistStatus, signup_method: 'google' }]);
    if (url.pathname === '/rest/v1/upi_subscriptions') { rpc.push({ name: 'subscription' }); return Response.json([]); }
    if (url.pathname === '/rest/v1/payment_orders') return Response.json([]);
    if (url.pathname === '/rest/v1/rpc/reserve_payment_order') {
      rpc.push({ name: 'reserve', body: JSON.parse(options.body) });
      return Response.json([{ id: ORDER, plan: 'monthly', status: 'pending', amount_paise: 19937, claimed_utr: null,
        created_at: new Date().toISOString(), expires_at: new Date(Date.now() + 900_000).toISOString() }]);
    }
    if (url.pathname === '/rest/v1/rpc/claim_payment_order') {
      rpc.push({ name: 'claim', body: JSON.parse(options.body) });
      return Response.json([{ outcome: claimOutcome, paid_until: null }]);
    }
    assert.fail(`Unexpected request ${url.pathname}`);
  });
  return rpc;
}

test('checkout reserves a unique amount for the signed-in buyer only', async t => {
  const rpc = paymentFixture(t);
  const { req, res, getStatus, getJson } = createMocks({ headers: { authorization: 'Bearer buyer' }, body: { action: 'create', plan: 'monthly', userId: 'someone-else' } });
  await paymentHandler(req, res);
  assert.equal(getStatus(), 201);
  assert.equal(getJson().order.amount, '199.37');
  assert.match(getJson().order.upiUri, /am=199\.37/);
  assert.deepEqual(rpc.find(call => call.name === 'reserve').body, { p_user_id: USER, p_plan: 'monthly', p_base_paise: 19900, p_ttl_minutes: 15 });
});

test('revoked accounts and unconfigured servers cannot open a checkout', async t => {
  await t.test('revoked', async st => {
    const rpc = paymentFixture(st, { waitlistStatus: 'revoked' });
    const { req, res, getStatus } = createMocks({ headers: { authorization: 'Bearer buyer' }, body: { action: 'create', plan: 'yearly' } });
    await paymentHandler(req, res);
    assert.equal(getStatus(), 403);
    assert.equal(rpc.filter(call => call.name === 'reserve').length, 0);
  });
  await t.test('no UPI ID', async st => {
    paymentFixture(st, { vpa: '' });
    const { req, res, getStatus } = createMocks({ headers: { authorization: 'Bearer buyer' }, body: { action: 'create', plan: 'monthly' } });
    await paymentHandler(req, res);
    assert.equal(getStatus(), 503);
  });
});

test('a buyer-supplied UTR is validated and handed to the claim function', async t => {
  const rpc = paymentFixture(t);
  const bad = createMocks({ headers: { authorization: 'Bearer buyer' }, body: { action: 'claim', orderId: ORDER, utr: '12345' } });
  await paymentHandler(bad.req, bad.res);
  assert.equal(bad.getStatus(), 400);
  const good = createMocks({ headers: { authorization: 'Bearer buyer' }, body: { action: 'claim', orderId: ORDER, utr: '6123 4567 8901' } });
  await paymentHandler(good.req, good.res);
  assert.equal(good.getStatus(), 202);
  assert.equal(good.getJson().outcome, 'needs_review');
  assert.deepEqual(rpc.filter(call => call.name === 'claim').map(call => call.body), [{ p_user_id: USER, p_order_id: ORDER, p_utr: '612345678901' }]);
});

test('loading the payment page reads the subscription once', async t => {
  const calls = paymentFixture(t);
  const { req, res, getStatus, getJson } = createMocks({ method: 'GET', headers: { authorization: 'Bearer buyer' } });
  await paymentHandler(req, res);
  assert.equal(getStatus(), 200);
  assert.equal(getJson().canSubscribe, true);
  assert.equal(calls.filter(call => call.name === 'subscription').length, 1);
});
