import {
  type CSSProperties,
  type KeyboardEvent,
  type PropsWithChildren,
  type RefObject,
  useLayoutEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  focusInitialModalElement,
  restoreModalFocus,
  trapModalFocus,
} from "@/lib/modalFocus.mjs";

type AccessibleModalProps = PropsWithChildren<{
  titleId: string;
  descriptionId?: string;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  openerRef?: RefObject<HTMLElement | null>;
  overlayClassName?: string;
  className?: string;
  style?: CSSProperties;
  busy?: boolean;
}>;

export default function AccessibleModal({
  titleId,
  descriptionId,
  onClose,
  initialFocusRef,
  openerRef,
  overlayClassName = "blur-background",
  className,
  style,
  busy = false,
  children,
}: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    // Safari does not always focus a button on pointer activation. Callers can
    // identify the actual opener instead of relying on the previously focused field.
    returnFocusRef.current = openerRef?.current ?? (document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null);
    const hiddenSiblings: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
    const dialog = dialogRef.current;
    // A visible dialog must already own keyboard focus. Waiting for another
    // animation frame lets an immediate Escape go to the background in WebKit.
    focusInitialModalElement(dialog, initialFocusRef?.current ?? null);
    for (const sibling of Array.from(document.body.children)) {
      if (!(sibling instanceof HTMLElement) || sibling === overlayRef.current) continue;
      hiddenSiblings.push({
        element: sibling,
        inert: sibling.inert,
        ariaHidden: sibling.getAttribute('aria-hidden'),
      });
      sibling.inert = true;
      sibling.setAttribute('aria-hidden', 'true');
    }

    return () => {
      for (const { element, inert, ariaHidden } of hiddenSiblings) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      }
      const returnTarget = returnFocusRef.current;
      window.queueMicrotask(() => {
        if (!dialog?.isConnected) restoreModalFocus(returnTarget);
      });
    };
  }, [initialFocusRef, openerRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    trapModalFocus(event, dialogRef.current);
  };

  const modal = (
    <div ref={overlayRef} className={overlayClassName} role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className={className}
        style={style}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );

  return typeof document === "undefined" ? modal : createPortal(modal, document.body);
}
