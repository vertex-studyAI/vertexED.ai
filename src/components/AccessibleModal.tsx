import {
  type CSSProperties,
  type KeyboardEvent,
  type PropsWithChildren,
  type RefObject,
  useEffect,
  useRef,
} from "react";
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
  className?: string;
  style?: CSSProperties;
  busy?: boolean;
}>;

export default function AccessibleModal({
  titleId,
  descriptionId,
  onClose,
  initialFocusRef,
  className,
  style,
  busy = false,
  children,
}: AccessibleModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const frame = window.requestAnimationFrame(() => {
      focusInitialModalElement(dialogRef.current, initialFocusRef?.current ?? null);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      const returnTarget = returnFocusRef.current;
      window.queueMicrotask(() => restoreModalFocus(returnTarget));
    };
  }, [initialFocusRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    trapModalFocus(event, dialogRef.current);
  };

  return (
    <div className="blur-background" role="presentation">
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
}
