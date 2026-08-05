export const MODAL_FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isAvailable(element) {
  if (!element || typeof element.focus !== 'function') return false;
  if (element.hasAttribute('hidden') || element.getAttribute('aria-hidden') === 'true') return false;
  if (element.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
  return element.tabIndex >= 0;
}

export function getModalFocusableElements(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  return Array.from(container.querySelectorAll(MODAL_FOCUSABLE_SELECTOR)).filter(isAvailable);
}

export function focusInitialModalElement(container, preferredElement) {
  if (!container) return null;
  const focusables = getModalFocusableElements(container);
  const target = isAvailable(preferredElement) && container.contains(preferredElement)
    ? preferredElement
    : focusables[0] || container;
  if (typeof target.focus === 'function') target.focus();
  return target;
}

export function trapModalFocus(event, container) {
  if (!event || event.key !== 'Tab' || !container) return false;
  const focusables = getModalFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    if (typeof container.focus === 'function') container.focus();
    return true;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = container.ownerDocument?.activeElement;

  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus();
    return true;
  }

  if (!event.shiftKey && (active === last || !container.contains(active))) {
    event.preventDefault();
    first.focus();
    return true;
  }

  return false;
}

export function restoreModalFocus(element) {
  if (!element || element.isConnected === false || typeof element.focus !== 'function') return false;
  element.focus();
  return true;
}
