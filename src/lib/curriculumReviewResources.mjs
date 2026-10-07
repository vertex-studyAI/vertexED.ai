/** Resolve a Markdown image only against the selected packet's retained files. */
export function resolveReviewImage(resources, sourcePath, reference) {
  if (!Array.isArray(resources) || typeof sourcePath !== 'string' || typeof reference !== 'string') return null;
  let decoded;
  try { decoded = decodeURIComponent(reference); } catch { return null; }
  if (!decoded || decoded !== decoded.trim() || /[\\?#]/.test(decoded)
    || [...decoded].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)
    || decoded.startsWith('/') || /^[a-z][a-z\d+.-]*:/i.test(decoded)) return null;

  const parts = sourcePath.split('/');
  parts.pop();
  for (const part of decoded.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (!parts.length) return null;
      parts.pop();
    } else parts.push(part);
  }
  const path = parts.join('/');
  const matches = resources.filter((item) => item.kind === 'image' && item.path === path);
  return matches.length === 1 ? matches[0] : null;
}

export function reviewResourceUrl(packetKey, resourceId) {
  return `/api/curriculum-review?${new URLSearchParams({ action: 'resource', packet: packetKey, resource: resourceId })}`;
}
