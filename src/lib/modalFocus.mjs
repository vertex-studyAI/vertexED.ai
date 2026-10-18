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
  if (element.matches?.(':disabled, input[type="hidden"]')) return false;
  const view = element.ownerDocument?.defaultView;
  if (view?.getComputedStyle) {
    const visibility = view.getComputedStyle(element).visibility;
    if (visibility === 'hidden' || visibility === 'collapse') return false;
    for (let parent = element; parent; parent = parent.parentElement) {
      if (view.getComputedStyle(parent).display === 'none') return false;
    }
  }
  return element.tabIndex >= 0;
}

export function getModalFocusableElements(container) {
  if (!container || typeof container.querySelectorAll !== 'function') return [];
  return Array.from(container.querySelectorAll(MODAL_FOCUSABLE_SELECTOR))
    .filter(isAvailable)
    .sort((left, right) => {
      const leftOrder = left.tabIndex > 0 ? left.tabIndex : Infinity;
      const rightOrder = right.tabIndex > 0 ? right.tabIndex : Infinity;
      return leftOrder === rightOrder ? 0 : leftOrder - rightOrder;
    });
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
  if (!event || event.key !== 'Tab' || event.defaultPrevented || !container) return false;
  const focusables = getModalFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    if (typeof container.focus === 'function') container.focus();
    return true;
  }

  const active = container.ownerDocument?.activeElement;
  const activeIndex = focusables.indexOf(active);
  const nextIndex = activeIndex < 0
    ? (event.shiftKey ? focusables.length - 1 : 0)
    : (activeIndex + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
  // WebKit can omit buttons from native Tab navigation. Own every step of the
  // dialog's sequence so leaving a text field cannot escape into browser chrome.
  event.preventDefault();
  focusables[nextIndex].focus();
  return true;
}

export function restoreModalFocus(element) {
  if (!element || element.isConnected === false || typeof element.focus !== 'function') return false;
  element.focus();
  return true;
}
