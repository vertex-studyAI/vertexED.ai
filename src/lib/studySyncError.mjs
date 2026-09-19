/**
 * Safe user-facing copy for study artifact / planner / notebook sync failures.
 * Never echo raw fetch/Auth/Postgres/provider details into save notices.
 */
export function studySyncError(error, action = 'sync') {
  const source = typeof error === 'string'
    ? error
    : error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '';
  const message = source.toLowerCase();

  const known = [
    'your session is unavailable.',
    'sign in before saving study work.',
    'device recovery storage is full or unavailable.',
    'account changed while saving. your work was not written to another account.',
    'account changed during recovery.',
    'saved on this device only',
    'saved on this device only - cloud sync is unavailable.',
    'cloud sync unavailable',
    'cloud sync unavailable - showing device saves',
    'planner saved on this device only',
    'notebooks saved on this device only',
    'browser storage is unavailable. export your work before leaving.',
    'cloud sync timed out; using planner saved on this device',
    'update failed',
    'delete failed',
    'invalid cloud snapshot',
    'invalid cloud snapshot.',
  ];
  if (known.includes(message)) return source;

  // Preserve short client/cloud validation messages (e.g. invalid snapshots).
  if (
    source.length > 0
    && source.length <= 160
    && (message.includes('invalid') || message.includes('rejected') || message.includes('malformed'))
    && !/[{[\]]|stack|postgres|openai|gemini|supabase|jwt|rls/i.test(source)
  ) {
    return source;
  }

  // Controlled validation copy from plannerSync / notebookSync recovery paths.
  if (source.startsWith('Invalid cloud snapshot')) {
    return source;
  }

  if (
    source.length > 0
    && source.length <= 120
    && !/[[\]{}]|stack|postgres|openai|gemini|supabase|jwt|rls/i.test(source)
    && (
      message.includes('session')
      || message.includes('sign in')
      || message.includes('device')
      || message.includes('this device')
      || message.includes('storage')
      || message.includes('account changed')
      || message.includes('timed out')
    )
  ) {
    return source;
  }

  if (message.includes('401') || message.includes('unauthorized') || message.includes('sign in')) {
    return 'Sign in again to sync your study work.';
  }
  if (message.includes('429') || message.includes('rate limit') || message.includes('too many')) {
    return 'Too many sync requests were made. Wait a moment, then try again.';
  }
  if (message.includes('409') || message.includes('conflict') || message.includes('changed on another')) {
    return 'Cloud work changed on another device. Export local work or reload before continuing.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('timeout') || message.includes('abort')) {
    return 'VertexED could not reach cloud sync. Your device copy is preserved where possible.';
  }

  if (message.includes('invalid cloud snapshot') || message.includes('invalid snapshot')) {
    return source.length > 0 && source.length <= 160 ? source : 'Invalid cloud snapshot';
  }

  if (action === 'update') return 'Could not update this item in the cloud.';
  if (action === 'delete') return 'Could not delete this item in the cloud.';
  if (action === 'load') return 'Cloud sync unavailable - showing device saves';
  if (action === 'local-fallback') return 'Saved on this device only';
  return 'Cloud sync unavailable';
}
