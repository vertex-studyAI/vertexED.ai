import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildParticipantPilotExport,
  buildPilotExport,
  isPseudonymousParticipantId,
  pilotSessionsToCsv,
  summarizePilotSessions,
} from '../src/lib/pilotAnalyticsCore.mjs';

const metadata = {
  generated_at: '2026-09-02T00:00:00.000Z',
  source_revision: 'deadbeef',
  source: 'fixture:pseudonymous-pilot-v1',
};

const session = (overrides = {}) => ({
  participant_id: 'pilot_A001',
  session_id: 'session-001',
  consent_opt_in: true,
  curriculum: 'IB DP',
  subject: 'Physics',
  topic: 'Kinematics',
  pre_assessment: { id: 'pre-k1', score: 4, max: 10 },
  intervention_start: '2026-09-01T10:05:00.000Z',
  intervention_end: '2026-09-01T10:35:00.000Z',
  completed_practice_loops: 2,
  completed_review_loops: 1,
  post_assessment: { id: 'post-k1', score: 7, max: 10 },
  started_at: '2026-09-01T10:00:00.000Z',
  completed_at: '2026-09-01T10:40:00.000Z',
  completion_flag: true,
  usefulness_rating: 4,
  ...overrides,
});

test('empty pilot data exports deterministic null-safe aggregates', () => {
  const exported = buildPilotExport([], metadata);
  assert.equal(exported.aggregate.n_enrolled, 0);
  assert.equal(exported.aggregate.n_completed, 0);
  assert.equal(exported.aggregate.pre_percent_mean, null);
  assert.equal(exported.aggregate.paired_delta_percent_mean, null);
  assert.equal(exported.aggregate.repeat_session_rate, null);
  assert.deepEqual(exported.sessions, []);
});

test('partial completion is retained without inventing a post score or paired delta', () => {
  const incomplete = session({
    session_id: 'session-partial',
    post_assessment: null,
    completed_at: null,
    completion_flag: false,
  });

  const summary = summarizePilotSessions([session(), incomplete]);
  assert.equal(summary.n_enrolled, 1);
  assert.equal(summary.n_sessions, 2);
  assert.equal(summary.n_completed_sessions, 1);
  assert.equal(summary.missing_or_incomplete_session_count, 1);
  assert.equal(summary.paired_delta_count, 1);
  assert.equal(summary.repeat_participant_count, 1);
  assert.equal(summary.repeat_session_rate, 1);
});

test('participant export cannot leak records from another account', () => {
  const records = [
    session(),
    session({
      participant_id: 'pilot_B002',
      session_id: 'session-002',
      subject: 'Mathematics',
      topic: 'Functions',
    }),
  ];

  const exported = buildParticipantPilotExport(records, 'pilot_A001', metadata);
  assert.equal(exported.sessions.length, 1);
  assert.equal(exported.sessions[0].participant_id, 'pilot_A001');
  assert.equal(exported.aggregate.n_enrolled, 1);
  assert.equal(exported.sessions.some((entry) => entry.participant_id === 'pilot_B002'), false);
});

test('non-consented and email-like participant identifiers fail closed', () => {
  const records = [
    session({ consent_opt_in: false }),
    session({ participant_id: 'student@example.com' }),
    session({ participant_id: 'pilot_C003', session_id: 'session-003' }),
  ];

  const exported = buildPilotExport(records, metadata);
  assert.deepEqual(exported.sessions.map((entry) => entry.participant_id), ['pilot_C003']);
  assert.equal(isPseudonymousParticipantId('student@example.com'), false);
  assert.equal(isPseudonymousParticipantId('pilot_C003'), true);
});

test('aggregate reports measured pre/post percentages and paired deltas only', () => {
  const records = [
    session(),
    session({
      participant_id: 'pilot_B002',
      session_id: 'session-002',
      pre_assessment: { id: 'pre-k2', score: 5, max: 10 },
      post_assessment: { id: 'post-k2', score: 9, max: 10 },
      completed_review_loops: 3,
    }),
  ];

  const summary = summarizePilotSessions(records);
  assert.equal(summary.pre_percent_mean, 45);
  assert.equal(summary.post_percent_mean, 80);
  assert.equal(summary.paired_delta_percent_mean, 35);
  assert.equal(summary.completed_review_loops, 4);
  assert.equal(summary.dropout_or_missing_data_count, 0);
});

test('CSV contains only the bounded pseudonymous session schema', () => {
  const csv = pilotSessionsToCsv([session()]);
  assert.match(csv, /^participant_id,session_id,curriculum,subject,topic,/);
  assert.match(csv, /pilot_A001/);
  assert.equal(csv.includes('consent_opt_in'), false);
  assert.equal(csv.includes('studyMinutesEstimate'), false);
  assert.equal(csv.includes('avgMastery'), false);
});

test('duplicate participant/session records fail closed instead of double-counting', () => {
  assert.throws(() => buildPilotExport([session(), session()], metadata), /duplicate participant\/session record/);
});

test('export records accepted and rejected counts without leaking rejected identifiers', () => {
  const exported = buildPilotExport([session(), session({ consent_opt_in: false })], metadata);
  assert.equal(exported.metadata.input_record_count, 2);
  assert.equal(exported.metadata.accepted_session_count, 1);
  assert.equal(exported.metadata.rejected_record_count, 1);
  assert.equal(JSON.stringify(exported).includes('student@example.com'), false);
});
