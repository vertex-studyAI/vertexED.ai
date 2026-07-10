import DOMPurify from 'dompurify';

const MARKDOWN_ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a'];

/**
 * Sanitize user-generated HTML before render.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [...MARKDOWN_ALLOWED_TAGS, 'blockquote', 'hr'],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeMarkdown(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}
