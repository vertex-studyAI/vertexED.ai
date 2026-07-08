import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAdminEmails, isAdminUser } from '../api/lib/admin.js';

test('getAdminEmails parses comma-separated list', () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = ' Admin@Example.com , other@test.io ';

  try {
    assert.deepEqual(getAdminEmails(), ['admin@example.com', 'other@test.io']);
  } finally {
    if (previous === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = previous;
    }
  }
});

test('isAdminUser returns false when ADMIN_EMAILS is unset', () => {
  const previous = process.env.ADMIN_EMAILS;
  delete process.env.ADMIN_EMAILS;

  try {
    assert.equal(isAdminUser({ email: 'admin@example.com' }), false);
  } finally {
    if (previous === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = previous;
    }
  }
});

test('isAdminUser matches email case-insensitively', () => {
  const previous = process.env.ADMIN_EMAILS;
  process.env.ADMIN_EMAILS = 'admin@example.com';

  try {
    assert.equal(isAdminUser({ email: 'Admin@Example.com' }), true);
    assert.equal(isAdminUser({ email: 'other@example.com' }), false);
  } finally {
    if (previous === undefined) {
      delete process.env.ADMIN_EMAILS;
    } else {
      process.env.ADMIN_EMAILS = previous;
    }
  }
});
