import DOMPurify from 'dompurify';

const MARKDOWN_ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a'];

const BASE_SANITIZE_CONFIG = {
  ALLOWED_ATTR: ['href', 'title', 'class'],
  ALLOW_DATA_ATTR: false,
  // Keep sanitizer output detached from caller-owned DOM nodes. This is
  // intentionally explicit because DOMPurify's GHSA-55q2-fjhq-7xh7 requires
  // the non-default IN_PLACE mode together with an element-removal hook.
  IN_PLACE: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
} as const;

/**
 * Sanitize user-generated HTML before render.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ...BASE_SANITIZE_CONFIG,
    ALLOWED_TAGS: [...MARKDOWN_ALLOWED_TAGS, 'blockquote', 'hr'],
  });
}

export function sanitizeMarkdown(input: string): string {
  return DOMPurify.sanitize(input, {
    ...BASE_SANITIZE_CONFIG,
    ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
  });
}
