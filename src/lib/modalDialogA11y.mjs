export const MODAL_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function getModalFocusableElements(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  return Array.from(container.querySelectorAll(MODAL_FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element instanceof HTMLElement &&
      element.getAttribute('aria-hidden') !== 'true' &&
      !element.hasAttribute('hidden'),
  );
}

export function getWrappedFocusTarget({ activeIndex, count, shiftKey }) {
  if (!Number.isInteger(count) || count <= 0) return -1;
  if (!Number.isInteger(activeIndex) || activeIndex < 0 || activeIndex >= count) {
    return shiftKey ? count - 1 : 0;
  }
  if (shiftKey && activeIndex === 0) return count - 1;
  if (!shiftKey && activeIndex === count - 1) return 0;
  return -1;
}

export function isModalCloseKey(key) {
  return key === 'Escape';
}
