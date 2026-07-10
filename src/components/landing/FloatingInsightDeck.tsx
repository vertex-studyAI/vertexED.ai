import { useEffect, useRef } from "react";
import { FLOATING_INSIGHTS } from "@/content/landing";

const prefersReducedMotion = () =>
  typeof window === "undefined" || !window.matchMedia
    ? true
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FloatingInsightDeck() {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !sectionRef.current || !stackRef.current) return;

    let cleanup = () => {};
    const idle = (cb: () => void) =>
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 1500 })
        : (setTimeout(cb, 400) as unknown as number);
    const cancel = (id: number) =>
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    const id = idle(async () => {
      try {
        const [{ default: gsap }, mod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        const ScrollTrigger = (mod as { default?: unknown }).default ?? mod;
        gsap.registerPlugin(ScrollTrigger as object);

        const cards = gsap.utils.toArray<HTMLElement>(".insight-float-card");
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            {
              y: 80 + i * 24,
              rotate: -4 + i * 2,
              scale: 0.94,
              opacity: 0.4,
            },
            {
              y: i * -18,
              rotate: -2 + i * 1.5,
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: `top ${68 - i * 6}%`,
                end: `bottom ${40 - i * 4}%`,
                scrub: 0.8,
              },
            },
          );
        });

        cleanup = () => {
          try {
            (ScrollTrigger as { getAll?: () => Array<{ kill?: () => void }> }).getAll?.().forEach((t) => t.kill?.());
          } catch {}
        };
      } catch {}
    });

    return () => {
      cancel(id);
      cleanup();
    };
  }, []);

  return (
    <section ref={sectionRef} className="insight-deck-section px-6 py-20 md:py-28">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3 text-center">Why we exist</p>
        <h2 className="text-3xl md:text-5xl font-bold text-foreground text-center leading-tight mb-4 max-w-3xl mx-auto">
          Learning broke somewhere between access and structure
        </h2>
        <p className="text-center text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-14">
          Resources exploded. Quality didn&apos;t. Students are anxious, oversaturated, and still under-prepared —
          especially where boards like IB MYP lack the depth bigger programmes get for free.
        </p>

        <div ref={stackRef} className="insight-deck-stack relative min-h-[28rem] md:min-h-[32rem]">
          {FLOATING_INSIGHTS.map((item, i) => (
            <article
              key={item.label}
              className="insight-float-card neu-card absolute left-1/2 -translate-x-1/2 w-[min(100%,22rem)] md:w-[26rem] p-6 md:p-8"
              style={{
                top: `${i * 12}%`,
                zIndex: i + 1,
              }}
            >
              <p className="text-xs uppercase tracking-widest text-primary mb-2">{item.label}</p>
              <h3 className="text-xl font-semibold text-foreground mb-3 leading-snug">{item.headline}</h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
