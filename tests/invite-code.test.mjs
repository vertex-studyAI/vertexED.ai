import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyInviteCode } from '../api/_lib/inviteCode.js';

test('verifyInviteCode rejects missing env code', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  delete process.env.SIGNUP_INVITE_CODE;
  try {
    assert.equal(verifyInviteCode('anything'), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
  }
});

test('verifyInviteCode accepts exact match only', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  process.env.SIGNUP_INVITE_CODE = 'secret-code-123';
  try {
    assert.equal(verifyInviteCode('secret-code-123'), true);
    assert.equal(verifyInviteCode('secret-code-124'), false);
    assert.equal(verifyInviteCode(''), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
  }
});

test('verifyInviteCode is timing-safe for different lengths', () => {
  const previous = process.env.SIGNUP_INVITE_CODE;
  process.env.SIGNUP_INVITE_CODE = 'short';
  try {
    assert.equal(verifyInviteCode('much-longer-code'), false);
  } finally {
    if (previous) process.env.SIGNUP_INVITE_CODE = previous;
    else delete process.env.SIGNUP_INVITE_CODE;
  }
});
