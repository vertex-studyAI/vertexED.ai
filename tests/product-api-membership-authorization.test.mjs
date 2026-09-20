import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { ROUTES } from '../api/_lib/routes.js';

const AUTH_ONLY_OR_PUBLIC_ROUTES = new Set([
  'health',
  'telemetry',
  'admin-status',
  'account',
  'account-export',
  'waitlist',
  'waitlist-status',
  'signup-invite',
  'waitlist-admin',
]);

const PRODUCT_ROUTE_TO_HANDLER = {
  'study-guide-chat': 'study-guide-chat.js',
  ask: 'ask.js',
  agents: 'agents.js',
  quiz: 'quiz.js',
  note: 'note.js',
  planner: 'planner.js',
  'paper-generator': 'paper-generator.js',
  review: 'review-safe.ts',
  'user-content': 'user-content.js',
  'learner-state': 'learner-state.js',
  transcribe: 'transcribe.js',
  notebook: 'notebook.js',
  'board-resource': 'board-resource.js',
};

test('every non-exempt registered product route is explicitly classified', () => {
  const classifiedProductRoutes = Object.keys(ROUTES)
    .filter((route) => !AUTH_ONLY_OR_PUBLIC_ROUTES.has(route))
    .sort();
  assert.deepEqual(classifiedProductRoutes, Object.keys(PRODUCT_ROUTE_TO_HANDLER).sort());
});

test('canonical auth helper requires approved VertexED membership after bearer authentication', () => {
  const source = fs.readFileSync('api/_lib/auth.js', 'utf8');
  assert.match(source, /export async function verifyAuthUserOnly\(req, res\)/);
  assert.match(source, /export async function verifyAuthUser\(req, res\)/);
  assert.match(source, /const user = await verifyAuthUserOnly\(req, res\)/);
  assert.match(source, /getAccountWaitlistEntry\(supabase, user\)/);
  assert.match(source, /entry\?\.status !== 'approved'/);
  assert.match(source, /res\.status\(403\)\.json\(\{ error: 'Approved VertexED beta access is required\.'/);
  assert.match(source, /res\.status\(503\)\.json\(\{ error: 'Account access could not be verified\. Please try again\.'/);
  assert.match(source, /if \(isAdminUser\(user\)\) return user/);
});

test('all registered learner/product handlers use membership-enforcing authentication', () => {
  for (const [route, filename] of Object.entries(PRODUCT_ROUTE_TO_HANDLER)) {
    const source = fs.readFileSync(`api/_handlers/${filename}`, 'utf8');
    assert.match(source, /verifyAuthUser/, `${route} must use the canonical product auth helper`);
    assert.doesNotMatch(source, /verifyAuthUserOnly/, `${route} must not bypass beta membership`);
  }
});

test('privacy and access-status endpoints remain usable without beta approval', () => {
  const account = fs.readFileSync('api/_handlers/account.js', 'utf8');
  const accountExport = fs.readFileSync('api/_handlers/account-export.js', 'utf8');
  const waitlistStatus = fs.readFileSync('api/_handlers/waitlist-status.js', 'utf8');

  assert.match(account, /verifyAuthUserOnly\(req, res\)/);
  assert.match(accountExport, /verifyAuthUserOnly\(req, res\)/);
  assert.match(waitlistStatus, /verifyAuthUserOnly as verifyAuthUser/);
});
