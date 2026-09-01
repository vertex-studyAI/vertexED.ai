const KNOWN_STATES = new Set(['RUNNING', 'SHELL_ONLY', 'STALE', 'EXITED', 'UNKNOWN']);
const INTERACTIVE_SHELLS = new Set(['sh', 'bash', 'zsh', 'fish', 'ksh', 'tcsh']);
const SHELL_ONLY_FLAGS = new Set(['-i', '--interactive', '-l', '--login']);

export const PERCY_PROCESS_STATES = Object.freeze([
  'RUNNING',
  'SHELL_ONLY',
  'STALE',
  'EXITED',
  'UNKNOWN',
]);

function executableBasename(command) {
  const firstToken = command.trim().split(/\s+/, 1)[0] ?? '';
  return firstToken.split('/').filter(Boolean).at(-1) ?? firstToken;
}

/**
 * Detect the specific false-positive that originally affected Percy: a tmux
 * worker pane containing only an interactive/login shell was being treated as
 * active work. This is intentionally conservative. A shell with an explicit
 * command (for example `zsh -lc "node worker.mjs"`) is not classified here;
 * the runtime collector must inspect the real child process/heartbeat instead.
 */
export function isShellOnlyCommand(command) {
  if (typeof command !== 'string' || !command.trim()) return false;
  if (!INTERACTIVE_SHELLS.has(executableBasename(command))) return false;

  const tokens = command.trim().split(/\s+/).slice(1);
  return tokens.every((token) => SHELL_ONLY_FLAGS.has(token));
}

/**
 * Normalize process evidence without trusting a caller-supplied RUNNING label
 * when the observed command is plainly an idle shell.
 */
export function classifyPercyProcess(processEvidence = {}) {
  const reportedState = typeof processEvidence.state === 'string' && KNOWN_STATES.has(processEvidence.state)
    ? processEvidence.state
    : 'UNKNOWN';

  if (reportedState === 'RUNNING' && isShellOnlyCommand(processEvidence.command)) {
    return {
      reportedState,
      state: 'SHELL_ONLY',
      reason: 'reported RUNNING but observed command is only an interactive/login shell',
    };
  }

  return {
    reportedState,
    state: reportedState,
    reason: reportedState === 'UNKNOWN' ? 'missing or unsupported process state' : null,
  };
}
