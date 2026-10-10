import { authFetchWithAccessToken, getAccessToken } from '@/lib/apiAuth';
import { getUserContentStorageScope } from '@/lib/userContentStorageScope.mjs';

export async function importPdfText(buffer: ArrayBuffer, signal: AbortSignal) {
  const scope = getUserContentStorageScope();
  const token = await getAccessToken();
  if (!scope || !token || getUserContentStorageScope() !== scope) throw new Error('Sign in again to import a PDF. No source has been added.');
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  const response = await authFetchWithAccessToken('/api/import-source', token, {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: btoa(binary) }),
  });
  const result = await response.json().catch(() => null);
  if (getUserContentStorageScope() !== scope) throw new Error('Account changed. Choose the PDF again in your current account.');
  if (!response.ok) throw new Error(result?.error || 'PDF import is unavailable. No source has been added.');
  if (typeof result?.content !== 'string' || !result.content.trim() || result.content.length > 50_000
    || !Number.isInteger(result.pageCount) || result.pageCount < 1 || result.pageCount > 25
    || !Array.isArray(result.blankPages) || result.blankPages.some((page: unknown) => !Number.isInteger(page) || Number(page) < 1 || Number(page) > result.pageCount)) {
    throw new Error('PDF extraction returned an incomplete result. No source has been added.');
  }
  return result as { content: string; pageCount: number; blankPages: number[] };
}
