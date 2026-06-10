import { useEffect } from "react";

/**
 * Auto-reveals any element with `.reveal` once it scrolls into view.
 * Mount once at the layout level — listens app-wide via IntersectionObserver.
 */
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    let revealed = 0;
    const firedReveals = new Set<number>();
    // Lazy import to avoid circular costs
    const fire = (name: string, props?: Record<string, unknown>) => {
      import("@/lib/analytics").then((m) => m.track(name, props)).catch(() => {});
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
            revealed += 1;
            for (const m of [1, 5, 15]) {
              if (revealed === m && !firedReveals.has(m)) {
                firedReveals.add(m);
                fire("scroll_reveal_milestone", { count: m });
              }
            }
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)").forEach((el) => io.observe(el));
    };
    scan();

    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    const depthsFired = new Set<number>();
    const onScroll = () => {
      const h = document.documentElement;
      const pct = Math.round(((h.scrollTop + window.innerHeight) / h.scrollHeight) * 100);
      for (const d of [25, 50, 75, 100]) {
        if (pct >= d && !depthsFired.has(d)) {
          depthsFired.add(d);
          fire("scroll_depth", { percent: d, path: window.location.pathname });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}
