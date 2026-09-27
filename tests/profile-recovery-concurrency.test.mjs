import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import * as recovery from '../src/lib/profileRecovery.mjs';
import { withCurriculumRecoverySnapshot } from '../src/lib/profileRecoverySnapshot.mjs';

const EMPTY = { board: null, grade: null, subjects: [], exam_date: null };
const CURRICULUM = { board: 'IB_DP', grade: 11, subjects: ['Physics HL'], exam_date: '2027-05-01' };
const USER = { id: 'fixture-a', email: 'fixture@example.test', user_metadata: CURRICULUM };
const authSource = readFileSync(new URL(
  process.env.PROFILE_RECOVERY_AUTH_SOURCE || '../src/contexts/AuthContext.tsx',
  import.meta.url,
), 'utf8');

// Execute the actual postAuthUpsertProfile function body, not a rewritten copy.
// This isolated harness does not mount React or connect to a database.
function actualRecovery(client, refresh, errors) {
  const startMarker = '  const postAuthUpsertProfile = async (u: User, metadata?: Record<string, any>) => {';
  const endMarker = '\n  };\n\n  const value: AuthContextType';
  const start = authSource.indexOf(startMarker);
  const end = authSource.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, 'the source extraction boundary must remain explicit');
  const body = authSource.slice(start + startMarker.length, end);
  return new Function(
    'supabase', 'buildMissingCurriculumRecovery', 'buildMissingProfileInsert',
    'buildProfileUpdate', 'withCurriculumRecoverySnapshot', 'refreshProfile', 'console',
    `return async function(u, metadata) {${body}\n};`,
  )(client, recovery.buildMissingCurriculumRecovery, recovery.buildMissingProfileInsert,
    recovery.buildProfileUpdate, withCurriculumRecoverySnapshot, refresh,
    { error: (...args) => errors.push(args) });
}

// Independent, narrow decoder for the one-dimensional text[] literals emitted by
// the guard. This emulates value equality only, not PostgreSQL or PostgREST.
function parseArrayLiteral(literal) {
  assert.equal(literal[0], '{');
  assert.equal(literal.at(-1), '}');
  const values = [];
  let i = 1;
  while (i < literal.length - 1) {
    if (literal[i] === '"') {
      let text = '';
      i += 1;
      while (literal[i] !== '"') {
        assert.ok(i < literal.length - 1, 'unterminated array element');
        if (literal[i] === '\\') i += 1;
        text += literal[i++];
      }
      i += 1;
      values.push(text);
    } else {
      assert.equal(literal.slice(i, i + 4), 'NULL');
      values.push(null);
      i += 4;
    }
    if (i < literal.length - 1) assert.equal(literal[i++], ',');
  }
  return values;
}

function recorder(filters = []) {
  return {
    filters,
    eq(field, value) { return recorder([...filters, ['eq', field, value]]); },
    is(field, value) { return recorder([...filters, ['is', field, value]]); },
  };
}

function harness(initial, { editAfterSnapshot, error = null, insertError = null, deleteAfterSnapshot = false } = {}) {
  let row = initial === null ? null : { id: USER.id, ...structuredClone(initial) };
  const other = { id: 'fixture-b', ...structuredClone(EMPTY) };
  const refreshes = [], errors = [], writes = [];
  const state = { attempts: 0, applied: 0 };
  const client = {
    from(table) {
      assert.equal(table, 'profiles');
      let payload;
      const filters = [];
      const query = {
        update(value) { payload = value; return query; },
        eq(field, value) { filters.push(['eq', field, value]); return query; },
        is(field, value) { filters.push(['is', field, value]); return query; },
        select() { return query; },
        async maybeSingle() {
          assert.deepEqual(filters, [['eq', 'id', USER.id]]);
          if (!row) return { data: null, error: null };
          Object.assign(row, payload);
          const snapshot = structuredClone(row);
          if (editAfterSnapshot) Object.assign(row, editAfterSnapshot);
          if (deleteAfterSnapshot) row = null;
          return { data: snapshot, error: null };
        },
        async insert(value) {
          writes.push(['insert', structuredClone(value)]);
          if (!insertError) row = structuredClone(value);
          return { error: insertError };
        },
        then(resolve, reject) {
          state.attempts += 1;
          writes.push(['recovery', structuredClone(payload), structuredClone(filters)]);
          assert.ok(filters.some(([op, field, value]) => op === 'eq' && field === 'id' && value === USER.id));
          const matches = target => target && filters.every(([op, field, value]) => {
            if (op === 'is') return value === null && target[field] === null;
            const expected = field === 'subjects' ? parseArrayLiteral(value) : value;
            return isDeepStrictEqual(target[field], expected);
          });
          assert.equal(Boolean(matches(other)), false, 'the other account must never match');
          if (!error && matches(row)) {
            Object.assign(row, payload);
            state.applied += 1;
          }
          return Promise.resolve({ error }).then(resolve, reject);
        },
      };
      return query;
    },
  };
  return {
    run: (user = USER) => actualRecovery(client, async (id, email) => {
      refreshes.push({ id, email, profile: structuredClone(row) });
    }, errors)(user),
    row: () => structuredClone(row), state, errors, writes, refreshes,
  };
}

for (const [field, value] of Object.entries({ board: 'AP', grade: 12, subjects: ['Calculus BC'], exam_date: '2027-06-10' })) {
  test(`concurrent ${field} edit is preserved and the stale recovery is not retried`, async () => {
    const h = harness(EMPTY, { editAfterSnapshot: { [field]: value } });
    await h.run();
    assert.equal(h.state.attempts, 1);
    assert.equal(h.state.applied, 0);
    assert.deepEqual(h.row()[field], value);
    assert.equal(h.refreshes.length, 1);
    assert.deepEqual(h.refreshes[0].profile, h.row());
  });
}

test('a board edit also prevents a stale subjects-only repair', async () => {
  const initial = { ...CURRICULUM, subjects: [] };
  const h = harness(initial, { editAfterSnapshot: { board: 'AP' } });
  await h.run();
  assert.equal(h.state.applied, 0);
  assert.deepEqual(h.row().subjects, []);
  assert.equal(h.row().board, 'AP');
});

test('unchanged curriculum recovers normally, remains user-scoped, and refreshes', async () => {
  const h = harness(EMPTY);
  await h.run();
  assert.equal(h.state.applied, 1);
  for (const [field, value] of Object.entries(CURRICULUM)) assert.deepEqual(h.row()[field], value);
  assert.equal(h.refreshes[0].id, USER.id);
  assert.equal(h.refreshes[0].email, USER.email);
});

test('identity-only edits do not block recovery or get overwritten by its patch', async () => {
  const h = harness(EMPTY, { editAfterSnapshot: { full_name: 'Learner choice', updated_at: 'later-fixture' } });
  await h.run();
  assert.equal(h.state.applied, 1);
  assert.equal(h.row().full_name, 'Learner choice');
});

test('a deleted row is not resurrected or retried after a snapshot conflict', async () => {
  const h = harness(EMPTY, { deleteAfterSnapshot: true });
  await h.run();
  assert.equal(h.row(), null);
  assert.equal(h.state.applied, 0);
  assert.equal(h.writes.some(([kind]) => kind === 'insert'), false);
  assert.equal(h.refreshes.length, 1);
});

test('a populated curriculum does not issue a recovery update', async () => {
  const h = harness(CURRICULUM);
  await h.run();
  assert.equal(h.state.attempts, 0);
  assert.equal(h.refreshes.length, 1);
});

test('incomplete Auth metadata does not issue a recovery update', async () => {
  const h = harness(EMPTY);
  await h.run({ ...USER, user_metadata: { board: 'IB_DP' } });
  assert.equal(h.state.attempts, 0);
});

test('backend recovery errors remain handled without retries or a false refresh', async () => {
  const h = harness(EMPTY, { error: { code: '42501', message: 'fixture denial' } });
  await h.run();
  assert.equal(h.state.applied, 0);
  assert.equal(h.state.attempts, 1);
  assert.equal(h.refreshes.length, 0);
  assert.equal(h.errors.length, 1);
});

test('missing-profile insert and unique-conflict refresh remain unchanged', async () => {
  for (const insertError of [null, { code: '23505' }]) {
    const h = harness(null, { insertError });
    await h.run();
    assert.equal(h.state.attempts, 0);
    assert.equal(h.writes[0][0], 'insert');
    assert.equal(h.writes[0][1].id, USER.id);
    assert.equal(h.refreshes.length, 1);
  }
});

test('all four snapshot fields are guarded, with SQL null and empty-array semantics', () => {
  const query = recorder().eq('id', USER.id);
  const guarded = withCurriculumRecoverySnapshot(query, EMPTY);
  assert.deepEqual(guarded.filters, [
    ['eq', 'id', USER.id], ['is', 'board', null], ['is', 'grade', null],
    ['eq', 'subjects', '{}'], ['is', 'exam_date', null],
  ]);
  assert.deepEqual(query.filters, [['eq', 'id', USER.id]], 'immutable builders must work');
  assert.deepEqual(withCurriculumRecoverySnapshot(recorder(), { ...EMPTY, subjects: null }).filters[2], ['is', 'subjects', null]);
});

test('text-array encoding preserves order, duplicates, escapes and NULL distinctions', () => {
  const subjects = ['Math, AA', 'Say "yes"', 'C:\\notes', 'NULL', null, '', 'a{b}', 'x\ny', 'Math, AA'];
  const snapshot = Object.freeze({ ...CURRICULUM, subjects: Object.freeze(subjects) });
  const literal = withCurriculumRecoverySnapshot(recorder(), snapshot).filters[2][2];
  assert.deepEqual(parseArrayLiteral(literal), subjects);
  assert.ok(literal.includes('"NULL",NULL,""'));
  assert.ok(literal.includes('"Say \\"yes\\""'));
  assert.ok(literal.includes('"C:\\\\notes"'));
});

for (const snapshot of [
  null, {}, { ...EMPTY, board: undefined }, { ...EMPTY, board: {} },
  { ...EMPTY, grade: '11' }, { ...EMPTY, grade: NaN },
  { ...EMPTY, subjects: 'Physics' }, { ...EMPTY, subjects: [1] },
  { ...EMPTY, subjects: new Array(1) }, { ...EMPTY, subjects: [['Physics']] },
  { ...EMPTY, exam_date: 20270501 },
]) {
  test(`malformed snapshot refuses all filters: ${JSON.stringify(snapshot)}`, () => {
    let calls = 0;
    const query = { eq() { calls += 1; return query; }, is() { calls += 1; return query; } };
    assert.throws(() => withCurriculumRecoverySnapshot(query, snapshot), TypeError);
    assert.equal(calls, 0);
  });
}

test('snapshot comparison retains exact strings instead of normalizing the observed row', () => {
  const snapshot = { board: '  ', grade: null, subjects: [' Physics '], exam_date: '' };
  assert.deepEqual(withCurriculumRecoverySnapshot(recorder(), snapshot).filters, [
    ['eq', 'board', '  '], ['is', 'grade', null],
    ['eq', 'subjects', '{" Physics "}'], ['eq', 'exam_date', ''],
  ]);
});
