// A destroyed stream may have error/close events queued even when .closed is
// already true. Protect that delivery without retaining request-body chunks.
export function guardInterruptedRequestErrors(req) {
  let nextTurnCleanup;
  const ignoreError = () => {};
  const release = () => {
    req.removeListener('error', ignoreError);
    req.removeListener('close', release);
    if (nextTurnCleanup !== undefined) clearImmediate(nextTurnCleanup);
  };
  req.on('error', ignoreError);
  req.on('close', release);
  if (req.closed) nextTurnCleanup = setImmediate(release);
}
