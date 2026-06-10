import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

const FALL_SHAPES = ["circle", "square", "triangle", "star", "diamond", "hex"] as const;
type ShapeType = (typeof FALL_SHAPES)[number];

const ShapeSVG = ({ type }: { type: ShapeType }) => {
  switch (type) {
    case "circle":
      return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>;
    case "square":
      return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" /></svg>;
    case "triangle":
      return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden><path d="M12 4 L20 18 H4 Z" fill="currentColor" /></svg>;
    case "star":
      return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden><path d="M12 2 L14.6 8.9 L21.7 9.6 L16 14.1 L17.7 21.1 L12 17.7 L6.3 21.1 L8 14.1 L2.3 9.6 L9.4 8.9 Z" fill="currentColor" /></svg>;
    case "diamond":
      return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden><path d="M12 2 L20 12 L12 22 L4 12 Z" fill="currentColor" /></svg>;
    case "hex":
      return <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden><path d="M12 2 L19 6.5 V17.5 L12 22 L5 17.5 V6.5 Z" fill="currentColor" /></svg>;
    default:
      return null;
  }
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

const FallingShapes: React.FC<{ count?: number; palette?: string[] }> = ({ count = 14, palette }) => {
  const pool = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = `${Math.round(Math.random() * 92)}%`;
      const sizePx = 12 + Math.round(Math.random() * 44);
      const dur = `${(7 + Math.random() * 12).toFixed(2)}s`;
      const delay = `${-(Math.random() * 18).toFixed(2)}s`;
      const shape = FALL_SHAPES[Math.floor(Math.random() * FALL_SHAPES.length)];
      const hue = palette?.length
        ? palette[Math.floor(Math.random() * palette.length)]
        : `hsl(${Math.floor(Math.random() * 60) + 200} 72% 66%)`;
      const rotate = Math.round(Math.random() * 360);
      return { id: `shape-${i}-${Math.round(Math.random() * 1e6)}`, left, size: `${sizePx}px`, dur, delay, shape, hue, rotate };
    });
  }, [count, palette]);

  const draggingRef = useRef<HTMLElement | null>(null);
  const startOffsetRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const onPointerMove = (ev: PointerEvent) => {
      const el = draggingRef.current;
      if (!el || !startOffsetRef.current) return;
      ev.preventDefault();
      const dx = ev.clientX - startOffsetRef.current.x;
      const dy = ev.clientY - startOffsetRef.current.y;
      el.style.transform = `translate(${dx}px, ${dy}px) rotate(${el.dataset.rotate ?? 0}deg) scale(1.06)`;
      el.style.zIndex = "9999";
      el.style.opacity = "1";
    };

    const onPointerUp = (ev: PointerEvent) => {
      const el = draggingRef.current;
      if (!el) return;
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const percentLeft = Math.max(0, Math.min(100, ((rect.left + rect.width / 2) / window.innerWidth) * 100));
      el.style.left = `${percentLeft}%`;
      el.style.transform = "";
      el.style.zIndex = "";
      el.style.transition = "transform 320ms ease";
      window.setTimeout(() => {
        el.style.transition = "";
      }, 320);
      el.style.animationPlayState = "running";
      el.style.animationDelay = "0s";
      el.dataset.dragging = "0";
      draggingRef.current = null;
      startOffsetRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp, { passive: false });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <div aria-hidden className="falling-shapes-root">
      {pool.map((s) => (
        <span
          key={s.id}
          className="falling-shape draggable-shape"
          role="presentation"
          data-rotate={s.rotate}
          onPointerDown={(ev) => {
            if (ev.button !== 0) return;
            if (prefersReducedMotion()) return;
            ev.currentTarget.setPointerCapture(ev.pointerId);
            draggingRef.current = ev.currentTarget as HTMLElement;
            startOffsetRef.current = { x: ev.clientX, y: ev.clientY };
            ev.currentTarget.dataset.dragging = "1";
            ev.currentTarget.style.animationPlayState = "paused";
          }}
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            animationDuration: s.dur,
            animationDelay: s.delay,
            color: s.hue,
            transform: `rotate(${s.rotate}deg)`,
            pointerEvents: "auto",
            touchAction: "none",
            cursor: "grab",
          }}
        >
          <ShapeSVG type={s.shape} />
        </span>
      ))}

      <div className="floating-ribbon ribbon-1" aria-hidden />
      <div className="floating-ribbon ribbon-2" aria-hidden />
    </div>
  );
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

const HandDrawnArrow = ({ className = "", style = {} }: any) => (
  <svg className={className} style={style} width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 45 Q 45 30, 80 45 T 130 40" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    <path d="M115 33 L 130 40 L 120 50" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
  </svg>
);
const HandDrawnCircle = ({ className = "", style = {} }: any) => (
  <svg className={className} style={style} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 15 Q 100 18, 103 60 Q 100 102, 60 105 Q 20 102, 17 60 Q 20 18, 60 15" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
    <path d="M60 25 Q 92 27, 94 60 Q 92 93, 60 95 Q 28 93, 26 60 Q 28 27, 60 25" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />
  </svg>
);
const HandDrawnUnderline = ({ className = "", style = {} }: any) => (
  <svg className={className} style={style} width="250" height="25" viewBox="0 0 250 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12 Q 65 8, 125 14 T 245 12" stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.45" />
    <path d="M5 18 Q 65 14, 125 20 T 245 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />
  </svg>
);
const HandDrawnScribble = ({ className = "", style = {} }: any) => (
  <svg className={className} style={style} width="180" height="120" viewBox="0 0 180 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 60 Q 35 35, 60 55 T 95 42 Q 120 60, 145 48 T 165 65" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.35" />
    <path d="M30 70 Q 42 50, 65 68 T 100 58" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.25" />
  </svg>
);
const HandDrawnStar = ({ className = "", style = {} }: any) => (
  <svg className={className} style={style} width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15 L55 40 L80 45 L58 60 L62 85 L50 70 L38 85 L42 60 L20 45 L45 40 Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
  </svg>
);
const HandDrawnSparkles = ({ className = "", style = {} }: any) => (
  <svg className={className} style={style} width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 20 L25 25 L20 30 L15 25 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M55 15 L58 18 L55 21 L52 18 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
    <path d="M65 50 L70 55 L65 60 L60 55 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
    <path d="M30 60 L33 63 L30 66 L27 63 Z" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.45" />
  </svg>
);

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
            name: "VertexED AI — AI Study Toolkit",
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
        * { box-sizing: border-box; }
        html {
          scroll-behavior: smooth;
        }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background:
            radial-gradient(circle at 20% 0%, rgba(14,165,233,0.16), transparent 28%),
            radial-gradient(circle at 80% 15%, rgba(168,85,247,0.14), transparent 25%),
            linear-gradient(180deg, #020617 0%, #0b1220 45%, #020617 100%);
        }
        section { scroll-snap-align: start; scroll-snap-stop: normal; }
        .hero-section { min-height: 70vh; }

        .falling-shapes-root {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 6;
        }
        .falling-shape {
          position: absolute;
          top: -14vh;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          opacity: 0.95;
          filter: drop-shadow(0 8px 18px rgba(2,6,23,0.25));
          transform-origin: center;
          will-change: transform, opacity;
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          mix-blend-mode: screen;
          pointer-events: auto;
        }
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
          70% { opacity: 0.92; }
          100% { transform: translateY(110vh) rotate(360deg) scale(0.78); opacity: 0; }
        }
        .draggable-shape[data-dragging="1"] { animation-play-state: paused !important; }

        .floating-ribbon {
          position: absolute;
          width: 260px;
          height: 56px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(14,165,233,0.08), rgba(168,85,247,0.06));
          opacity: 0.08;
          transform: translate3d(0,0,0);
          filter: blur(8px);
          mix-blend-mode: screen;
          z-index: 4;
          pointer-events: none;
          animation: ribbonFloat 8s ease-in-out infinite;
        }
        .floating-ribbon.ribbon-1 { left: 6%; top: 10%; animation-delay: 0s; transform: rotate(-8deg) }
        .floating-ribbon.ribbon-2 { right: 8%; top: 55%; animation-delay: 2.1s; transform: rotate(12deg) }
        @keyframes ribbonFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 0.09 }
          50% { transform: translateY(-22px) rotate(6deg); opacity: 0.12 }
          100% { transform: translateY(0) rotate(0deg); opacity: 0.09 }
        }

        .pop-up {
          opacity: 0;
          transform: translateY(12px) scale(0.98);
          transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease-out;
          will-change: transform, opacity;
        }
        .pop-in { opacity: 1; transform: translateY(0px) scale(1); }

        :root {
          --glass-boost: rgba(255,255,255,0.06);
          --glass-edge: rgba(255,255,255,0.12);
          --glass-inner-shadow: rgba(2,6,23,0.35);
        }

        .glass-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          border: 1px solid var(--glass-edge);
          backdrop-filter: blur(22px) saturate(150%);
          box-shadow: 0 8px 48px var(--glass-inner-shadow);
        }
        .glass-tile {
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015));
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px) saturate(140%);
          box-shadow: 0 10px 40px rgba(2,6,23,0.35);
        }
        .glass-tile::after {
          content: '';
          position: absolute;
          left: -10%;
          top: -10%;
          width: 120%;
          height: 120%;
          background: radial-gradient(60% 40% at 10% 10%, rgba(255,255,255,0.05), transparent 20%);
          pointer-events: none;
          z-index: 0;
        }

        .feature-card { transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms; }
        .feature-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 24px 72px rgba(14,165,233,0.14);
          border-color: rgba(14,165,233,0.28);
        }
        .feature-glow {
          position: absolute;
          inset: -60%;
          background: radial-gradient(circle at center, rgba(14,165,233,0.12), transparent 70%);
          opacity: 0;
          transition: opacity 700ms ease;
          pointer-events: none;
        }
        .feature-card:hover .feature-glow { opacity: 1; }

        .btn-cinematic {
          position: relative;
          overflow: hidden;
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms, background-color 260ms;
        }
        .btn-cinematic::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          opacity: 0;
          transition: opacity 300ms;
          pointer-events: none;
        }
        .btn-cinematic:hover::before { opacity: 1; }
        .btn-cinematic:focus { outline: none; box-shadow: 0 8px 32px rgba(14,165,233,0.14); transform: translateY(-3px) scale(1.02); }

        .highlight-clip { display: inline-block; overflow: hidden; vertical-align: middle; }
        .hl-inner { display: inline-block; transform-origin: left center; transform: translateY(12px); transition: transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), color 350ms; }
        .hl-pop { transform: translateY(0px); color: #DDEBFF; text-shadow: 0 8px 32px rgba(14,165,233,0.12); }
        .stat-number { font-feature-settings: 'tnum' 1; }

        @media (prefers-reduced-motion: reduce) {
          .falling-shape { animation: none !important; opacity: 0 !important; }
          .floating-ribbon { animation: none !important; opacity: 0.05 !important; }
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
          .pop-up { transition: none !important; transform: none !important; opacity: 1 !important; }
        }
      `}</style>

      <FallingShapes
        count={0}
        palette={[
          "hsl(200 80% 65%)",
          "hsl(215 70% 65%)",
          "hsl(280 70% 70%)",
          "hsl(210 60% 72%)",
          "hsl(310 70% 70%)",
        ]}
      />

      <section className="hero-section glass-card px-6 pt-20 pb-12 text-center pop-up relative overflow-hidden flex items-center justify-center">
        <HandDrawnCircle className="hand-drawn-deco float-deco-1 absolute top-20 right-16 text-sky-400 opacity-20" style={{ width: 140, height: 140 }} />
        <HandDrawnScribble className="hand-drawn-deco float-deco-2 absolute bottom-36 left-16 text-purple-400 opacity-18" style={{ width: 200 }} />
        <HandDrawnArrow className="hand-drawn-deco float-deco-3 absolute top-1/4 left-1/4 text-emerald-400 opacity-25" style={{ transform: "rotate(-18deg)", width: 160 }} />
        <HandDrawnSparkles className="hand-drawn-deco float-deco-1 absolute bottom-28 right-1/4 text-amber-400 opacity-22" />

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
                      "Learn quicker than ever before",
                      "Unlock endless resources",
                      "Gain feedback for when it really matters",
                      "Understand beyond the book",
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
              You asked, we delivered. Welcome to a place where you can truly learn, explore and grow in knowledge while putting it into the kind of work that earns results.
            </span>
          </p>

          <div className="flex gap-6 justify-center pop-up flex-wrap">
            <Link to="/main" className="btn-cinematic px-8 py-4 rounded-full bg-white text-slate-900 text-lg font-semibold shadow-2xl ring-2 ring-white/20 tilt-card">
              Get Started
            </Link>
            <Link to="/about" className="btn-cinematic px-8 py-4 rounded-full bg-transparent border-2 border-white/30 text-white text-lg font-semibold shadow-xl hover:bg-white/10 tilt-card" aria-label="Learn more about VertexED on the About page">
              Learn more about VertexED
            </Link>
          </div>
        </div>

        <HandDrawnUnderline className="hand-drawn-deco hand-drawn-reveal absolute bottom-16 left-1/2 transform -translate-x-1/2 text-sky-300 opacity-28" style={{ width: 320 }} />
      </section>

      <div className="max-w-3xl mx-auto px-6 mt-6 pop-up cinematic-text">
        <div className="text-sm text-slate-400 text-center">
          Feeling lost... <Link to="/resources" className="link-underline-animate">Explore resources</Link>
        </div>
      </div>

      <section className="mt-8 text-center px-6 relative cinematic-section">
        <HandDrawnCircle className="hand-drawn-deco hand-drawn-reveal float-deco-2 absolute top-0 left-24 text-rose-400 opacity-20" style={{ width: 110 }} />
        <div className="max-w-5xl mx-auto mb-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight hover-text-morph transition-all duration-300">
            We hate the way studying has become.
          </h2>
        </div>
        <p className="text-2xl text-white mb-20 font-light cinematic-text">Who would not?</p>
        <HandDrawnScribble className="hand-drawn-deco hand-drawn-reveal float-deco-3 absolute bottom-0 right-24 text-amber-400 opacity-20" />
      </section>

      <section className="max-w-7xl mx-auto px-6 mt-32 cinematic-section">
        <div className="relative mb-6">
          <h3 className="text-4xl md:text-5xl font-bold text-white text-center hover-text-morph transition-all duration-300">
            <TextReveal text="Why is this a problem for you?" />
          </h3>
          <HandDrawnUnderline className="hand-drawn-deco hand-drawn-reveal mx-auto mt-2 text-sky-400 opacity-30" style={{ display: "block", width: 420 }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((p, i) => <ProblemCard key={i} p={p} i={i} flipped={flipped[i]} toggleFlip={toggleFlip} />)}
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-16 px-6 text-center cinematic-section relative">
        <HandDrawnArrow className="hand-drawn-deco hand-drawn-reveal float-deco-1 absolute top-10 right-0 text-purple-400 opacity-25" style={{ transform: "rotate(45deg)" }} />
        <HandDrawnStar className="hand-drawn-deco hand-drawn-reveal float-deco-2 absolute bottom-10 left-0 text-amber-400 opacity-20" style={{ width: 90 }} />

        <div ref={missionRef} className="glass-tile text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-all duration-500 hover:scale-[1.02] tilt-card" aria-label="Mission panel">
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
            <Link to="/features" className="btn-cinematic inline-block px-8 py-4 rounded-full border-2 border-white/30 text-white text-lg hover:bg-white/10">
              See full features
            </Link>
          </div>
        </div>

        <div className="space-y-16">
          {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
        </div>
      </section>

      <section className="mt-20 text-center px-6 cinematic-section relative">
        <HandDrawnSparkles className="hand-drawn-deco hand-drawn-reveal float-deco-1 absolute top-0 left-1/4 text-sky-400 opacity-25" />
        <HandDrawnCircle className="hand-drawn-deco hand-drawn-reveal float-deco-3 absolute bottom-0 right-1/4 text-purple-400 opacity-18" style={{ width: 100 }} />
        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 hover-text-morph transition-all duration-300">
          Ready to get started?<br />We guarantee a change!
        </h3>
        <button onClick={scrollToTop} className="btn-cinematic mt-4 px-10 py-4 rounded-full bg-white text-slate-900 text-lg font-semibold shadow-2xl tilt-card">
          Back to Top
        </button>
      </section>

      <section className="mt-12 text-center px-6 cinematic-text">
        <p className="text-xl md:text-2xl text-slate-200 font-light max-w-3xl mx-auto">
          Education was never faulted; it just needed a fresh perspective. VertexED AI — (<strong>Vertex ED</strong>) — is here to deliver it.
        </p>
      </section>

      <section className="mt-8 px-6 mb-12 cinematic-section">
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-8 text-slate-100 shadow-2xl relative">
          <HandDrawnArrow className="hand-drawn-deco hand-drawn-reveal absolute -top-8 -right-8 text-emerald-400 opacity-20" style={{ transform: "rotate(120deg)" }} />
          <h3 className="text-3xl font-bold mb-4 hover-text-morph transition-all duration-300">Contact Us</h3>
          <p className="text-slate-300 mb-6 text-lg">Have a question? Fill out the form and we will get back to you.</p>
          <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4">
            <label className="block text-left">
              <span className="text-base text-slate-300 mb-2 block font-medium">Your email</span>
              <input
                name="email"
                type="email"
                placeholder="steve.jobs@gmail.com"
                required
                className="w-full rounded-xl p-3 bg-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all text-white border border-white/20"
              />
              <div className="text-sm text-slate-400 mt-2">Example: steve.jobs@gmail.com</div>
            </label>
            <label className="block text-left">
              <span className="text-base text-slate-300 mb-2 block font-medium">Your message</span>
              <textarea
                name="message"
                rows={4}
                placeholder="Hi — I'm interested in learning more about VertexED..."
                required
                className="w-full rounded-xl p-3 bg-white/10 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all text-white border border-white/20"
              />
              <div className="text-sm text-slate-400 mt-2">Briefly tell us what you'd like help with</div>
            </label>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <button type="submit" className="btn-cinematic px-6 py-3 rounded-full bg-white text-slate-900 shadow-xl font-semibold">
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
