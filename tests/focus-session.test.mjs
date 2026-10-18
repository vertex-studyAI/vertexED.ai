import assert from 'node:assert/strict';
import test from 'node:test';
import { createFocusWorkspace, focusElapsed, readFocusWorkspace, saveFocusWorkspace, settleFocusWorkspace, updateFocusWorkspace, validateFocusWorkspace, MAX_FOCUS_MS } from '../src/lib/focusSession.mjs';
import { userContentStorageKeys } from '../src/lib/userContentStorageScope.mjs';
import { collectAccountStorage, clearAccountStorage } from '../src/lib/deviceAccountData.mjs';

function storage() {
  const values = new Map();
  return { values, get length() { return values.size; }, key: index => [...values.keys()][index],
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}

for (const mode of ['timer', 'pomodoro', 'stopwatch']) {
  test(`${mode} pause preserves elapsed time, excludes paused time, and resumes after serialization`, () => {
    let workspace = updateFocusWorkspace(createFocusWorkspace(1000, 'start'), { type: 'mode', mode }, 1000, mode);
    workspace = updateFocusWorkspace(workspace, { type: 'start' }, 2000);
    assert.equal(focusElapsed(workspace.current, 12_000), 10_000);
    workspace = updateFocusWorkspace(workspace, { type: 'pause' }, 12_000);
    assert.equal(focusElapsed(workspace.current, 80_000), 10_000);
    workspace = validateFocusWorkspace(JSON.parse(JSON.stringify(workspace)));
    workspace = updateFocusWorkspace(workspace, { type: 'start' }, 90_000);
    assert.equal(focusElapsed(workspace.current, 95_000), 15_000);
    assert.equal(workspace.current.startedAt, 2000);
  });
}

test('throttling and reload stop at one exact deadline without inventing background Pomodoro blocks', () => {
  let workspace = updateFocusWorkspace(createFocusWorkspace(0), { type: 'mode', mode: 'pomodoro' }, 0, 'pomodoro');
  workspace = updateFocusWorkspace(workspace, { type: 'configure', focusDurationMs: 60_000, breakDurationMs: 60_000 }, 0);
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 10_000);
  const restored = validateFocusWorkspace(JSON.parse(JSON.stringify(workspace)));
  workspace = settleFocusWorkspace(restored, 10_000_000);
  assert.equal(workspace.current.elapsedMs, 60_000);
  assert.equal(workspace.current.completedAt, 70_000);
  assert.equal(workspace.current.status, 'complete');
  assert.equal(workspace.current.phase, 'focus');
  assert.equal(workspace.history.length, 1);
  assert.equal(settleFocusWorkspace(workspace, 20_000_000), workspace);
  assert.equal(updateFocusWorkspace(workspace, { type: 'finish' }, 20_000_000).history.length, 1);
  workspace = updateFocusWorkspace(workspace, { type: 'break' }, 20_000_000, 'break');
  assert.equal(workspace.current.status, 'ready');
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 20_000_000);
  workspace = settleFocusWorkspace(workspace, 21_000_000);
  assert.equal(workspace.current.phase, 'break');
  assert.equal(workspace.history.length, 1);
});

test('task and notes follow their completed block; starting another keeps prior history intact', () => {
  let workspace = createFocusWorkspace(0, 'first');
  workspace = updateFocusWorkspace(workspace, { type: 'metadata', taskId: 'task-a', taskTitle: 'Review circuits', notes: 'Retry current direction.' }, 0);
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 1000);
  workspace = updateFocusWorkspace(workspace, { type: 'finish' }, 31_000);
  assert.equal(workspace.history[0].elapsedMs, 30_000);
  assert.equal(workspace.history[0].taskId, 'task-a');
  workspace = updateFocusWorkspace(workspace, { type: 'metadata', notes: 'Remember conventional current.' }, 40_000);
  assert.equal(workspace.history[0].notes, 'Remember conventional current.');
  workspace = updateFocusWorkspace(workspace, { type: 'next' }, 41_000, 'second');
  assert.equal(workspace.current.notes, '');
  assert.equal(workspace.current.taskId, 'task-a');
  assert.equal(workspace.history[0].notes, 'Remember conventional current.');
});

test('reset keeps task and notes without recording abandoned time; active blocks resist mode and length changes', () => {
  let workspace = updateFocusWorkspace(createFocusWorkspace(0, 'first'), { type: 'metadata', taskTitle: 'Explain diffusion', notes: 'Still unsure.' }, 0);
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 1000);
  assert.equal(updateFocusWorkspace(workspace, { type: 'mode', mode: 'stopwatch' }, 2000), workspace);
  assert.equal(updateFocusWorkspace(workspace, { type: 'configure', focusDurationMs: 1000 }, 2000), workspace);
  workspace = updateFocusWorkspace(workspace, { type: 'reset' }, 3000, 'reset');
  assert.equal(workspace.current.elapsedMs, 0);
  assert.equal(workspace.current.notes, 'Still unsure.');
  assert.equal(workspace.current.taskTitle, 'Explain diffusion');
  assert.equal(workspace.history.length, 0);
});

test('backward clock changes pause safely and stopwatch time is bounded to one day', () => {
  let workspace = updateFocusWorkspace(createFocusWorkspace(0), { type: 'mode', mode: 'stopwatch' }, 0, 'watch');
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 1000);
  workspace = updateFocusWorkspace(workspace, { type: 'pause' }, 2000);
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 3000);
  workspace = settleFocusWorkspace(workspace, 2500);
  assert.equal(workspace.current.status, 'paused');
  assert.equal(workspace.current.elapsedMs, 1000);
  assert.equal(workspace.current.clockAdjusted, true);
  workspace = updateFocusWorkspace(workspace, { type: 'start' }, 4000);
  workspace = settleFocusWorkspace(workspace, MAX_FOCUS_MS * 2);
  assert.equal(workspace.current.elapsedMs, MAX_FOCUS_MS);
  assert.equal(workspace.history.length, 1);
});

test('malformed snapshots never become empty records or overwrite original storage bytes', () => {
  const local = storage();
  local.setItem('focus', '{broken');
  assert.throws(() => readFocusWorkspace(local, 'focus'));
  assert.equal(local.getItem('focus'), '{broken');
  for (const change of [value => { value.current.durationMs = -1; }, value => { value.current.mode = 'unknown'; }, value => { value.current.anchorAt = 0; }, value => { value.current.notes = 'x'.repeat(4001); }, value => { value.history = [value.current]; }]) {
    const workspace = createFocusWorkspace();
    change(workspace);
    assert.throws(() => validateFocusWorkspace(workspace));
  }
});

test('account export and deletion include focus notes without touching another account', () => {
  const local = storage();
  const keyA = userContentStorageKeys('account-a').focusSession;
  const keyB = userContentStorageKeys('account-b').focusSession;
  saveFocusWorkspace(local, keyA, null, updateFocusWorkspace(createFocusWorkspace(0, 'a'), { type: 'metadata', notes: 'Private A' }));
  saveFocusWorkspace(local, keyB, null, updateFocusWorkspace(createFocusWorkspace(0, 'b'), { type: 'metadata', notes: 'Private B' }));
  assert.equal(Object.keys(collectAccountStorage(local, 'account-a')).length, 1);
  assert.equal(collectAccountStorage(local, 'account-a')[keyA].current.notes, 'Private A');
  clearAccountStorage(local, 'account-a');
  assert.equal(local.getItem(keyA), null);
  assert.equal(readFocusWorkspace(local, keyB).workspace.current.notes, 'Private B');
});

test('stale tabs cannot overwrite newer focus state and failed writes preserve the existing copy', () => {
  const local = storage();
  const a = readFocusWorkspace(local, 'focus', 0, 'a');
  const b = readFocusWorkspace(local, 'focus', 0, 'b');
  const raw = saveFocusWorkspace(local, 'focus', a.raw, updateFocusWorkspace(a.workspace, { type: 'metadata', notes: 'Newer notes' }));
  assert.throws(() => saveFocusWorkspace(local, 'focus', b.raw, b.workspace), /another tab/);
  assert.equal(local.getItem('focus'), raw);
  local.setItem = () => { throw new Error('Quota exceeded'); };
  assert.throws(() => saveFocusWorkspace(local, 'focus', raw, a.workspace), /Quota/);
  assert.equal(local.getItem('focus'), raw);
});

test('history keeps the most recent 50 distinct focus blocks', () => {
  let workspace = createFocusWorkspace(0, 'initial');
  for (let index = 0; index < 55; index++) {
    workspace = updateFocusWorkspace(workspace, { type: 'start' }, index * 3000);
    workspace = updateFocusWorkspace(workspace, { type: 'finish' }, index * 3000 + 1000);
    workspace = updateFocusWorkspace(workspace, { type: 'next' }, index * 3000 + 2000, `block-${index}`);
  }
  assert.equal(workspace.history.length, 50);
  assert.equal(workspace.history[0].id, 'block-53');
  validateFocusWorkspace(workspace);
});
