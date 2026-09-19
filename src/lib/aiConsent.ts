import { getUserContentStorageScope, userContentStorageKeys } from '@/lib/userContentStorageScope.mjs';
export const AI_CONSENT_EVENT = 'vertexed:ai-consent-request';
export class AiConsentDeclinedError extends Error {
  constructor() { super('AI processing was not allowed. Your draft stays here. You can continue with manual study tools.'); this.name = 'AiConsentDeclinedError'; }
}
export function isAiConsentDeclined(error: unknown) { return error instanceof Error && error.name === 'AiConsentDeclinedError'; }
export type ConsentRequest = { scope: string | null; resolve: (allowed: boolean) => void };
let pending: { scope: string | null; promise: Promise<boolean> } | null = null;
export function aiConsentEnabled() {
  try { return localStorage.getItem(userContentStorageKeys().aiConsent) === 'v1:allowed'; } catch { return false; }
}
export function setAiConsent(allowed: boolean) {
  try { if (allowed) localStorage.setItem(userContentStorageKeys().aiConsent, 'v1:allowed'); else localStorage.removeItem(userContentStorageKeys().aiConsent); } catch { /* Permission may still apply to this request only. */ }
}
export async function requestAiConsent(signal?: AbortSignal | null): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (signal?.aborted) return false;
  if (aiConsentEnabled()) return true;
  const scope = getUserContentStorageScope();
  const waitForRequest = (promise: Promise<boolean>) => new Promise<boolean>(resolve => {
    const abort = () => resolve(false);
    signal?.addEventListener('abort', abort, { once: true });
    promise.then(resolve).finally(() => signal?.removeEventListener('abort', abort));
  });
  if (pending?.scope === scope) return waitForRequest(pending.promise);
  const promise = new Promise<boolean>(resolve => {
    // Fail closed if the dialog is unavailable or left open. No request is sent.
    const timer = window.setTimeout(() => resolve(false), 120_000);
    const request: ConsentRequest = { scope, resolve: allowed => { window.clearTimeout(timer); resolve(allowed && getUserContentStorageScope() === scope); } };
    window.dispatchEvent(new CustomEvent(AI_CONSENT_EVENT, { detail: request }));
  });
  pending = { scope, promise };
  void promise.finally(() => { if (pending?.promise === promise) pending = null; });
  return waitForRequest(promise);
}
