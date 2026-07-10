import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

type FlipWordsProps = { words: string[]; interval?: number; className?: string };
const FlipWords: React.FC<FlipWordsProps> = ({ words, interval = 2200, className }) => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setInterval(() => {
      setPhase("out");
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % words.length);
        setPhase("in");
      }, 260);
    }, interval);
    return () => window.clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={`flip-words inline-block ${className || ""}`} aria-live="polite">
      <span className={`fw-word fw-${phase}`}>{words[idx]}</span>
    </span>
  );
};

type LetterPullUpProps = { text: string; delay?: number; className?: string };
const LetterPullUp: React.FC<LetterPullUpProps> = ({ text, delay = 40, className }) => (
  <span className={`letter-pullup ${className || ""}`}>
    {Array.from(text).map((ch, i) => (
      <span key={i} aria-hidden className="lp-char" style={{ transitionDelay: `${i * delay}ms` }}>{ch}</span>
    ))}
  </span>
);

const TextReveal: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <span className={`text-reveal ${className || ""}`}>
    {Array.from(text).map((c, i) => (
      <span aria-hidden key={i} className="tr-char" style={{ transitionDelay: `${i * 28}ms` }}>{c}</span>
    ))}
  </span>
);

const LandoSwapText: React.FC<{ from: string; to: string; triggerMs?: number; className?: string }> = ({ from, to, triggerMs = 2200, className }) => {
  const [current, setCurrent] = useState(from);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion() || from === to) {
      setCurrent(from);
      return;
    }
    const id = window.setInterval(() => {
      setAnimKey((k) => k + 1);
      window.setTimeout(() => setCurrent((c) => (c === from ? to : from)), 300);
    }, triggerMs);
    return () => window.clearInterval(id);
  }, [from, to, triggerMs]);

  if (from === to) return <span className={`lando-swap ${className || ""}`}>{from}</span>;

  const maxLen = Math.max(from.length, to.length);
  const pad = (s: string) => s.padEnd(maxLen, " ");
  const a = pad(current === from ? from : to);
  const b = pad(current === from ? to : from);

  return (
    <span className={`lando-swap ${className || ""}`} data-key={animKey} aria-live="polite" style={{ whiteSpace: "nowrap" }}>
      {Array.from({ length: maxLen }).map((_, i) => (
        <span key={i} className="ls-letter">
          <span className="ls-front" aria-hidden>{a[i]}</span>
          <span className="ls-back" aria-hidden>{b[i]}</span>
        </span>
      ))}
    </span>
  );
};

const featureSideText = [
  "A focused space for independent study; from graphing calculators to activity logs, everything stays in one place.",
  "Not just a soulless bot: it adapts to you and explains concepts in ways that actually make sense.",
  "Organise sessions and activities so you get more done with less friction and less energy spent.",
  "Like a teacher built in, it can be strict — but the feedback helps your work score when it matters.",
  "It is like having infinite practice papers ready to go: nonstop practice based on material that already exists.",
  "This is just the beginning; more features are on their way and what you see now will only get better.",
];

function ProblemCard({ p, i, flipped, toggleFlip }: { p: { stat: string; text: string }; i: number; flipped: boolean; toggleFlip: (i: number) => void }) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip(i);
    }
  };

  return (
    <div className="problem-card-container">
      <div
        onClick={() => toggleFlip(i)}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        className="group relative h-64 rounded-3xl perspective tilt-card pop-up cursor-pointer"
        aria-label={`Problem card ${i + 1}`}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)" }}
        >
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-6xl font-bold rounded-3xl problem-card-front"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.28)",
              color: "#ffffff",
            }}
          >
            <span className="stat-number" style={{ fontFeatureSettings: "'tnum' 1", letterSpacing: "-0.02em", textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>{p.stat}</span>
            <span className="text-lg italic opacity-70 font-normal">Click to find out</span>
          </div>

          <div
            className="absolute inset-0 flex items-center justify-center p-7 text-xl leading-relaxed rounded-3xl"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.10)",
              color: "#e6eef6",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.28)",
            }}
          >
            <div>
              <div className="font-medium">{p.text}</div>
              <div className="mt-5 text-sm italic opacity-80">Backed by active recall, spaced repetition and retrieval practice.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ f, i }: { f: { title: string; desc: string }; i: number }) {
  return (
    <div className={`feature-row flex flex-col md:flex-row items-center gap-14 pop-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
      <div className="flex-1 glass-tile rounded-3xl shadow-2xl p-9 text-slate-100 tilt-card relative overflow-hidden feature-card">
        <div className="relative z-10">
          <h4 className="text-3xl font-bold mb-5 pop-up swap-span hover-text-morph transition-all duration-400">
            <LetterPullUp text={f.title} />
          </h4>
          <p className="pop-up highlight-clip text-lg leading-relaxed">
            <span className="hl-inner">{f.desc}</span>
          </p>
          <div className="mt-6 text-base text-slate-400">Built around proven learning techniques.</div>
        </div>
        <div className="feature-glow" />
      </div>

      <div className="flex-1 text-slate-300 text-xl md:text-2xl leading-relaxed text-center md:text-left pop-up cinematic-text">
        <div className="font-semibold mb-4 hover-text-morph transition-all duration-300">
          {i % 2 === 0
            ? "The all in one hub for your study sessions with all the tools one could ask for."
            : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}
        </div>
        <div className="text-lg text-slate-400 opacity-90">{featureSideText[i]}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const missionRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tiltCleanupRef = useRef<Array<() => void>>([]);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const gsapCleanupRef = useRef<() => void>(() => {});

  const problems = useMemo(
    () => [
      { stat: "65%", text: "of students report struggling to find relevant resources despite studying for long hours." },
      { stat: "70%", text: "say note-taking takes up more time than actual learning, making revision less effective." },
      { stat: "80%", text: "feel that current test papers lack rigor and fail to prepare them for real exams." },
      { stat: "60%", text: "admit procrastination is easier because studying feels overwhelming and tedious." },
      { stat: "75%", text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient." },
      { stat: "50%", text: "wish there was a single platform that combines planning, practice, and AI-powered help in one place." },
    ],
    []
  );

  const features = useMemo(
    () => [
      { title: "Study Zone", desc: "All-in-one tools for calculators, activity logs and more for long nights, early mornings or quick revision sessions." },
      { title: "Apex", desc: "Your personalised academic companion who gets what learning is. Ask questions, get explanations and deepen understanding." },
      { title: "Study Planner", desc: "Stay in control of deadlines and activities with a schedule that helps long sessions feel manageable." },
      { title: "Answer Reviewer", desc: "Receive strict, constructive feedback on your answers so you can improve structure, clarity and precision." },
      { title: "IB/IGCSE Paper Maker", desc: "Create syllabus-aligned test papers instantly — no fluff, just rigorous practice that prepares you properly." },
      { title: "Notes + Flashcards + Quiz", desc: "Turn notes into flashcards and quizzes in one smooth workflow, ideal when motivation is low but progress still matters." },
    ],
    []
  );

  const [flipped, setFlipped] = useState<boolean[]>(Array(problems.length).fill(false));
  const toggleFlip = (i: number) => setFlipped((prev) => {
    const c = [...prev];
    c[i] = !c[i];
    return c;
  });

  const scrollToTop = () => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => navigate("/main", { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const idle = (cb: () => void) =>
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);
    const cancelIdle = (id: any) =>
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    let cleanup = () => {};
    const run = async () => {
      try {
        const [{ default: gsap }, ScrollTriggerModule] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        const ScrollTrigger = (ScrollTriggerModule as any).default ?? (ScrollTriggerModule as any);
        gsap.registerPlugin(ScrollTrigger);

        gsap.to(".hero-parallax-1", { y: 120, opacity: 0.4, scale: 1.05, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 1.8 } });
        gsap.to(".hero-parallax-2", { y: 180, opacity: 0.2, scale: 1.1, scrollTrigger: { trigger: ".hero-section", start: "top top", end: "bottom top", scrub: 2.2 } });

        gsap.to(".float-deco-1", { y: -25, x: 10, rotation: 8, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true });
        gsap.to(".float-deco-2", { y: -18, x: -8, rotation: -6, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.5 });
        gsap.to(".float-deco-3", { y: -22, x: 12, rotation: 10, duration: 4.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1 });

        gsap.utils.toArray<HTMLElement>(".cinematic-section").forEach((section) => {
          gsap.fromTo(section, { scale: 0.92, opacity: 0, y: 100 }, {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 1.4,
            ease: "power3.out",
            scrollTrigger: { trigger: section, start: "top 82%", end: "top 35%", toggleActions: "play none none reverse" },
          });
        });

        gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, i) => {
          gsap.fromTo(row, { x: i % 2 === 0 ? -120 : 120, opacity: 0, rotateY: 12 }, {
            x: 0,
            opacity: 1,
            rotateY: 0,
            duration: 1.6,
            ease: "power4.out",
            scrollTrigger: { trigger: row, start: "top 88%", toggleActions: "play none none reverse" },
          });
        });

        gsap.utils.toArray<HTMLElement>(".problem-card-container").forEach((card, i) => {
          gsap.fromTo(card, { scale: 0.75, opacity: 0, rotateZ: -8, y: 60 }, {
            scale: 1,
            opacity: 1,
            rotateZ: 0,
            y: 0,
            duration: 1,
            ease: "back.out(1.6)",
            delay: i * 0.1,
            scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none reverse" },
          });
        });

        gsap.utils.toArray<HTMLElement>(".cinematic-text").forEach((text) => {
          gsap.fromTo(text, { y: 60, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: { trigger: text, start: "top 90%", toggleActions: "play none none reverse" },
          });
        });

        gsap.utils.toArray<HTMLElement>(".hand-drawn-reveal").forEach((el, i) => {
          gsap.fromTo(el, { scale: 0, rotation: -15, opacity: 0 }, {
            scale: 1,
            rotation: 0,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(2)",
            delay: i * 0.15,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
          });
        });

        cleanup = () => {
          try {
            if (ScrollTrigger && typeof ScrollTrigger.getAll === "function") {
              ScrollTrigger.getAll().forEach((t: any) => t.kill && t.kill());
            }
          } catch {}
        };
        gsapCleanupRef.current = cleanup;
      } catch {}
    };

    const idleId = idle(run);
    return () => {
      cancelIdle(idleId);
      try { gsapCleanupRef.current(); } catch {}
      cleanup();
    };
  }, []);

  function setupIntersectionObserver() {
    if (typeof window === "undefined") return;
    observerRef.current?.disconnect();
    observerRef.current = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLElement;
        if (!entry.isIntersecting) return;
        el.classList.add("pop-in");
        const hl = el.querySelector<HTMLElement>(".highlight-clip .hl-inner");
        if (hl && !hl.dataset.animated) {
          hl.dataset.animated = "1";
          hl.classList.add("hl-pop");
        }
        const swap = el.querySelector<HTMLElement>(".swap-span");
        if (swap && !swap.dataset.popped) {
          swap.dataset.popped = "1";
          swap.classList.add("swap-pop");
        }
        observer.unobserve(el);
      });
    }, { threshold: 0.08 });

    observerRef.current = observer;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".pop-up"));
    requestAnimationFrame(() => nodes.forEach((el) => observer.observe(el)));
  }

  function bindTiltCards() {
    tiltCleanupRef.current.forEach((fn) => fn());
    tiltCleanupRef.current = [];

    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));
    const handlers: Array<() => void> = [];

    els.forEach((el) => {
      let rect = el.getBoundingClientRect();
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;
      let curX = 0;
      let curY = 0;
      let curZ = 0;
      let rafId = 0;
      const opts = { maxTilt: 6, perspective: 1000, translateZ: 12, ease: 0.12 };

      const update = () => {
        curX += (targetX - curX) * opts.ease;
        curY += (targetY - curY) * opts.ease;
        curZ += (targetZ - curZ) * opts.ease;
        el.style.transform = `perspective(${opts.perspective}px) rotateX(${curX}deg) rotateY(${curY}deg) rotateZ(${curZ}deg) translateZ(${opts.translateZ}px)`;
        rafId = 0;
      };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const nx = x / rect.width - 0.5;
        const ny = y / rect.height - 0.5;
        targetY = nx * opts.maxTilt * 2;
        targetX = -ny * opts.maxTilt * 2;
        targetZ = nx * (opts.maxTilt * 0.25);
        if (!rafId) rafId = requestAnimationFrame(update);
      };

      const onLeave = () => {
        targetX = 0;
        targetY = 0;
        targetZ = 0;
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transition = "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
        window.setTimeout(() => {
          el.style.transition = "";
        }, 520);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      handlers.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        if (rafId) cancelAnimationFrame(rafId);
      });
    });

    tiltCleanupRef.current = handlers;
  }

  useEffect(() => {
    setupIntersectionObserver();
    bindTiltCards();

    if (typeof window !== "undefined") {
      const mo = new MutationObserver(() => {
        requestAnimationFrame(() => {
          setupIntersectionObserver();
          bindTiltCards();
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
      mutationObserverRef.current = mo;
    }

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      tiltCleanupRef.current.forEach((fn) => fn());
      tiltCleanupRef.current = [];
      mutationObserverRef.current?.disconnect();
      mutationObserverRef.current = null;
      try { gsapCleanupRef.current(); } catch {}
    };
  }, []);

  useEffect(() => {
    const el = missionRef.current;
    if (!el || typeof window === "undefined" || prefersReducedMotion()) return;

    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    let rect = el.getBoundingClientRect();
    let tX = 0, tY = 0, tZ = 0, cX = 0, cY = 0, cZ = 0;
    let raf = 0;
    const opts = { maxTilt: 3, perspective: 1200, translateZ: 8, ease: 0.1 };

    const update = () => {
      cX += (tX - cX) * opts.ease;
      cY += (tY - cY) * opts.ease;
      cZ += (tZ - cZ) * opts.ease;
      el.style.transform = `perspective(${opts.perspective}px) rotateX(${cX}deg) rotateY(${cY}deg) rotateZ(${cZ}deg) translateZ(${opts.translateZ}px)`;
      raf = 0;
    };

    const onMove = (e: MouseEvent) => {
      rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const nx = x / rect.width - 0.5;
      const ny = y / rect.height - 0.5;
      tY = nx * opts.maxTilt * 2;
      tX = -ny * opts.maxTilt * 2;
      tZ = nx * 1.1;
      if (!raf) raf = requestAnimationFrame(update);
    };

    const onLeave = () => {
      tX = 0; tY = 0; tZ = 0;
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = "transform 550ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
      window.setTimeout(() => { el.style.transition = ""; }, 580);
    };

    const onResize = () => { rect = el.getBoundingClientRect(); };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <SEO
        title="VertexED: AI Study Tools, Planner & Notes"
        description="An all-in-one AI study toolkit with an assortment of features aimed at helping you score higher and learn better"
        canonical="https://www.vertexed.app/"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "VertexED — AI Study Toolkit",
            url: "https://www.vertexed.app/",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://www.vertexed.app/?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "VertexED",
            url: "https://www.vertexed.app",
            logo: "https://www.vertexed.app/logo.png",
            sameAs: ["https://www.instagram.com/vertexed.ai", "https://twitter.com/vertexed_ai"],
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "VertexED",
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "150" },
          },
        ]}
      />

      <style>{`
        .hero-section { min-height: 70vh; }

        .pop-up {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-out;
          will-change: transform, opacity;
        }
        .pop-in { opacity: 1; transform: translateY(0) scale(1); }

        .feature-card { transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms, border-color 420ms; }
        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 72px rgba(14,165,233,0.16);
          border-color: rgba(14,165,233,0.32);
        }
        .feature-glow {
          position: absolute;
          inset: -40%;
          background: radial-gradient(circle at center, rgba(14,165,233,0.1), transparent 70%);
          opacity: 0;
          transition: opacity 700ms ease;
          pointer-events: none;
          z-index: 0;
        }
        .feature-card:hover .feature-glow { opacity: 1; }

        .btn-cinematic {
          position: relative;
          overflow: hidden;
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms, background-color 260ms, border-color 260ms;
        }
        .btn-cinematic::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.14), transparent);
          opacity: 0;
          transition: opacity 300ms;
          pointer-events: none;
        }
        .btn-cinematic:hover::before { opacity: 1; }
        .btn-cinematic:focus-visible {
          outline: none;
          box-shadow: 0 8px 32px rgba(14,165,233,0.18);
          transform: translateY(-2px);
        }

        .highlight-clip { display: inline-block; overflow: hidden; vertical-align: middle; }
        .hl-inner { display: inline-block; transform-origin: left center; transform: translateY(12px); transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), color 350ms; }
        .hl-pop { transform: translateY(0); color: #DDEBFF; text-shadow: 0 8px 32px rgba(14,165,233,0.12); }
        .stat-number { font-feature-settings: 'tnum' 1; }

        @media (prefers-reduced-motion: reduce) {
          .pop-up { transition: none !important; transform: none !important; opacity: 1 !important; }
          .feature-card:hover { transform: none; }
        }
      `}</style>

      <section className="hero-section glass-card px-6 md:px-10 pt-16 md:pt-20 pb-14 text-center pop-up relative overflow-hidden flex items-center justify-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="mb-4">
            <div className="relative w-full min-h-[7rem] flex items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight text-center flex flex-col justify-center gap-2 pop-up hover-text-morph">
                <span className="swap-span">
                  <TypeAnimation
                    sequence={[
                      1200,
                      "The future of learning awaits...",
                      1800,
                      "Meet tools that actually make a difference",
                      1800,
                      "Where performance meets intuition",
                      1800,
                      "Study smarter, not longer.",
                    ]}
                    speed={45}
                    wrapper="span"
                    cursor
                    repeat={Infinity}
                  />
                </span>
                <span className="text-xl md:text-2xl font-semibold mt-2 opacity-90">
                  <FlipWords
                    words={[
                      "Learn faster without burning out",
                      "Find resources that actually help",
                      "Get feedback when it counts",
                      "Go deeper than the textbook",
                    ]}
                    interval={2400}
                  />
                </span>
                <span className="mt-3 text-lg" aria-hidden>
                  <LandoSwapText from="VertexED" to="VertexED" triggerMs={2800} />
                </span>
              </h1>
            </div>
          </div>

          <p className="text-lg md:text-xl text-slate-200 mb-6 pop-up highlight-clip leading-relaxed max-w-3xl mx-auto">
            <span className="hl-inner">
              You asked for better study tools — here they are. Learn deeply, practice smart, and watch it show up in your results.
            </span>
          </p>

          <div className="flex gap-4 justify-center pop-up flex-wrap">
            <Link to="/main" className="btn-cinematic btn-solid text-lg">
              Get Started
            </Link>
            <Link to="/about" className="btn-cinematic btn-glass text-lg" aria-label="Learn more about VertexED on the About page">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 mt-6 pop-up cinematic-text">
        <div className="text-sm text-slate-400 text-center">
          Feeling lost? <Link to="/resources" className="link-underline-animate">Browse our study guides</Link>
        </div>
      </div>

      <section className="mt-8 text-center px-6 relative cinematic-section">
        <div className="max-w-5xl mx-auto mb-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight hover-text-morph transition-all duration-300">
            We hate the way studying has become.
          </h2>
        </div>
        <p className="text-2xl text-white mb-20 font-light cinematic-text">Who would not?</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-32 cinematic-section">
        <div className="relative mb-6">
          <h3 className="text-4xl md:text-5xl font-bold text-white text-center hover-text-morph transition-all duration-300">
            <TextReveal text="Why is this a problem for you?" />
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => <ProblemCard key={i} p={p} i={i} flipped={flipped[i]} toggleFlip={toggleFlip} />)}
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-16 px-6 text-center cinematic-section relative">
        <div ref={missionRef} className="glass-panel text-slate-100 p-10 tilt-card" aria-label="Mission panel">
          <p className="text-lg md:text-xl leading-relaxed font-light mb-5 cinematic-text">
            Studying has become harder than ever. With too much information to know what to do with, resources that rarely construct measurable progress, and tools that sometimes make things worse, students need a learning space that adapts to them and encourages continuous improvement.
          </p>

          <ul className="text-left mt-6 space-y-3 max-w-2xl mx-auto text-lg cinematic-text">
            <li className="font-semibold flex items-center gap-3"><span className="text-sky-400 text-2xl">•</span><span>Improve the way you approach learning</span></li>
            <li className="font-semibold flex items-center gap-3"><span className="text-purple-400 text-2xl">•</span><span>Improve your performance on exams</span></li>
            <li className="font-semibold flex items-center gap-3"><span className="text-emerald-400 text-2xl">•</span><span>Improve comprehension and long-term retention</span></li>
          </ul>

          <p className="text-lg md:text-xl mt-6 leading-relaxed font-light cinematic-text">
            We focus equally on progress and curiosity: building tools that help you connect ideas, practice deliberately, and grow at your own pace.
          </p>
          <p className="text-lg md:text-xl mt-6 leading-relaxed font-bold cinematic-text">
            Our aim is not only to raise your scores using evidence-based techniques and resources which match your exams, but to create an environment where learning becomes rewarding and sustainable.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-20 px-6 cinematic-section">
        <div className="text-slate-200 space-y-8 leading-relaxed text-lg md:text-xl font-light">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Comprehensive AI Study Tools for Every Student</h2>
          <p>VertexED is more than just a study aid; it is a living ecosystem designed to transform the way you prepare for exams. Think less busywork and more impact — automatic summaries, intelligent revision schedules, and practice that actually helps the knowledge stick.</p>
          <p>Our <strong>AI Study Planner</strong> replaces guessing and guilt with clear plans: tell us your exam dates and weak spots, and we will craft a timetable that adapts as you improve so burnout stays far away.</p>
          <p>For content mastery, our <strong>Note Taker</strong> and <strong>Flashcard Generator</strong> turn dense chapters into crisp, memorable learning bites. The goal: fewer hours, deeper understanding.</p>
          <p>Testing becomes intentional with our <strong>Quiz Generator</strong> and <strong>Paper Maker</strong>. Build mock exams that mirror real papers, get instant, actionable feedback, and repeat until your answers read like top-mark responses. The <strong>Answer Reviewer</strong> grades using official rubrics and gives precise tips on structure, clarity, and ideas to lift your score.</p>
          <p>We embed <strong>Active Recall</strong> and <strong>Spaced Repetition</strong> into every touchpoint — because remembering is the whole point. With VertexED you study smarter, reduce stress, and keep the momentum going.</p>
          <p>Thousands of students are already using VertexED to level up. Join them: less guessing, more progress, and study sessions you actually want to keep coming back to.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-20 cinematic-section">
        <div className="relative mb-10">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center hover-text-morph transition-all duration-300">
            <Link to="/features" className="link-underline-animate">Explore Our Features</Link>
          </h3>
          <div className="text-center mb-10">
            <Link to="/features" className="btn-cinematic btn-glass text-lg">
              See full features
            </Link>
          </div>
        </div>

        <div className="space-y-16">
          {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
        </div>
      </section>

      <section className="mt-20 text-center px-6 cinematic-section relative">
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 hover-text-morph transition-all duration-300">
          Ready to get started?<br />We guarantee a change!
        </h3>
        <button onClick={scrollToTop} className="btn-cinematic btn-solid text-lg tilt-card mt-4">
          Back to Top
        </button>
      </section>

      <section className="mt-12 text-center px-6 cinematic-text">
        <p className="text-xl md:text-2xl text-slate-200 font-light max-w-3xl mx-auto">
          Education was never faulted; it just needed a fresh perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.
        </p>
      </section>

      <section className="mt-8 px-6 mb-12 cinematic-section">
        <div className="max-w-3xl mx-auto glass-panel p-8 text-slate-100 relative">
          <h3 className="text-3xl font-bold mb-4 hover-text-morph transition-all duration-300">Contact Us</h3>
          <p className="text-slate-300 mb-6 text-lg">Got a question? Drop us a line and we'll get back to you.</p>
          <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4">
            <label className="block text-left">
              <span className="text-base text-slate-300 mb-2 block font-medium">Your email</span>
              <input
                name="email"
                type="email"
                placeholder="steve.jobs@gmail.com"
                required
                className="w-full rounded-xl p-3 bg-white/8 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/60 transition-all text-white border border-white/18 backdrop-blur-md"
              />
              <div className="text-sm text-slate-400 mt-2">e.g. steve.jobs@gmail.com</div>
            </label>
            <label className="block text-left">
              <span className="text-base text-slate-300 mb-2 block font-medium">Your message</span>
              <textarea
                name="message"
                rows={4}
                placeholder="Hi — I'm interested in learning more about VertexED..."
                required
                className="w-full rounded-xl p-3 bg-white/8 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/60 transition-all text-white border border-white/18 backdrop-blur-md"
              />
              <div className="text-sm text-slate-400 mt-2">Tell us what's on your mind — no need to be formal</div>
            </label>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button type="submit" className="btn-cinematic btn-solid">
                Send
              </button>
              <p className="text-base text-slate-400">We will reply as soon as we can.</p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
