import { NavigatorLockAcquireTimeoutError } from '@supabase/supabase-js';

/**
 * Keep Web Locks' cross-tab exclusion, but fulfill its native callback even when
 * the operation fails. Firefox can report a rejected LockGrantedCallback as a
 * page error before Supabase handles the outer acquisition promise.
 *
 * The public Supabase LockFunc contract still receives the original operation
 * error or its recognized acquisition-timeout error, after the lock is released.
 * @returns {import('@supabase/supabase-js').LockFunc | undefined}
 */
export function getBrowserAuthLock() {
  const manager = globalThis.navigator?.locks;
  if (typeof manager?.request !== 'function') return undefined;

  return async (name, acquireTimeout, fn) => {
    const controller = acquireTimeout > 0 ? new AbortController() : null;
    let timer;
    let timedOut = false;
    let acquired = false;
    if (controller) {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, acquireTimeout);
    }

    try {
      const options = acquireTimeout === 0
        ? { mode: 'exclusive', ifAvailable: true }
        : { mode: 'exclusive', ...(controller ? { signal: controller.signal } : {}) };
      const outcome = await Promise.resolve().then(() => manager.request(name, options, async lock => {
        // This timeout bounds waiting to acquire, never the owner's operation.
        clearTimeout(timer);
        if (!lock) return { kind: acquireTimeout === 0 ? 'busy' : 'missing-lock' };
        acquired = true;
        try {
          return { kind: 'success', value: await fn() };
        } catch (error) {
          return { kind: 'failure', error };
        }
      }));
      if (outcome.kind === 'busy') {
        throw new NavigatorLockAcquireTimeoutError(`Auth lock "${name}" is already held`);
      }
      if (outcome.kind === 'missing-lock') throw new Error('Browser did not grant the requested auth lock');
      if (outcome.kind === 'failure') throw outcome.error;
      return outcome.value;
    } catch (error) {
      if (!acquired && timedOut && error?.name === 'AbortError') {
        throw new NavigatorLockAcquireTimeoutError(`Auth lock "${name}" acquisition timed out`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
}
