import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldOfferInvalidInviteRecovery } from '../src/lib/signupInviteRecovery.ts';

test('offers recovery only after an approval link fails validation', () => {
  assert.equal(shouldOfferInvalidInviteRecovery({
    hasWaitlistInvite: true,
    loading: false,
    email: '',
    error: 'This approval link is invalid, expired, or has already been used.',
  }), true);

  assert.equal(shouldOfferInvalidInviteRecovery({
    hasWaitlistInvite: true,
    loading: true,
    email: '',
    error: null,
  }), false);

  assert.equal(shouldOfferInvalidInviteRecovery({
    hasWaitlistInvite: true,
    loading: false,
    email: 'approved@example.com',
    error: null,
  }), false);

  assert.equal(shouldOfferInvalidInviteRecovery({
    hasWaitlistInvite: false,
    loading: false,
    email: '',
    error: 'Unrelated waitlist error',
  }), false);
});

test('ignores empty error text', () => {
  assert.equal(shouldOfferInvalidInviteRecovery({
    hasWaitlistInvite: true,
    loading: false,
    email: '   ',
    error: '   ',
  }), false);
});
