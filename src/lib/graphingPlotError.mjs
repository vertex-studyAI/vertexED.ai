/**
 * Safe user-facing copy for Study Zone graphing failures.
 * Preserve short local validation; never echo parser/stack internals.
 */
export function graphingPlotError(error) {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';

  if (
    source === 'Enter a function of x.'
    || source === 'That function has no visible values in this window.'
  ) {
    return source;
  }

  return 'Could not plot this function.';
}
