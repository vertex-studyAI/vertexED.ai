import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isInviteCodeConfiguredSafely,
  verifyInviteCode,
} from '../api/_lib/inviteCode.js';

const STRONG_TEST_CODE = 'vT9p-K2m-Q7x-N4c-R8s-W6y-Z1';

test('verifyInviteCode rejects missing env code', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  delete process.env.SIGNUP_INVITE_CODE;
  try {
    assert.equal(verifyInviteCode('anything'), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
  }
});

test('unsafe checked-in, placeholder, and short invite secrets fail closed', () => {
  assert.equal(isInviteCodeConfiguredSafely('Vertex2032;'), false);
  assert.equal(isInviteCodeConfiguredSafely('replace-with-at-least-24-random-characters'), false);
  assert.equal(isInviteCodeConfiguredSafely('short-human-code'), false);
  assert.equal(isInviteCodeConfiguredSafely(STRONG_TEST_CODE), true);
});

test('verifyInviteCode accepts exact match only for safely configured secret', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  process.env.SIGNUP_INVITE_CODE = STRONG_TEST_CODE;
  try {
    assert.equal(verifyInviteCode(STRONG_TEST_CODE), true);
    assert.equal(verifyInviteCode(`${STRONG_TEST_CODE}x`), false);
    assert.equal(verifyInviteCode(''), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
  }
});

test('verifyInviteCode rejects even an exact match when configured secret is weak', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  process.env.SIGNUP_INVITE_CODE = 'secret-code-123';
  try {
    assert.equal(verifyInviteCode('secret-code-123'), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
  }
});

test('verifyInviteCode is timing-safe for different lengths', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  process.env.SIGNUP_INVITE_CODE = STRONG_TEST_CODE;
  try {
    assert.equal(verifyInviteCode('much-longer-code'), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
  }
});
