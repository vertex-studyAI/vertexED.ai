const APEX_EXCLUDED_ROUTES = new Set([
  '/login',
  '/signup',
  '/auth/callback',
  '/onboarding',
  '/privacy',
  '/terms',
]);

const APEX_EXCLUDED_PREFIXES = ['/admin/'];

export function shouldOfferApex(pathname) {
  const normalized = typeof pathname === 'string' && pathname.startsWith('/')
    ? pathname.replace(/\/+$/, '') || '/'
    : '/';
  return !APEX_EXCLUDED_ROUTES.has(normalized)
    && !APEX_EXCLUDED_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}
