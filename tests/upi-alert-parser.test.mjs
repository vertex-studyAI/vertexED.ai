import assert from 'node:assert/strict';
import test from 'node:test';
import { parseUpiCreditAlert } from '../api/_lib/upiAlertParser.js';

test('distinct labelled payment references require manual review', () => {
  for (const text of [
    'Rs 199.37 credited. UPI Ref 612345678901. UTR 612345678902',
    'Rs 199.37 credited. UPI/P2A/612345678901/PAYER. UTR 612345678902',
    'Rs 199.37 credited. UPI/P2A/612345678901/PAYER. UPI/P2A/612345678902/PAYER',
  ]) {
    assert.deepEqual(parseUpiCreditAlert(text), { ok: false, reason: 'reference_not_found' });
  }
});

test('a repeated reference and repeated amount identify one payment', () => {
  assert.deepEqual(parseUpiCreditAlert('You received Rs 199.37. Rs 199.37 credited. UPI Ref 612345678901. UTR 612345678901'), {
    ok: true, amountPaise: 19937, utr: '612345678901',
  });
});

test('distinct payment amounts cannot settle using the first amount', () => {
  assert.deepEqual(parseUpiCreditAlert('Rs 199.37 credited. Rs 299.37 credited. UPI Ref 612345678901'), {
    ok: false, reason: 'amount_not_found',
  });
});

test('fractional paise are rejected instead of truncating to whole rupees', () => {
  for (const amount of ['199.375', '199.001', '199.000']) {
    assert.deepEqual(parseUpiCreditAlert(`Rs ${amount} credited. UPI Ref 612345678901`), {
      ok: false, reason: 'amount_not_found',
    });
  }
});

test('account balances do not make an otherwise exact payment ambiguous', () => {
  assert.deepEqual(parseUpiCreditAlert('Avl Bal Rs 5,000.00. Rs 199.37 credited. UPI Ref 612345678901. Updated Balance: Rs 5,199.37.'), {
    ok: true, amountPaise: 19937, utr: '612345678901',
  });
});
