import { type PropsWithChildren, useEffect, useRef } from "react";
import { installNotetakerAccessibility } from "@/lib/notetakerAccessibility.mjs";

export default function NotetakerAccessibilityBoundary({ children }: PropsWithChildren) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return installNotetakerAccessibility(root);
  }, []);

  return (
    <div ref={rootRef} data-vertexed-notetaker-accessibility="true">
      {children}
    </div>
  );
}
