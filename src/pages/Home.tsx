import React, { useEffect, useRef, useState, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

const FluidCursor = React.lazy(() =>
  import("@/components/FluidCursor").catch(() => ({ default: () => null })),
);

/* ---------------------- Small animation components ---------------------- */

type FlipWordsProps = { words: string[]; interval?: number; className?: string };
const FlipWords: React.FC<FlipWordsProps> = ({ words, interval = 2200, className }) => {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // no animation
    const t = setInterval(() => {
      setPhase("out");
      setTimeout(() => {
        setIdx(i => (i + 1) % words.length);
        setPhase("in");
      }, 260);
    }, interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className={`flip-words inline-block ${className || ""}`} aria-live="polite">
      <span className={`fw-word fw-${phase}`}>{words[idx]}</span>
    </span>
  );
};

type MorphingTextProps = { phrases: string[]; interval?: number; wrapper?: string; className?: string };
const MorphingText: React.FC<MorphingTextProps> = ({ phrases, interval = 2400, wrapper = "span", className }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => setI(v => (v + 1) % phrases.length), interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  const Tag = wrapper as any;
  return (
    <Tag className={`morph-text ${className || ""}`} aria-hidden={false}>
      {phrases.map((p, idx) => (
        <span key={idx} className={`morph-phrase ${idx === i ? "morph-visible" : "morph-hidden"}`}>{p}</span>
      ))}
    </Tag>
  );
};

type LetterPullUpProps = { text: string; delay?: number; className?: string };
const LetterPullUp: React.FC<LetterPullUpProps> = ({ text, delay = 40, className }) => {
  return (
    <span className={`letter-pullup ${className || ""}`} aria-hidden={false}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden className="lp-char" style={{ transitionDelay: `${i * delay}ms` }}>{ch}</span>
      ))}
    </span>
  );
};

const TextScrollReveal: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("tsr-visible");
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          node.classList.add("tsr-visible");
          obs.unobserve(node);
        }
      });
    }, { threshold: 0.12 });
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return <div ref={ref} className={`text-scroll-reveal ${className || ""}`}>{children}</div>;
};

const TextReveal: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  return (
    <span className={`text-reveal ${className || ""}`}>{Array.from(text).map((c, i) => (
      <span aria-hidden key={i} className="tr-char" style={{ transitionDelay: `${i * 28}ms` }}>{c}</span>
    ))}</span>
  );
};

const LandoSwapText: React.FC<{ from: string; to: string; triggerMs?: number; className?: string }> = ({ from, to, triggerMs = 2200, className }) => {
  const [current, setCurrent] = useState(from);
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const id = setInterval(() => {
      setAnimKey(k => k + 1);
      setTimeout(() => setCurrent(c => (c === from ? to : from)), 300);
    }, triggerMs);
    return () => clearInterval(id);
  }, [from, to, triggerMs]);

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

/* -------------------------------------------------------------------------- */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // refs & state
  const missionRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const tiltCleanupRef = useRef<Array<() => void>>([]);
  const mutationObserverRef = useRef<MutationObserver | null>(null);

  const problems = [
    { stat: "65%", text: "of students report struggling to find relevant resources despite studying for long hours." },
    { stat: "70%", text: "say note-taking takes up more time than actual learning, making revision less effective." },
    { stat: "80%", text: "feel that current test papers lack rigor and fail to prepare them for real exams." },
    { stat: "60%", text: "admit procrastination is easier because studying feels overwhelming and tedious." },
    { stat: "75%", text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient." },
    { stat: "50%", text: "wish there was a single platform that combines planning, practice, and AI-powered help in one place." },
  ];

  const features = [
    { title: "Study Zone", desc: "All-in-one tool for your calculators, activity logs, and more. A space designed for clarity where everything you need to study lives in one place." },
    { title: "AI Chatbot", desc: "Your personal academic companion. Ask questions, get explanations, and engage in real discussions to deepen your understanding of any subject." },
    { title: "Study Planner", desc: "Never miss a beat. Our planner adapts to your schedule, deadlines, and pace — making your study plan smarter, not harder." },
    { title: "Answer Reviewer", desc: "Not just a reviewer, but a mentor. Receive strict yet constructive feedback on your answers, showing you exactly how to improve." },
    { title: "IB/IGCSE Paper Maker", desc: "Create syllabus-aligned test papers instantly. No fluff, no generic questions — just rigorous practice that actually helps you prepare." },
    { title: "Notes + Flashcards + Quiz", desc: "From notes to flashcards to quizzes, all in one seamless workflow. Perfect for late-night revision or quick practice sessions." },
  ];

  const featureSideText = [
    "This is your go to place for those late nights, early mornings, at the library or simply anywhere you are doing independent learning.",
    "Not just another bot, it learns and adapts to you; your strengths, passions and limitations and moreover your progress.",
    "Better organize your sessions and activities so you end up with more done and less energy spent so you can focus on what really matters; life.",
    "Like a teacher built in, constantly finding limitations you would never find and providing the ways to become even closer to perfection",
    "It's like having infinite practice papers ready to go. Non Stop practice based on material which already exists.",
    "This is just the beginning! more features are on their way as you read this."
  ];

  // flips
  const [flipped, setFlipped] = useState<boolean[]>(Array(problems.length).fill(false));
  const toggleFlip = (i: number) => setFlipped(prev => {
    const c = [...prev];
    c[i] = !c[i];
    return c;
  });

  const scrollToTop = () => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" });

  // warm up + redirect
  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => navigate("/main", { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  // IntersectionObserver: pop-in, highlight-once, swap-pop
  function setupIntersectionObserver() {
    if (typeof window === "undefined") return;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const opts = { threshold: 0.12 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
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
        }
      });
    }, opts);

    observerRef.current = observer;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".pop-up"));
    nodes.forEach(el => observer.observe(el));
  }

  // tilt interactions using per-element listeners (rebinding supported)
  function bindTiltCards() {
    tiltCleanupRef.current.forEach(fn => fn());
    tiltCleanupRef.current = [];

    if (typeof window === "undefined") return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));
    const handlers: Array<() => void> = [];

    els.forEach(el => {
      let rect = el.getBoundingClientRect();
      let tx = 0, ty = 0, tz = 0;
      let cx = 0, cy = 0, cz = 0;
      let rafId = 0;
      const opts = { maxTilt: 4, perspective: 900, translateZ: 8, ease: 0.14 };

      const update = () => {
        cx += (tx - cx) * opts.ease;
        cy += (ty - cy) * opts.ease;
        cz += (tz - cz) * opts.ease;
        el.style.transform = `perspective(${opts.perspective}px) rotateX(${cx}deg) rotateY(${cy}deg) rotateZ(${cz}deg) translateZ(${opts.translateZ}px)`;
        rafId = 0;
      };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        ty = ((x - halfW) / halfW) * opts.maxTilt;
        tx = ((halfH - y) / halfH) * opts.maxTilt;
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        tz = (ang / 90) * 1.8;
        if (!rafId) rafId = requestAnimationFrame(update);
      };

      const onLeave = () => {
        tx = ty = tz = 0;
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transition = "transform 420ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
        setTimeout(() => { el.style.transition = ""; }, 450);
      };

      const onEnter = () => { el.style.transition = ""; };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mouseenter", onEnter);

      handlers.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mouseenter", onEnter);
      });
    });

    tiltCleanupRef.current = handlers;
  }

  // Re-bind observers / tilt on mount and whenever the DOM mutates
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
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      tiltCleanupRef.current.forEach(fn => fn());
      tiltCleanupRef.current = [];
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
        mutationObserverRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderFluidCursor = typeof window !== "undefined";

  // ---- Subcomponents ----
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    const onKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip(i);
      }
    };

    return (
      <div
        onClick={() => toggleFlip(i)}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex={0}
        aria-pressed={flipped[i]}
        className="group relative h-56 rounded-2xl transition-transform duration-400 hover:scale-[1.03] perspective tilt-card pop-up"
        aria-label={`Problem card ${i + 1}`}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 transform"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold rounded-2xl problem-card-front"
            style={{
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg,#ffffff,#f7fbff)",
              color: "#04263b",
              boxShadow: "0 6px 28px rgba(6,10,15,0.06)",
              border: "1px solid rgba(6,10,15,0.04)",
            }}
          >
            <span style={{ fontFeatureSettings: "'tnum' 1", letterSpacing: "-0.01em" }}>{p.stat}</span>
            <span className="text-sm italic" style={{ color: "rgba(4,38,59,0.62)" }}>Click to find out</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed rounded-2xl"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              background: "linear-gradient(180deg, rgba(8,12,20,0.86), rgba(11,16,22,0.82))",
              color: "#e6eef6",
              border: "1px solid rgba(255,255,255,0.03)",
              backdropFilter: "blur(6px) saturate(110%)",
            }}
          >
            <div>
              <div>{p.text}</div>
              <div className="mt-3 text-xs italic" style={{ color: "rgba(226,236,246,0.65)" }}>Backed by research-backed principles: active recall, spaced repetition and retrieval practice.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FeatureRow({ f, i }: { f: { title: string; desc: string }; i: number }) {
    // removed key here — key should be on the mapped element in parent
    return (
      <div className={`feature-row flex flex-col md:flex-row items-center gap-10 pop-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card">
          <h4 className="text-xl font-bold mb-3 pop-up swap-span"><LetterPullUp text={f.title} /></h4>
          <p className="pop-up highlight-clip" style={{ maxWidth: 640 }}>
            <span className="hl-inner">{f.desc}</span>
          </p>
          <div className="mt-4 text-sm text-slate-400">Built around proven learning techniques.</div>
        </div>

        <div className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left pop-up">
          {i % 2 === 0
            ? "The all in 1 hub for your study sessions with all the tools one could ask for."
            : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}
          <div className="mt-4 text-slate-400">{featureSideText[i]}</div>
        </div>
      </div>
    );
  }

  // ----- Render -----
  return (
    <>
      <SEO
        title="VertexED — AI Study Tools for Students - AI Based Methods"
        description="All-in-one AI study toolkit with planner, calendar, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription."
        canonical="https://www.vertexed.app/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VertexED — AI Study Toolkit",
          url: "https://www.vertexed.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.vertexed.app/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />

      {renderFluidCursor && (
        <div id="fluid-cursor-root" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999999 }}>
          <Suspense fallback={null}>
            <FluidCursor />
          </Suspense>
        </div>
      )}

      <style>{`
        html { scroll-behavior: smooth; scroll-snap-type: y proximity; }
        body { scroll-padding-top: 72px; }
        section { scroll-snap-align: start; scroll-snap-stop: always; }

        .pop-up { opacity: 0; transform: translateY(14px) scale(0.995); transition: transform 480ms cubic-bezier(.2,.9,.3,1), opacity 380ms ease-out; will-change: transform, opacity; }
        .pop-in { opacity: 1; transform: translateY(0px) scale(1); }

        .highlight-clip { display: inline-block; overflow: hidden; vertical-align: middle; }
        .hl-inner { display: inline-block; transform-origin: left center; transform: translateY(10px); transition: transform 520ms cubic-bezier(.2,.9,.3,1), color 360ms; }
        .hl-pop { transform: translateY(0px); color: #DDEBFF; text-shadow: 0 6px 24px rgba(14,165,233,0.08); }

        .swap-span { display: inline-block; transform: translateY(8px); transition: transform 520ms cubic-bezier(.2,.9,.3,1), font-weight 220ms, font-size 220ms; white-space: nowrap; }
        .swap-pop { transform: translateY(0px); font-weight: 800; font-size: 1.06em; color: #E6F0FF; letter-spacing: -0.01em; }

        .glass-tile { background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border: 1px solid rgba(255,255,255,0.04); backdrop-filter: blur(8px) saturate(110%); }

        .scribble { position: absolute; pointer-events: none; opacity: 0.12; transform-origin: center; filter: blur(0.2px); animation: scribbleFloat 6s ease-in-out infinite; }
        .scribble--small { opacity: 0.10; transform: rotate(-6deg); }
        .scribble--math { opacity: 0.14; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace; }

        @keyframes scribbleFloat { 0% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(2deg); } 100% { transform: translateY(0) rotate(-3deg); } }

        .problem-card-front { border: 1px solid rgba(6,10,15,0.04); }

        .flip-words { perspective: 700px; display: inline-block; vertical-align: middle; }
        .fw-word { display:inline-block; backface-visibility: hidden; transform-origin: center; transition: transform 260ms cubic-bezier(.2,.9,.3,1), opacity 260ms; }
        .fw-in { transform: rotateX(0deg) translateY(0); opacity:1; }
        .fw-out { transform: rotateX(-90deg) translateY(-6px); opacity:0; }

        .morph-text { position: relative; display:inline-block; }
        .morph-phrase { position: absolute; left:0; top:0; transform-origin:center; opacity:0; transform: scale(0.98); transition: all 420ms ease; white-space:nowrap; }
        .morph-visible { opacity:1; transform: scale(1); z-index:2; }
        .morph-hidden { opacity:0; z-index:1; }

        .letter-pullup { display:inline-block; overflow:visible; }
        .lp-char { display:inline-block; transform: translateY(18px); opacity:0; transition: transform 520ms cubic-bezier(.2,.9,.3,1), opacity 420ms; }
        .pop-in .lp-char { transform: translateY(0); opacity:1; }

        .text-scroll-reveal { overflow: hidden; display:inline-block; transform: translateY(12px); opacity:0; transition: transform 520ms cubic-bezier(.2,.9,.3,1), opacity 420ms; }
        .text-scroll-reveal.tsr-visible { transform: translateY(0); opacity:1; }

        .text-reveal { display:inline-block; vertical-align:middle; }
        .tr-char { display:inline-block; transform: translateY(14px); opacity:0; transition: transform 420ms ease, opacity 360ms; }
        .pop-in .text-reveal .tr-char { transform: translateY(0); opacity:1; }

        .lando-swap { display:inline-block; line-height:1; font-variant-ligatures: none; white-space:nowrap; }
        .ls-letter { display:inline-block; position:relative; overflow:visible; width:auto; min-width:0.5ch; text-align:center; }
        .ls-front, .ls-back { display:block; transform-origin:center; position:relative; transition: transform 320ms cubic-bezier(.2,.9,.3,1), opacity 300ms; }
        .ls-front { transform: translateY(0); opacity:1; }
        .ls-back { position:absolute; left:0; top:0; transform: translateY(100%); opacity:0; }
        .lando-swap[data-key] .ls-front { transform: translateY(-100%); opacity:0; }
        .lando-swap[data-key] .ls-back { transform: translateY(0%); opacity:1; }

        @media (prefers-reduced-motion: reduce) {
          .pop-up { transition: none !important; transform: none !important; opacity: 1 !important; }
          .scribble { animation: none !important; }
          .fw-word, .morph-phrase, .lp-char, .tr-char, .ls-front, .ls-back { transition: none !important; transform: none !important; opacity:1 !important; }
        }
      `}</style>

      {/* decorative scribbles */}
      <svg className="scribble scribble--small" width="220" height="120" style={{ left: 28, top: 160, position: "absolute", zIndex: 30 }}>
        <path d="M6 80 C 40 20, 80 120, 210 40" stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M10 40 C 60 60, 120 0, 210 50" stroke="rgba(14,165,233,0.06)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>

      <div className="scribble scribble--math" style={{ left: "72%", top: "20%", width: 160, height: 80, position: "absolute", zIndex: 30 }}>
        <svg width="160" height="80">
          <text x="0" y="20" fontSize="14" fill="rgba(255,255,255,0.12)">{'∑_{n=1}^∞ 1/n² = π²/6'}</text>
          <text x="0" y="40" fontSize="12" fill="rgba(14,165,233,0.08)">E = mc²</text>
          <text x="0" y="60" fontSize="12" fill="rgba(255,255,255,0.08)">f'(x) = lim h→0 (f(x+h)-f(x))/h</text>
        </svg>
      </div>

      {/* Hero */}
      <section className="glass-card px-6 pt-24 pb-16 text-center pop-up" style={{ position: "relative" }}>
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 pop-up">
            <div className="relative w-full h-[6.75rem] md:h-[9.25rem] flex items-center justify-center">
              <h1 className="text-5xl md:text-7xl font-semibold text-white leading-tight text-center flex flex-col justify-center [--gap:0.4rem] md:[--gap:0.6rem] pop-up">
                <span className="swap-span">
                  <TypeAnimation
                    sequence={[
                      1200,
                      "AI study tools for students.",
                      1800,
                      "Focused learning. Real results.",
                      1800,
                      "Bold. Premium. Built for learners.",
                      1800,
                      "Study smarter, not longer.",
                    ]}
                    speed={45}
                    wrapper="span"
                    cursor={true}
                    repeat={Infinity}
                  />
                </span>
                <span style={{ marginTop: 6, fontSize: '1rem', opacity: 0.85 }} className="pop-up">
                  <FlipWords words={["fast feedback","real practice","mastered concepts","confident test-takers"]} interval={2400} />
                </span>

                <span className="mt-2 pop-up" aria-hidden>
                  <LandoSwapText from="VertexED" to="Vertex ED" triggerMs={2800} />
                </span>
              </h1>
            </div>
          </div>

          <p className="text-lg text-slate-200 mb-10 pop-up highlight-clip" style={{ position: "relative" }}>
            <span className="hl-inner">
              An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods like active recall, spaced repetition, and retrieval practice.
            </span>
          </p>

          <div className="flex gap-4 justify-center pop-up">
            <Link to="/main" className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-400 ease-in-out shadow-xl hover:scale-105 ring-1 ring-white/10 tilt-card">Get Started</Link>
            <Link to="/about" className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-transform duration-400 ease-in-out shadow-md hover:scale-105 tilt-card" aria-label="Learn more about VertexED on the About page">Learn more about VertexED</Link>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 mt-3 pop-up">
        <div className="text-xs text-slate-400 text-center">
          Looking for how-to guides? <Link to="/resources" className="underline">Explore resources</Link>
        </div>
      </div>

      {/* story */}
      <section className="mt-12 md:mt-15 text-center px-6 pop-up" style={{ position: "relative" }}>
        <div className="w-full mx-auto h-[4.8rem] md:h-auto flex items-center justify-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight flex flex-col justify-center swap-span">
            <TextScrollReveal>
              <MorphingText phrases={["We hate the way we study.", "We hate cramming.", "We hate wasted time.", "We hate inefficient tools."]} />
            </TextScrollReveal>
          </h2>
        </div>
        <p className="text-lg text-slate-200 mb-12 pop-up">Who wouldn’t?</p>
      </section>

      {/* problems grid */}
      <section className="max-w-6xl mx-auto px-6 mt-28 pop-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center swap-span"><TextReveal text="Why is this a problem?" /></h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => <ProblemCard key={i} p={p} i={i} />)}
        </div>
      </section>

      {/* mission */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center pop-up">
        <div ref={missionRef} className="glass-card text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-transform duration-300" aria-label="Mission panel" style={{ position: "relative" }}>
          <p className="text-lg md:text-xl leading-relaxed pop-up">
            Studying has become harder than ever. With too much information to know what to do with, resources that rarely construct measurable progress, and tools that sometimes make things worse, students need a learning space that adapts to them and encourages continuous improvement.
          </p>

          <ul className="text-left mt-6 space-y-3 pop-up">
            <li className="font-semibold">• Improve the way you approach learning</li>
            <li className="font-semibold">• Improve your performance on exams</li>
            <li className="font-semibold">• Improve comprehension and long-term retention</li>
          </ul>

          <p className="text-lg md:text-xl mt-6 leading-relaxed pop-up">
            We focus equally on progress and curiosity: building tools that help you connect ideas, practice deliberately, and grow at your own pace.
          </p>

          <p className="text-lg md:text-xl mt-6 leading-relaxed font-semibold pop-up">
            Our aim is not only to raise scores using evidence-based techniques, but to create an environment where learning becomes rewarding and sustainable.
          </p>

          <svg width="120" height="60" style={{ position: "absolute", right: -8, top: -10, opacity: 0.12 }}>
            <text x="0" y="20" fontSize="14" fill="white">∫_0^1 x² dx = 1/3</text>
            <path d="M8 36 C 28 10, 80 60, 112 26" stroke="rgba(14,165,233,0.06)" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </section>

      {/* features */}
      <section className="max-w-6xl mx-auto px-6 mt-28 pop-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center pop-up"><Link to="/features" className="hover:underline">Explore Our Features</Link></h3>
        <div className="text-center mb-8 pop-up"><Link to="/features" className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300">See full features</Link></div>
        <div className="space-y-20">
          {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6 pop-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 pop-up">
          Ready to get started?<br/>We guarantee a change!
        </h3>
        <button onClick={scrollToTop} className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out tilt-card">Back to Top</button>
      </section>

      {/* closing */}
      <section className="mt-16 text-center px-6 pop-up">
        <p className="text-lg text-slate-200">Learning was never difficult, it just needed a new perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.</p>
      </section>

      {/* contact */}
      <section className="mt-12 px-6 mb-12 pop-up">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-xl">
          <h3 className="text-2xl font-semibold mb-4 pop-up">Contact Us</h3>
          <p className="text-slate-400 mb-4 pop-up">Have a question? Fill out the form and we'll get back to you.</p>
          <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4 pop-up">
            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your email</span>
              <input name="email" type="email" placeholder="steve.jobs@gmail.com" required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500" />
              <div className="text-xs text-slate-500 mt-1">Example: steve.jobs@gmail.com</div>
            </label>
            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your message</span>
              <textarea name="message" rows={5} placeholder="Hi — I'm interested in learning more about VertexED..." required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"></textarea>
              <div className="text-xs text-slate-500 mt-1">Briefly tell us what you'd like help with</div>
            </label>
            <div className="flex items-center justify-between">
              <button type="submit" className="px-6 py-3 rounded-full bg-white text-slate-900 shadow hover:scale-105 transition">Send</button>
              <p className="text-sm text-slate-400">We’ll reply as soon as we can.</p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
