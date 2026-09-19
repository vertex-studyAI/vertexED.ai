/**
 * Allow only navigable schemes that cannot execute script in the page.
 * Relative paths and in-page hashes are kept; protocol-relative and
 * javascript:/data:/vbscript: URLs are rejected.
 */
export function safeMarkdownHref(href) {
  if (typeof href !== 'string') return undefined;
  const value = href.trim();
  if (!value) return undefined;
  if (value.startsWith('#') || (value.startsWith('/') && !value.startsWith('//'))) {
    return value;
  }
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' || url.protocol === 'http:' || url.protocol === 'mailto:') {
      return url.href;
    }
  } catch {
    // Invalid absolute URL.
  }
  return undefined;
}
