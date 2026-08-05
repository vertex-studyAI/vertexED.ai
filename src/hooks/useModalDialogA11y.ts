import { useEffect, useRef, type RefObject } from 'react';

import {
  getModalFocusableElements,
  getWrappedFocusTarget,
  isModalCloseKey,
} from '@/lib/modalDialogA11y.mjs';

type Options = {
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
};

export function useModalDialogA11y({ onClose, initialFocusRef }: Options) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const frame = window.requestAnimationFrame(() => {
      const focusable = getModalFocusableElements(dialog);
      (initialFocusRef?.current ?? focusable[0] ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isModalCloseKey(event.key)) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getModalFocusableElements(dialog);
      const activeIndex = focusable.indexOf(document.activeElement);
      const targetIndex = getWrappedFocusTarget({
        activeIndex,
        count: focusable.length,
        shiftKey: event.shiftKey,
      });

      if (targetIndex >= 0) {
        event.preventDefault();
        (focusable[targetIndex] ?? dialog).focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [initialFocusRef]);

  return dialogRef;
}
