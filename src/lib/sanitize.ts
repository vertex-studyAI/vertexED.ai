/**
 * Sanitize user-generated markdown/HTML before render.
 */
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b/gi,
  /<object\b/gi,
  /<embed\b/gi,
  /data:\s*text\/html/gi,
];

export function sanitizeHtml(input: string): string {
  let out = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    out = out.replace(pattern, '');
  }
  return out;
}

export function sanitizeMarkdown(input: string): string {
  return sanitizeHtml(input)
    .replace(/<(?!\/?(p|br|strong|em|code|pre|ul|ol|li|h[1-6]|span)\b)[^>]+>/gi, '');
}
