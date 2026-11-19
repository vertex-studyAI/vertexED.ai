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
  isAvailableModalFocusTarget,
  restoreModalFocus,
  trapModalFocus,
} from "@/lib/modalFocus.mjs";

type FocusReturn = {
  dialog: HTMLElement;
  returnTarget: HTMLElement | null;
  fallbackTarget: HTMLElement | null;
};
const pendingFocusReturns = new WeakMap<Document, {
  candidates: FocusReturn[];
  cancel: () => void;
}>();
const hiddenModalSiblings = new WeakMap<HTMLElement, {
  count: number;
  inert: boolean;
  ariaHidden: string | null;
}>();

function restoreAfterClose(candidate: FocusReturn) {
  const owner = candidate.dialog.ownerDocument;
  const view = owner.defaultView;
  if (!view) return;
  const pending = pendingFocusReturns.get(owner);
  if (pending) {
    pending.candidates.push(candidate);
    return;
  }

  const candidates = [candidate];
  let cancelled = false;
  let frame: number | undefined;
  let restoredTarget: HTMLElement | null = null;
  const cancel = () => {
    cancelled = true;
    if (frame !== undefined) view.cancelAnimationFrame(frame);
    owner.removeEventListener('pointerdown', cancel, true);
    owner.removeEventListener('keydown', cancel, true);
    if (pendingFocusReturns.get(owner) === state) pendingFocusReturns.delete(owner);
  };
  const state = { candidates, cancel };
  pendingFocusReturns.set(owner, state);
  owner.addEventListener('pointerdown', cancel, true);
  owner.addEventListener('keydown', cancel, true);

  const hasNewFocusOwner = () => {
    const active = owner.activeElement;
    return isAvailableModalFocusTarget(active) && active !== owner.body
      && active !== owner.documentElement && active !== restoredTarget;
  };
  const restore = () => {
    if (cancelled) return;
    // Preserve a later user action or programmatic focus move, even if it goes
    // to another restoration candidate such as the fallback control.
    if (hasNewFocusOwner()) {
      cancel();
      return;
    }
    // Simultaneous nested teardown can leave the latest opener detached. Keep
    // earlier candidates so the outer dialog can still return to its opener.
    for (const { dialog, returnTarget, fallbackTarget } of candidates.slice().reverse()) {
      if (dialog.isConnected) continue;
      if (restoreModalFocus(returnTarget)) {
        restoredTarget = returnTarget;
        break;
      }
      if (hasNewFocusOwner()) {
        cancel();
        return;
      }
      if (restoreModalFocus(fallbackTarget)) {
        restoredTarget = fallbackTarget;
        break;
      }
      if (hasNewFocusOwner()) {
        cancel();
        return;
      }
    }
  };
  view.queueMicrotask(() => {
    restore();
    if (cancelled) return;
    // WebKit can ignore focus immediately after inert/overlay removal. Recheck
    // once at the next frame, without taking focus from a newer interaction.
    if (typeof view.requestAnimationFrame === 'function') {
      frame = view.requestAnimationFrame(() => {
        restore();
        cancel();
      });
    } else cancel();
  });
}

type AccessibleModalProps = PropsWithChildren<{
  titleId: string;
  descriptionId?: string;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  openerRef?: RefObject<HTMLElement | null>;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
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
  fallbackFocusRef,
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
    pendingFocusReturns.get(document)?.cancel();
    // Safari does not always focus a button on pointer activation. Callers can
    // identify the actual opener instead of relying on the previously focused field.
    returnFocusRef.current = openerRef?.current ?? (document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null);
    const hiddenSiblings: HTMLElement[] = [];
    const dialog = dialogRef.current;
    const fallbackTarget = fallbackFocusRef?.current ?? null;
    // A visible dialog must already own keyboard focus. Waiting for another
    // animation frame lets an immediate Escape go to the background in WebKit.
    focusInitialModalElement(dialog, initialFocusRef?.current ?? null);
    for (const sibling of Array.from(document.body.children)) {
      if (!(sibling instanceof HTMLElement) || sibling === overlayRef.current) continue;
      const hidden = hiddenModalSiblings.get(sibling);
      if (hidden) hidden.count += 1;
      else hiddenModalSiblings.set(sibling, {
        count: 1,
        inert: sibling.inert,
        ariaHidden: sibling.getAttribute('aria-hidden'),
      });
      hiddenSiblings.push(sibling);
      sibling.inert = true;
      sibling.setAttribute('aria-hidden', 'true');
    }

    return () => {
      for (const element of hiddenSiblings) {
        const hidden = hiddenModalSiblings.get(element);
        if (!hidden || --hidden.count > 0) continue;
        const { inert, ariaHidden } = hidden;
        hiddenModalSiblings.delete(element);
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', ariaHidden);
      }
      const returnTarget = returnFocusRef.current;
      if (dialog) restoreAfterClose({ dialog, returnTarget, fallbackTarget });
    };
  }, [initialFocusRef, openerRef, fallbackFocusRef]);

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
