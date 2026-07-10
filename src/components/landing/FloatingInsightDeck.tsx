import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FLOATING_INSIGHTS } from "@/content/landing";
import LiquidGlass from "@/components/LiquidGlass";

const prefersReducedMotion = () =>
  typeof window === "undefined" || !window.matchMedia
    ? true
    : window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FloatingInsightDeck() {
  const [active, setActive] = useState(0);
  const total = FLOATING_INSIGHTS.length;

  const go = useCallback(
    (delta: number) => {
      setActive((i) => (i + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section className="insight-deck-section px-6 py-16 md:py-20">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3 text-center">Why we exist</p>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center leading-tight mb-4 max-w-3xl mx-auto">
          Learning broke somewhere between access and structure
        </h2>
        <p className="text-center text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Resources exploded. Quality didn&apos;t. Students are oversaturated and still under-prepared —
          especially where smaller programmes don&apos;t get the depth IB or A Level students take for granted.
        </p>

        <div className="insight-carousel relative mx-auto max-w-xl min-h-[18rem] md:min-h-[20rem]">
          {FLOATING_INSIGHTS.map((item, i) => {
            const offset = i - active;
            const dist = Math.abs(offset);
            if (dist > 2) return null;

            const wrappedOffset =
              offset > total / 2 ? offset - total : offset < -total / 2 ? offset + total : offset;

            return (
              <LiquidGlass
                key={item.label}
                as="article"
                variant="card"
                role="button"
                tabIndex={i === active ? 0 : -1}
                aria-hidden={i !== active}
                aria-label={`${item.headline}. Card ${i + 1} of ${total}.`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActive(i);
                  }
                }}
                className={`insight-carousel-card absolute inset-x-4 top-0 p-6 md:p-8 cursor-pointer transition-all duration-500 ease-out rounded-2xl ${
                  i === active ? "insight-carousel-card-active" : ""
                }`}
                style={{
                  zIndex: 10 - dist,
                  transform: `translateX(${wrappedOffset * 14}px) translateY(${dist * 10}px) scale(${1 - dist * 0.045})`,
                  opacity: dist === 0 ? 1 : dist === 1 ? 0.72 : 0.4,
                  pointerEvents: dist <= 1 ? "auto" : "none",
                }}
              >
                <p className="text-xs uppercase tracking-widest text-primary mb-2">{item.label}</p>
                <h3 className="text-xl font-semibold text-foreground mb-3 leading-snug">{item.headline}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.body}</p>
              </LiquidGlass>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={() => go(-1)}
            className="insight-carousel-nav"
            aria-label="Previous insight"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2" role="tablist" aria-label="Insight cards">
            {FLOATING_INSIGHTS.map((item, i) => (
              <button
                key={item.label}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={item.label}
                onClick={() => setActive(i)}
                className={`h-2 rounded-full transition-all ${i === active ? "w-6 bg-primary" : "w-2 bg-foreground/20 hover:bg-foreground/35"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            className="insight-carousel-nav"
            aria-label="Next insight"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
