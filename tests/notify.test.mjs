import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendWaitlistApprovedEmail } from '../api/_lib/notify.js';

test('sendWaitlistApprovedEmail logs when RESEND_API_KEY is unset', async () => {
  const previousKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  try {
    const result = await sendWaitlistApprovedEmail(
      'student@school.edu',
      'https://www.vertexed.app/signup?invite=abc123',
    );
    assert.equal(result.sent, false);
    assert.match(result.reason, /RESEND_API_KEY/i);
  } finally {
    if (previousKey) process.env.RESEND_API_KEY = previousKey;
  }
});
