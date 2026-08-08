import {
  focusInitialModalElement,
  restoreModalFocus,
  trapModalFocus,
} from './modalFocus.mjs';

const DIALOG_MARKER = 'data-vertexed-notetaker-dialog';
const CONTROL_MARKER = 'data-vertexed-notetaker-labelled';
const STATUS_MARKER = 'data-vertexed-notetaker-status';

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function hasAccessibleName(element) {
  if (!element) return false;
  if (normalize(element.getAttribute?.('aria-label'))) return true;
  if (normalize(element.getAttribute?.('aria-labelledby'))) return true;
  if (element.id) {
    const matchingLabel = Array.from(element.ownerDocument?.querySelectorAll('label[for]') || [])
      .some((label) => label.htmlFor === element.id);
    if (matchingLabel) return true;
  }
  if (element.closest?.('label')) return true;
  return false;
}

function setAccessibleName(element, label) {
  if (!element || hasAccessibleName(element)) return false;
  element.setAttribute('aria-label', label);
  element.setAttribute(CONTROL_MARKER, 'true');
  return true;
}

function selectContains(select, matcher) {
  return Array.from(select.options || []).some((option) => matcher(normalize(option.textContent)));
}

function labelControls(root) {
  const inputs = Array.from(root.querySelectorAll('input, textarea'));
  for (const element of inputs) {
    const placeholder = normalize(element.getAttribute('placeholder'));
    if (placeholder.startsWith('e.g. IB Biology')) setAccessibleName(element, 'Study topic or source material');
    else if (placeholder.startsWith('Describe custom format')) setAccessibleName(element, 'Custom note format');
    else if (placeholder.startsWith('Board, command words')) setAccessibleName(element, 'Additional information');
    else if (placeholder.startsWith('Notes appear here')) setAccessibleName(element, 'Editable study notes');
    else if (placeholder === 'Write your answer...') setQuestionAnswerName(element, 'Free-response answer');
    else if (placeholder === 'Interact with the prompt...') setQuestionAnswerName(element, 'Interactive answer');
  }

  for (const select of root.querySelectorAll('select')) {
    if (hasAccessibleName(select)) continue;
    if (selectContains(select, (text) => text === 'Quick Notes')) setAccessibleName(select, 'Note format');
    else if (selectContains(select, (text) => text === 'Short notes')) setAccessibleName(select, 'Note length');
    else if (selectContains(select, (text) => /^\d+ flashcards$/.test(text))) setAccessibleName(select, 'Flashcard count');
    else if (selectContains(select, (text) => text === 'Adaptive Learning')) setAccessibleName(select, 'Quiz type');
    else if (selectContains(select, (text) => text === 'Easy') && selectContains(select, (text) => text === 'Hard')) setAccessibleName(select, 'Quiz difficulty');
    else if (selectContains(select, (text) => text === 'Short FRQ')) setAccessibleName(select, 'Free-response length');
    else if (selectContains(select, (text) => text === '2') && selectContains(select, (text) => text === '5')) setAccessibleName(select, 'Multiple-choice option count');
  }

  for (const canvas of root.querySelectorAll('canvas')) {
    if (hasAccessibleName(canvas)) continue;
    const cardText = normalize(canvas.closest('div.rounded-2xl, div')?.parentElement?.textContent);
    if (/record|audio|microphone/i.test(cardText)) {
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', 'Live microphone waveform');
    }
  }

  for (const button of root.querySelectorAll('button')) {
    if (hasAccessibleName(button)) continue;
    const text = normalize(button.textContent);
    if (/^\d+$/.test(text) && button.closest('.overflow-auto')) {
      setAccessibleName(button, `Show flashcard ${text}`);
      if (/bg-primary\/20/.test(button.className || '')) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }
}

function findQuestionContainer(element) {
  let current = element.parentElement;
  while (current) {
    const prompt = current.querySelector?.('.mb-3.break-words.text-sm');
    if (prompt) return { container: current, prompt };
    current = current.parentElement;
  }
  return null;
}

function setQuestionAnswerName(element, prefix) {
  if (hasAccessibleName(element)) return;
  const question = findQuestionContainer(element);
  const prompt = normalize(question?.prompt?.textContent);
  setAccessibleName(element, prompt ? `${prefix}: ${prompt}` : prefix);
}

function labelQuizGroups(root) {
  const radiosByName = new Map();
  for (const radio of root.querySelectorAll('input[type="radio"][name]')) {
    const name = radio.getAttribute('name');
    if (!name) continue;
    if (!radiosByName.has(name)) radiosByName.set(name, []);
    radiosByName.get(name).push(radio);
  }

  for (const radios of radiosByName.values()) {
    const first = radios[0];
    const question = findQuestionContainer(first);
    if (!question) continue;
    const group = first.closest('.space-y-2') || first.parentElement?.parentElement;
    if (!group) continue;
    const prompt = normalize(question.prompt.textContent) || 'Multiple-choice question';
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', prompt);
    group.setAttribute(CONTROL_MARKER, 'true');
  }
}

function markStatus(element, label) {
  if (!element || element.getAttribute(STATUS_MARKER) === 'true') return;
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  element.setAttribute('aria-atomic', 'true');
  if (label && !element.getAttribute('aria-label')) element.setAttribute('aria-label', label);
  element.setAttribute(STATUS_MARKER, 'true');
}

function markLiveRegions(root) {
  for (const element of root.querySelectorAll('div, span')) {
    const text = normalize(element.textContent);
    if (/^\d+ questions • \d+ answered$/.test(text)) markStatus(element, 'Quiz generation and answer progress');
    else if (/^Accuracy:\s*\d+%$/.test(text)) markStatus(element, 'Quiz result');
    else if (/^Words:\s*\d+$/.test(text)) markStatus(element, 'Notes word count');
    else if (text === 'Copied!') markStatus(element, 'Notes copied');
  }
}

function isStudyOverlay(overlay) {
  const text = normalize(overlay.textContent);
  return text.includes('Spaced Repetition · Study Mode') || (/Card \d+\/\d+/.test(text) && /Reveal|Previous|Next/.test(text));
}

function findOverlayDialog(overlay) {
  const HTMLElementCtor = overlay.ownerDocument?.defaultView?.HTMLElement;
  const directChildren = Array.from(overlay.children || []);
  return directChildren.find((child) => HTMLElementCtor && child instanceof HTMLElementCtor) || null;
}

function findCloseButton(dialog) {
  return Array.from(dialog.querySelectorAll('button')).find((button) => button.querySelector('svg.lucide-x, svg[class*="lucide-x"]')) || null;
}

export function enhanceNotetakerDialog(overlay, returnFocus = overlay.ownerDocument?.activeElement) {
  if (!overlay || overlay.getAttribute(DIALOG_MARKER) === 'true' || !isStudyOverlay(overlay)) return null;
  const dialog = findOverlayDialog(overlay);
  if (!dialog) return null;

  const view = overlay.ownerDocument?.defaultView;
  const studyMode = normalize(overlay.textContent).includes('Spaced Repetition · Study Mode');
  const label = studyMode ? 'Spaced repetition study mode' : 'Fullscreen flashcard study';
  const closeButton = findCloseButton(dialog);

  overlay.setAttribute(DIALOG_MARKER, 'true');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', label);
  dialog.setAttribute('tabindex', '-1');
  if (closeButton) setAccessibleName(closeButton, `Close ${label}`);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeButton?.click();
      return;
    }
    trapModalFocus(event, dialog);
  };
  dialog.addEventListener('keydown', handleKeyDown);

  // Put focus inside the dialog immediately so there is never a keyboard frame
  // where an open modal leaves focus behind on the page. Reassert on the next
  // visual frame in case mounting/layout work moves focus after this enhancer runs.
  focusInitialModalElement(dialog, closeButton);
  if (view?.requestAnimationFrame) {
    view.requestAnimationFrame(() => {
      if (overlay.isConnected) focusInitialModalElement(dialog, closeButton);
    });
  }

  const HTMLElementCtor = view?.HTMLElement;
  return {
    overlay,
    dialog,
    returnFocus: HTMLElementCtor && returnFocus instanceof HTMLElementCtor ? returnFocus : null,
    cleanup({ restoreFocus = false } = {}) {
      dialog.removeEventListener('keydown', handleKeyDown);
      if (restoreFocus) restoreModalFocus(this.returnFocus);
    },
  };
}

function isOverlayCandidate(element) {
  return element?.matches?.('.fixed.inset-0') && isStudyOverlay(element);
}

export function applyNotetakerAccessibility(root) {
  if (!root) return;
  labelControls(root);
  labelQuizGroups(root);
  markLiveRegions(root);
}

export function installNotetakerAccessibility(root) {
  if (!root) return () => {};
  const activeDialogs = new Map();
  const view = root.ownerDocument?.defaultView;

  const scan = () => {
    applyNotetakerAccessibility(root);
    for (const overlay of root.querySelectorAll('.fixed.inset-0')) {
      if (!isOverlayCandidate(overlay) || activeDialogs.has(overlay)) continue;
      const enhanced = enhanceNotetakerDialog(overlay, root.ownerDocument.activeElement);
      if (enhanced) activeDialogs.set(overlay, enhanced);
    }

    for (const [overlay, enhanced] of activeDialogs) {
      if (!overlay.isConnected) {
        enhanced.cleanup({ restoreFocus: true });
        activeDialogs.delete(overlay);
      }
    }
  };

  scan();
  const Observer = view?.MutationObserver;
  if (!Observer) return () => {};
  const observer = new Observer(scan);
  observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });

  return () => {
    observer.disconnect();
    for (const enhanced of activeDialogs.values()) enhanced.cleanup();
    activeDialogs.clear();
  };
}
