import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import askHandler from '../api/_handlers/ask.js';
import waitlistHandler from '../api/_handlers/waitlist.js';
import { createMocks } from './helpers/mock-http.mjs';

const savedEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

before(() => {
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
});

after(() => {
  if (savedEnv.SUPABASE_URL === undefined) {
    delete process.env.SUPABASE_URL;
  } else {
    process.env.SUPABASE_URL = savedEnv.SUPABASE_URL;
  }

  if (savedEnv.SUPABASE_SERVICE_ROLE_KEY === undefined) {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  } else {
    process.env.SUPABASE_SERVICE_ROLE_KEY = savedEnv.SUPABASE_SERVICE_ROLE_KEY;
  }
});

test('ask handler rejects unauthenticated requests', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'POST',
    body: { question: 'What is photosynthesis?' },
  });

  await askHandler(req, res);

  assert.equal(getStatus(), 401);
  assert.match(getJson().error, /log in/i);
});

test('ask handler rejects non-POST methods', async () => {
  const { req, res, getStatus } = createMocks({ method: 'GET' });

  await askHandler(req, res);

  assert.equal(getStatus(), 405);
});

test('waitlist handler rejects non-POST methods', async () => {
  const { req, res, getStatus } = createMocks({ method: 'GET' });

  await waitlistHandler(req, res);

  assert.equal(getStatus(), 405);
});

test('waitlist handler rejects invalid email before DB writes', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'POST',
    body: { email: 'not-an-email' },
  });

  await waitlistHandler(req, res);

  assert.equal(getStatus(), 400);
  assert.match(getJson().error, /valid email/i);
});

test('waitlist honeypot returns success without touching DB', async () => {
  const { req, res, getStatus, getJson } = createMocks({
    method: 'POST',
    body: { email: 'user@example.com', website: 'https://spam.test' },
  });

  await waitlistHandler(req, res);

  assert.equal(getStatus(), 200);
  assert.match(getJson().message, /waitlist/i);
});
