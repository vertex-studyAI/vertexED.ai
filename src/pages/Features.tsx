import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import { PLATFORM_FEATURES } from "@/content/features";

export default function Features() {
  useEffect(() => {
    if (typeof window === "undefined") return;
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
        gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) => {
          gsap.fromTo(el, { y: 48, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1.1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
          });
        });
        cleanup = () => {
          try { (ScrollTrigger as { getAll?: () => Array<{ kill?: () => void }> }).getAll?.().forEach((t) => t.kill?.()); } catch {}
        };
      } catch {}
    });
    return () => { cancel(id); cleanup(); };
  }, []);

  return (
    <>
      <SEO title="Features · VertexED" description="Study Zone, Apex, Planner, Paper Maker, Answer Reviewer, and Notes — one connected ecosystem." canonical="https://www.vertexed.app/features" />
      <Helmet><meta name="robots" content="index, follow" /></Helmet>

      <section className="pt-8 pb-16 px-4 md:px-6 fade-up">
        <div className="max-w-5xl mx-auto glass-panel p-8 md:p-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Inside VertexED</p>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            <TypeAnimation sequence={[600, "Tools that earn their place.", 1800, "One ecosystem, not nine tabs."]} wrapper="span" cursor repeat={Infinity} />
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Every feature maps to how you actually study: plan, focus, practise, review, remember. We use these tools ourselves.
          </p>
          <div className="mt-8 flex gap-3 justify-center flex-wrap">
            <Link to="/signup" className="btn-solid">Get started</Link>
            <Link to="/" className="btn-glass">Back home</Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 pb-20 space-y-10">
        {PLATFORM_FEATURES.map((f, i) => (
          <article key={f.id} className={`fade-up glass-tile p-8 md:p-10 ${i % 2 === 1 ? "md:ml-8" : "md:mr-8"}`}>
            <div className="flex items-baseline gap-4 mb-4">
              <span className="text-3xl font-bold text-primary/30 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm text-primary font-medium">{f.tagline}</p>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">{f.title}</h2>
              </div>
            </div>
            <p className="text-foreground/90 leading-relaxed mb-4">{f.body}</p>
            <p className="text-muted-foreground leading-relaxed mb-5">{f.detail}</p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm text-foreground/85">
              {f.bullets.map((b) => (
                <li key={b} className="flex gap-2"><span className="text-primary">→</span><span>{b}</span></li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="fade-up px-6 pb-20">
        <div className="max-w-4xl mx-auto glass-panel p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">The connected loop</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Learn → plan → focus → practise → review → remember. One journey, not disconnected apps.
          </p>
          <Link to="/signup" className="btn-solid">Start your ecosystem</Link>
        </div>
      </section>
    </>
  );
}
