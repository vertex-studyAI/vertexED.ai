import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PERCY_PROCESS_STATES,
  classifyPercyProcess,
  isShellOnlyCommand,
} from '../scripts/percy-process-liveness.mjs';

test('canonical process states remain explicit', () => {
  assert.deepEqual(PERCY_PROCESS_STATES, ['RUNNING', 'SHELL_ONLY', 'STALE', 'EXITED', 'UNKNOWN']);
});

test('bare and login shells are classified as shell-only commands', () => {
  for (const command of ['zsh', '/bin/zsh', 'bash -l', '/bin/bash --login', 'fish -i']) {
    assert.equal(isShellOnlyCommand(command), true, command);
  }
});

test('a shell launching an explicit worker command is not guessed to be shell-only', () => {
  assert.equal(isShellOnlyCommand('zsh -lc "node tools/percy-runtime/cli.mjs work-one"'), false);
});

test('reported RUNNING cannot override an observed idle shell', () => {
  assert.deepEqual(classifyPercyProcess({ state: 'RUNNING', command: 'zsh' }), {
    reportedState: 'RUNNING',
    state: 'SHELL_ONLY',
    reason: 'reported RUNNING but observed command is only an interactive/login shell',
  });
});

test('known terminal/stale states remain fail-closed classifications', () => {
  for (const state of ['SHELL_ONLY', 'STALE', 'EXITED', 'UNKNOWN']) {
    assert.equal(classifyPercyProcess({ state, command: 'node worker.mjs' }).state, state);
  }
});

test('unsupported or missing state normalizes to UNKNOWN', () => {
  assert.equal(classifyPercyProcess({ state: 'PAUSED', command: 'node worker.mjs' }).state, 'UNKNOWN');
  assert.equal(classifyPercyProcess({ command: 'node worker.mjs' }).state, 'UNKNOWN');
});
