/** Character-by-character reveal; first character is written synchronously. */
export function animateTypewriter(
  text: string,
  onUpdate: (partial: string) => void,
  options?: {
    intervalMs?: number;
    intervalRef?: { current: number | null };
    /** Skip chars already rendered (e.g. first char applied in a prior setState). */
    startIndex?: number;
  },
): Promise<void> {
  const intervalMs = options?.intervalMs ?? 18;
  const intervalRef = options?.intervalRef;
  const startIndex = Math.max(0, options?.startIndex ?? 0);

  if (intervalRef?.current !== null && intervalRef?.current !== undefined) {
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  if (!text.length) {
    onUpdate("");
    return Promise.resolve();
  }

  if (startIndex <= 0) {
    onUpdate(text.slice(0, 1));
    if (text.length === 1) return Promise.resolve();
  } else if (startIndex >= text.length) {
    onUpdate(text);
    return Promise.resolve();
  }

  let index = startIndex > 0 ? startIndex : 1;

  return new Promise<void>((resolve) => {
    const id = window.setInterval(() => {
      onUpdate(text.slice(0, index + 1));
      index += 1;
      if (index >= text.length) {
        window.clearInterval(id);
        if (intervalRef) intervalRef.current = null;
        resolve();
      }
    }, intervalMs);

    if (intervalRef) intervalRef.current = id;
  });
}
