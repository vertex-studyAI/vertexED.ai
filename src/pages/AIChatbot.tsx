import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TypeAnimation } from "react-type-animation";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const scribbleRef = useRef<SVGPathElement | null>(null);
  const highlightsRef = useRef<Array<HTMLElement | null>>([]);
  const lettersRef = useRef<Array<HTMLElement | null>>([]);
  const missionRef = useRef<HTMLDivElement | null>(null);
  const tiltHandlersRef = useRef<Array<() => void>>([]);

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorBlobRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLDivElement | null>(null);
  const staticDoodlesRef = useRef<HTMLDivElement | null>(null);
  const [flipped, setFlipped] = useState(Array(6).fill(false));
  const [introDone, setIntroDone] = useState(false);

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

  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => {
        navigate("/main", { replace: true });
      });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const idle = (cb: () => void) => (typeof (window as any).requestIdleCallback !== "undefined" ? (window as any).requestIdleCallback(cb, { timeout: 1200 }) : (setTimeout(cb, 250) as unknown as number));
    const cancelIdle = (id: any) => (typeof (window as any).cancelIdleCallback !== "undefined" ? (window as any).cancelIdleCallback(id) : clearTimeout(id));
    let killAll: (() => void) | null = null;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);

      const splitToChars = (el: HTMLElement | null) => {
        if (!el) return [] as HTMLElement[];
        const text = el.textContent || "";
        el.innerHTML = "";
        const chars: HTMLElement[] = [];
        text.split("").forEach((ch) => {
          const span = document.createElement("span");
          span.className = "inline-block char";
          span.textContent = ch === " " ? "\u00A0" : ch;
          el.appendChild(span);
          chars.push(span);
        });
        return chars;
      };

      const headline = headingRef.current;
      if (headline) {
        lettersRef.current = splitToChars(headline);

        gsap.fromTo(lettersRef.current, { y: 28, opacity: 0, rotateX: 8 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, ease: "power3.out", stagger: 0.02, scrollTrigger: { trigger: heroRef.current, start: "top 85%" } });

        if (scribbleRef.current) {
          const path = scribbleRef.current;
          const len = path.getTotalLength();
          path.style.strokeDasharray = `${len}`;
          path.style.strokeDashoffset = `${len}`;
          gsap.to(path, { strokeDashoffset: 0, duration: 1.5, ease: "power2.out", delay: 0.2, scrollTrigger: { trigger: heroRef.current, start: "top 88%" } });
        }
      }

      const highlights = highlightsRef.current.filter(Boolean) as HTMLElement[];
      highlights.forEach((el, i) => {
        const inner = el.querySelector<HTMLElement>(".hl-inner");
        if (!inner) return;
        gsap.set(inner, { scaleX: 0, transformOrigin: "left center" });
        gsap.to(inner, { scaleX: 1, duration: 0.9, ease: "power3.out", delay: i * 0.08, scrollTrigger: { trigger: el, start: "top 92%" } });
      });

      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el) =>
        gsap.fromTo(el, { y: 32, opacity: 0, scale: 0.995 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" } })
      );

      gsap.utils.toArray<HTMLElement>(".feature-row").forEach((row, i) => {
        gsap.fromTo(row, { x: i % 2 === 0 ? -40 : 40, opacity: 0, rotateX: 2 }, { x: 0, opacity: 1, rotateX: 0, duration: 0.85, ease: "power3.out", delay: i * 0.04, scrollTrigger: { trigger: row, start: "top 92%" } });
      });

      gsap.utils.toArray<HTMLElement>(".tilt-card").forEach((el) => {
        gsap.fromTo(el, { rotateZ: 0 }, { rotateZ: 0, duration: 0.001 });
      });

      const cards = document.querySelectorAll<HTMLElement>(".problem-card");
      cards.forEach((card, idx) => {
        const front = card.querySelector<HTMLElement>(".card-front");
        const back = card.querySelector<HTMLElement>(".card-back");
        if (!front || !back) return;

        const tl = gsap.timeline({ paused: true });
        tl.to(front, { transformPerspective: 1200, rotateY: 90, duration: 0.5, ease: "power2.inOut" });
        tl.fromTo(back, { rotateY: -90 }, { rotateY: 0, duration: 0.6, ease: "power3.out" }, "-=.05");
        tl.fromTo(card, { scale: 1 }, { scale: 1.02, duration: 0.6, ease: "power3.out" }, 0);

        card.addEventListener("mouseenter", () => tl.play());
        card.addEventListener("mouseleave", () => tl.reverse());
        card.addEventListener("click", () => tl.reversed() ? tl.play() : tl.reverse());
      });

      killAll = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        gsap.killTweensOf("*");
      };
    };

    const id = idle(run);
    return () => {
      cancelIdle(id);
      if (killAll) killAll();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    tiltHandlersRef.current = [];
    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));

    els.forEach((el) => {
      let rect = el.getBoundingClientRect();
      let targetX = 0, targetY = 0, targetZ = 0;
      let curX = 0, curY = 0, curZ = 0;
      let raf = 0;
      const options = { maxTilt: 3.2, perspective: 1000, translateZ: 6, ease: 0.12 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        targetY = ((x - halfW) / halfW) * options.maxTilt;
        targetX = ((halfH - y) / halfH) * options.maxTilt;
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        targetZ = (ang / 90) * 1.6;
        if (!raf) raf = requestAnimationFrame(update);
      };

      const update = () => {
        curX += (targetX - curX) * options.ease;
        curY += (targetY - curY) * options.ease;
        curZ += (targetZ - curZ) * options.ease;
        el.style.transform = `perspective(${options.perspective}px) rotateX(${curX}deg) rotateY(${curY}deg) rotateZ(${curZ}deg) translateZ(${options.translateZ}px)`;
        raf = 0;
      };

      const onLeave = () => {
        targetX = targetY = targetZ = 0;
        if (raf) cancelAnimationFrame(raf);
        el.style.transition = "transform 420ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = `perspective(${options.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
        setTimeout(() => { el.style.transition = ""; }, 450);
      };

      const onEnter = () => { el.style.transition = ""; };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mouseenter", onEnter);

      tiltHandlersRef.current.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mouseenter", onEnter);
      });
    });

    return () => {
      tiltHandlersRef.current.forEach(fn => fn());
      tiltHandlersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const el = missionRef.current;
    if (!el || typeof window === "undefined") return;
    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    let rect = el.getBoundingClientRect();
    let tX = 0, tY = 0, tZ = 0, cX = 0, cY = 0, cZ = 0;
    let raf = 0;
    const opts = { maxTilt: 2.6, perspective: 1200, translateZ: 6, ease: 0.08 };

    const onMove = (e: MouseEvent) => {
      rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      tY = ((x - halfW) / halfW) * opts.maxTilt;
      tX = ((halfH - y) / halfH) * opts.maxTilt;
      const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
      tZ = (ang / 90) * 1.0;
      if (!raf) raf = requestAnimationFrame(update);
    };

    const update = () => {
      cX += (tX - cX) * opts.ease;
      cY += (tY - cY) * opts.ease;
      cZ += (tZ - cZ) * opts.ease;
      el.style.transform = `perspective(${opts.perspective}px) rotateX(${cX}deg) rotateY(${cY}deg) rotateZ(${cZ}deg) translateZ(${opts.translateZ}px)`;
      raf = 0;
    };

    const onLeave = () => {
      tX = tY = tZ = 0;
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = "transform 480ms cubic-bezier(0.22,1,0.36,1)";
      el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
      setTimeout(() => { el.style.transition = ""; }, 500);
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

  useEffect(() => {
    const dot = cursorDotRef.current;
    const blob = cursorBlobRef.current;
    if (!dot || !blob || typeof window === "undefined") return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let dotX = mouseX;
    let dotY = mouseY;
    let blobX = mouseX;
    let blobY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const render = () => {
      dotX += (mouseX - dotX) * 0.28;
      dotY += (mouseY - dotY) * 0.28;
      blobX += (mouseX - blobX) * 0.09;
      blobY += (mouseY - blobY) * 0.09;
      dot.style.transform = `translate3d(${dotX - 6}px, ${dotY - 6}px, 0)`;
      blob.style.transform = `translate3d(${blobX - 80}px, ${blobY - 80}px, 0) scale(1)`;
      raf = requestAnimationFrame(render);
    };

    document.addEventListener("mousemove", onMove);
    requestAnimationFrame(render);

    const onDown = () => {
      dot.style.transform += " scale(0.9)";
      blob.style.transform += " scale(0.95)";
    };
    const onUp = () => {};
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = introRef.current;
    if (!el) return;

    let killed = false;

    const runIntro = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);

      const body = document.body;
      const html = document.documentElement;
      const prevOverflow = body.style.overflow || "";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";

      const tl = gsap.timeline({ onComplete: () => { body.style.overflow = prevOverflow; html.style.overflow = prevOverflow; setIntroDone(true); } });

      tl.fromTo(el, { scale: 1.18, opacity: 1 }, { scale: 1, opacity: 0, duration: 1.2, ease: "power3.inOut" }, 0.3);
      tl.to(el.querySelectorAll(".intro-letter"), { y: -26, opacity: 0, stagger: 0.03, duration: 0.8, ease: "power3.in" }, 0.2);
      tl.to(el, { pointerEvents: "none" }, "<");

      const hero = heroRef.current;
      if (hero) {
        gsap.fromTo(hero, { scale: 1.02, opacity: 0.96 }, { scale: 1, opacity: 1, duration: 0.9, ease: "power3.out", delay: 0.1 });
      }

      const end = () => { if (!killed) { body.style.overflow = prevOverflow; html.style.overflow = prevOverflow; setIntroDone(true); } };

      const onSkip = () => { tl.progress(1); end(); };

      el.addEventListener("click", onSkip, { once: true });

      setTimeout(() => { if (!killed) tl.play(); }, 350);

      return () => { killed = true; el.removeEventListener("click", onSkip); };
    };

    runIntro().catch(() => setIntroDone(true));
  }, []);

  const toggleFlip = (index: number) => setFlipped((prev) => { const updated = [...prev]; updated[index] = !updated[index]; return updated; });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    return (
      <div className="group relative h-56 glass-tile text-slate-100 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.28)] perspective tilt-card fade-up will-change-transform problem-card" onClick={() => toggleFlip(i)}>
        <div className="absolute inset-0 transition-transform duration-700 transform" style={{ transformStyle: "preserve-3d", transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold backface-hidden card-front" style={{ backfaceVisibility: "hidden" }}>
            <span className="stat-glow">{p.stat}</span>
            <span className="text-sm text-slate-400 italic group-hover:text-slate-300 transition-colors">Click to find out</span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed glass-tile rounded-2xl text-slate-200 card-back" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
            <div>
              <div>{p.text}</div>
              <div className="mt-3 text-xs text-slate-500 italic">Backed by research-backed principles: active recall, spaced repetition and retrieval practice.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FeatureRow({ f, i }: { f: { title: string; desc: string }; i: number }) {
    return (
      <div className={`feature-row flex flex-col md:flex-row items-center gap-10 fade-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card planner-card will-change-transform">
          <h4 className="text-xl font-bold mb-3 hover:translate-y-[-2px] transition-transform">{f.title}</h4>
          <p>{f.desc}</p>
          <div className="mt-4 text-sm text-slate-500">Built around proven learning techniques.</div>
        </div>
        <Link to="/features" className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left">
          <span className="highlight-clip" ref={el => (highlightsRef.current[i] = el)}>
            <span className="hl-inner inline-block px-1 -skew-x-[6deg]">{
              i % 2 === 0
                ? "The all in 1 hub for your study sessions with all the tools one could ask for."
                : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."
            }</span>
          </span>
          <div className="mt-4 text-slate-400"></div>
        </Link>
      </div>
    );
  }

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

      <div ref={introRef} className={`fixed inset-0 z-[1200] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 transition-all duration-700 ${introDone ? "pointer-events-none opacity-0" : ""}`}>
        <div className="text-center select-none cursor-pointer p-6">
          <div className="text-6xl md:text-8xl font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-sky-300 intro-hero">
            {Array.from("VertexED.AI").map((ch, i) => <span key={i} className="inline-block intro-letter" style={{ display: 'inline-block', transform: 'translateY(0)', willChange: 'transform' }}>{ch}</span>)}
          </div>
          <div className="mt-4 text-slate-300">Scroll or click to reveal</div>
        </div>
      </div>

      <div ref={staticDoodlesRef} className="pointer-events-none fixed inset-0 z-10 opacity-30 mix-blend-screen"> 
        <svg className="absolute left-0 top-10 w-[520px] h-[520px] -translate-x-12 -translate-y-6" viewBox="0 0 600 600" preserveAspectRatio="xMinYMin">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.03)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.0)" />
            </linearGradient>
          </defs>
          <path d="M10 200 C120 80 240 320 370 190 C480 80 580 220 590 300" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <g transform="translate(80,420) scale(0.9)">
            <path d="M0 0 q40 -40 80 0 t80 0" stroke="rgba(255,255,255,0.03)" strokeWidth="1.2" fill="none" />
            <text x="18" y="8" style={{ fontSize: 12, fill: 'rgba(255,255,255,0.04)' }}>e=mc^2</text>
          </g>
        </svg>
        <svg className="absolute right-0 bottom-8 w-[420px] h-[420px] translate-x-8 translate-y-6" viewBox="0 0 520 520" preserveAspectRatio="xMaxYMax">
          <path d="M20 120 C120 40 220 260 320 120 C420 -40 520 240 520 360" stroke="rgba(255,255,255,0.03)" strokeWidth="1.2" fill="none" />
          <text x="60" y="220" style={{ fontSize: 12, fill: 'rgba(255,255,255,0.04)' }}>∑ a_n</text>
        </svg>
      </div>

      <div ref={cursorBlobRef} className="fixed z-[1400] pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-70">
        <div className="w-[160px] h-[160px] rounded-full blur-3xl bg-gradient-to-tr from-indigo-500 to-sky-400/60"></div>
      </div>
      <div ref={cursorDotRef} className="fixed z-[1500] w-3 h-3 rounded-full bg-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>

      <section ref={heroRef} className="glass-card px-6 pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <svg className="absolute left-1/2 top-0 -translate-x-1/2 w-full h-full opacity-10" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bgg" x1="0" x2="1">
                <stop offset="0" stopColor="#020617" />
                <stop offset="1" stopColor="#07102a" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#bgg)" />
            <g opacity="0.08" transform="translate(40,80) scale(1)">
              <path d="M0 200 C120 80 260 320 420 200 C560 80 720 340 900 220 C1080 100 1240 360 1440 220" stroke="white" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="mb-6 fade-up">
            <div className="relative w-full h-[6.75rem] md:h-[9.25rem] flex items-center justify-center">
              <h1 ref={headingRef} className="text-5xl md:text-7xl font-semibold text-white leading-tight text-center flex flex-col justify-center [--gap:0.4rem] md:[--gap:0.6rem] will-change-transform" style={{ lineHeight: 1.05 }}>
                AI study tools for students.
              </h1>

              <svg className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[380px] md:w-[620px] h-[36px] overflow-visible" viewBox="0 0 700 80" preserveAspectRatio="xMidYMid meet" aria-hidden>
                <path ref={scribbleRef} d="M20 40 C110 70 190 10 300 45 C410 80 500 18 680 40" stroke="rgba(255,255,255,0.18)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="scribble-path"/>
              </svg>
            </div>
          </div>

          <p className="text-lg text-slate-200 mb-10 fade-up">
            <span className="highlight-clip inline-block" ref={el => (highlightsRef.current[0] = el)}>
              <span className="hl-inner inline-block px-1 -skew-x-[6deg]">An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods.</span>
            </span>
          </p>

          <div className="flex gap-4 justify-center fade-up">
            <Link to="/main" className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-400 ease-in-out shadow-xl hover:scale-105 ring-1 ring-white/10">Get Started</Link>
            <Link to="/about" className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-transform duration-400 ease-in-out shadow-md hover:scale-105">Learn more</Link>
          </div>
        </div>
      </section>

      <section className="mt-12 md:mt-15 text-center px-6 fade-up">
        <div className="w-full mx-auto h-[4.8rem] md:h-auto flex items-center justify-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight flex flex-col justify-center">
            <TypeAnimation sequence={[1200, "We hate the way we study.", 1400, "We hate cramming.", 1400, "We hate wasted time.", 1400, "We hate inefficient tools."]} speed={40} wrapper="span" cursor={true} repeat={Infinity} />
          </h2>
        </div>
        <p className="text-lg text-slate-200 mb-12">Who wouldn’t?</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-28 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center">Why is this a problem?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => <ProblemCard key={i} p={p} i={i} />)}
        </div>
      </section>

      <section className="max-w-4xl mx-auto mt-24 px-6 text-center fade-up">
        <div ref={missionRef} className="glass-card text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-transform duration-300 will-change-transform" aria-label="Mission panel">
          <p className="text-lg md:text-xl leading-relaxed">
            Studying has become harder than ever. With too much information to know what to do with,
            resources that rarely construct measurable progress, and tools that sometimes make things
            worse, students need a learning space that adapts to them and encourages continuous
            improvement.
          </p>

          <ul className="text-left mt-6 space-y-3">
            <li className="font-semibold">• Improve the way you approach learning</li>
            <li className="font-semibold">• Improve your performance on exams</li>
            <li className="font-semibold">• Improve comprehension and long-term retention</li>
          </ul>

          <p className="text-lg md:text-xl mt-6 leading-relaxed">
            We focus equally on progress and curiosity: building tools that help you connect ideas,
            practice deliberately, and grow at your own pace.
          </p>

          <p className="text-lg md:text-xl mt-6 leading-relaxed font-semibold">
            Our aim is not only to raise scores using evidence-based techniques, but to create an
            environment where learning becomes rewarding and sustainable.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center fade-up"><Link to="/features" className="hover:underline">Explore Our Features</Link></h3>
        <div className="text-center mb-8">
          <Link to="/features" className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300">See full features</Link>
        </div>

        <div className="space-y-20">
          {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
        </div>
      </section>

      <section className="mt-28 text-center px-6 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">Ready to get started?<br/>We guarantee a change!</h3>
        <button onClick={scrollToTop} className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out">Back to Top</button>
      </section>

      <section className="mt-16 text-center px-6">
        <p className="text-lg text-slate-200">Learning was never difficult, it just needed a new perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.</p>
      </section>

      <section className="mt-12 px-6 mb-12">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-xl">
          <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
          <p className="text-slate-400 mb-4">Have a question? Fill out the form and we'll get back to you.</p>

          <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4">
            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your email</span>
              <input name="email" type="email" placeholder="steve.jobs@gmail.com" required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500" />
              <div className="text-xs text-slate-500 mt-1">Example: steve.jobs@gmail.com</div>
            </label>

            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your message</span>
              <textarea name="message" rows={5} placeholder="Hi — I'm interested in learning more about VertexED..." required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"></textarea>
              <div className="text-xs text-slate-500 mt-1">Briefly tell us what you'd like help with.</div>
            </label>

            <div className="flex items-center justify-between">
              <button type="submit" className="px-6 py-3 rounded-full bg-white text-slate-900 shadow hover:scale-105 transition">Send</button>
              <p className="text-sm text-slate-400">We’ll reply as soon as we can.</p>
            </div>
          </form>
        </div>
      </section>

      <style>{`
        .glass-tile { background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02)); backdrop-filter: blur(8px); }
        .glass-card { background: linear-gradient(180deg, rgba(6,8,15,0.6), rgba(6,8,20,0.45)); }
        .stat-glow { text-shadow: 0 6px 24px rgba(99,102,241,0.08); }
        .backface-hidden { backface-visibility: hidden; }
        .highlight-clip { position: relative; display: inline-block; overflow: visible; }
        .hl-inner { background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02)); padding: 0.125rem 0.25rem; border-radius: 6px; }
        .scribble-path { transition: stroke-dashoffset 300ms linear; }
        .intro-letter { display: inline-block; transform-origin: center; }
        .problem-card { perspective: 1200px; }
        @media (prefers-reduced-motion: reduce) { .fade-up, .feature-row, .tilt-card { transition: none !important; animation: none !important; } }
      `}</style>
    </>
  );
}
