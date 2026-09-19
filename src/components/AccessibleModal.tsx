import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PropsWithChildren,
  type RefObject,
  useEffect,
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
  overlayClassName = "blur-background",
  className,
  style,
  busy = false,
  children,
}: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const hiddenSiblings: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
    const frame = window.requestAnimationFrame(() => {
      focusInitialModalElement(dialogRef.current, initialFocusRef?.current ?? null);
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
    });

    return () => {
      window.cancelAnimationFrame(frame);
      for (const { element, inert, ariaHidden } of hiddenSiblings) {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      }
      const returnTarget = returnFocusRef.current;
      window.queueMicrotask(() => restoreModalFocus(returnTarget));
    };
  }, [initialFocusRef]);

  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
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
