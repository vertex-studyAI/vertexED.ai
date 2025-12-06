// src/pages/Home.tsx
import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // refs
  const missionRef = useRef<HTMLDivElement | null>(null);

  // keep a ref for cleaning up tilt handlers
  const tiltHandlersRef = useRef<Array<() => void>>([]);

  // only a blob (no white dot) — the "Lando mask"
  const cursorBlobRef = useRef<HTMLDivElement | null>(null);

  // Avoid redirecting search engine bots; let them index the homepage content directly
  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      // Warm up the Main route chunk before navigating to avoid a blank flash
      const warm = () => import("@/pages/Main").catch(() => {});
      // Give the prefetch a short head start, then navigate
      warm().finally(() => {
        navigate("/main", { replace: true });
      });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Defer loading GSAP until the browser is idle; this keeps initial JS small on mobile
    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== "undefined"
        ? // @ts-ignore
          requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);
    const cancelIdle = (id: any) =>
      // @ts-ignore
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    let cleanup: () => void = () => {};
    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      // Fade-up elements: create an individual animation for each element
      const elements = gsap.utils.toArray<HTMLElement>(".fade-up");
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0, scale: 0.995 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.04,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // feature rows: slide from left/right + subtle rotation
      const featureRows = gsap.utils.toArray<HTMLElement>(".feature-row");
      featureRows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { x: i % 2 === 0 ? -60 : 60, opacity: 0, rotateX: 2 },
          {
            x: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.95,
            ease: "power3.out",
            delay: i * 0.08, // one-by-one effect as they enter
            scrollTrigger: {
              trigger: row,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    };

    const idleId = idle(run);
    return () => {
      cancelIdle(idleId);
      cleanup();
    };
  }, []);

  // content arrays
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

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));
  const toggleFlip = (index: number) => setFlipped((prev) => { const updated = [...prev]; updated[index] = !updated[index]; return updated; });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const featureSideText = [
    "This is your go to place for those late nights, early mornings, at the library or simply anywhere you are doing independent learning.",
    "Not just another bot, it learns and adapts to you; your strengths, passions and limitations and moreover your progress.",
    "Better organize your sessions and activities so you end up with more done and less energy spent so you can focus on what really matters; life.",
    "Like a teacher built in, constantly finding limitations you would never find and providing the ways to become even closer to perfection",
    "It's like having infinite practice papers ready to go. Non Stop practice based on material which already exists.",
    "This is just the beginning! more features are on their way as you read this."
  ];

  // -------------------
  // Tilt helper: attach subtle tilt to .tilt-card elements
  // -------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Avoid attaching listeners on touch-only devices; keeps mobile main thread lighter
    const canTilt = window.matchMedia
      ? window.matchMedia("(hover:hover) and (pointer:fine)").matches
      : true;
    if (!canTilt) return;

    // clean up array
    tiltHandlersRef.current = [];

    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));

    els.forEach((el) => {
      let rect = el.getBoundingClientRect();
      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;
      let curX = 0;
      let curY = 0;
      let curZ = 0;
      let raf = 0;

      const options = { maxTilt: 3.2, perspective: 1000, translateZ: 6, ease: 0.12 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        targetY = ((x - halfW) / halfW) * options.maxTilt; // rotateY
        targetX = ((halfH - y) / halfH) * options.maxTilt; // rotateX

        // subtle rotateZ based on angle
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI); // -180..180
        targetZ = (ang / 90) * 1.6; // small twist (-1.6deg .. 1.6deg approx)

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
        targetX = 0; targetY = 0; targetZ = 0;
        if (raf) cancelAnimationFrame(raf);
        // gently animate back
        el.style.transition = "transform 420ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = `perspective(${options.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
        setTimeout(() => { el.style.transition = ""; }, 450);
      };

      const onEnter = () => { el.style.transition = ""; };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mouseenter", onEnter);

      // store cleanup
      tiltHandlersRef.current.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("mouseenter", onEnter);
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => {
      tiltHandlersRef.current.forEach((fn) => fn());
      tiltHandlersRef.current = [];
    };
  }, []);

  // Mission panel has slightly different behavior: small, ultra-smooth lerp and small translate
  useEffect(() => {
    const el = missionRef.current;
    if (!el || typeof window === "undefined") return;

    const canTilt = window.matchMedia
      ? window.matchMedia("(hover:hover) and (pointer:fine)").matches
      : true;
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
      tY = ((x - halfW) / halfW) * opts.maxTilt; // rotateY
      tX = ((halfH - y) / halfH) * opts.maxTilt; // rotateX

      const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
      tZ = (ang / 90) * 1.0; // tiny rotateZ

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
      tX = 0; tY = 0; tZ = 0;
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

  // -------------------
  // FLUID CURSOR (Lando-like mask) — only blob, reacts to interactive elements
  // -------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const blob = cursorBlobRef.current;
    if (!blob) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let blobX = mouseX;
    let blobY = mouseY;
    let rafId = 0;

    // interactive selectors: when over them, blob tightens / becomes more opaque
    const interactiveSelector = "a, button, input, textarea, .tilt-card, .glass-tile";

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const render = () => {
      // slow lerp for that masked/laggy feel
      blobX += (mouseX - blobX) * 0.08;
      blobY += (mouseY - blobY) * 0.08;
      blob.style.transform = `translate3d(${blobX - 120}px, ${blobY - 120}px, 0)`;
      rafId = requestAnimationFrame(render);
    };

    const onDown = () => {
      blob.style.transition = "transform 160ms ease-out, opacity 200ms";
      blob.style.transform = `translate3d(${mouseX - 120}px, ${mouseY - 120}px, 0) scale(0.92)`;
      blob.style.opacity = "0.95";
    };

    const onUp = () => {
      blob.style.transition = "transform 300ms cubic-bezier(0.22,1,0.36,1), opacity 300ms";
      // render loop will take over the transform shortly after
    };

    // toggle when over interactive elements
    const onDocOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const hit = t.closest(interactiveSelector);
      if (hit) {
        blob.classList.add("cursor-blob--active");
      } else {
        blob.classList.remove("cursor-blob--active");
      }
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mousemove", onDocOver, { passive: true });
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);

    rafId = requestAnimationFrame(render);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousemove", onDocOver);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // -------------------
  // Subcomponents
  // -------------------
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    // Inverted color scheme: front = light (white bg + dark text), back = dark (existing glass-tile)
    return (
      <div
        key={i}
        onClick={() => toggleFlip(i)}
        className="group relative h-56 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.28)] perspective tilt-card fade-up"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 transform"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped[i] ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front — inverted (white) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold rounded-2xl"
            style={{ backfaceVisibility: "hidden", background: "linear-gradient(180deg,#ffffff,#f8fafc)", color: "#04263b" }}
          >
            <span style={{ fontFeatureSettings: "'tnum' 1" }}>{p.stat}</span>
            <span className="text-sm italic" style={{ color: "rgba(4,38,59,0.6)" }}>Click to find out</span>
          </div>

          {/* Back — keep dark/glass feel */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed rounded-2xl"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", background: "linear-gradient(180deg, rgba(8,12,20,0.9), rgba(11,16,22,0.85))", color: "var(--tw-text-opacity,1)" }}
          >
            <div style={{ color: "#e6eef6" }}>
              <div>{p.text}</div>
              <div className="mt-3 text-xs italic" style={{ color: "rgba(226,236,246,0.65)" }}>Backed by research-backed principles: active recall, spaced repetition and retrieval practice.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function FeatureRow({ f, i }: { f: { title: string; desc: string }; i: number }) {
    return (
      <div
        key={i}
        className={`feature-row flex flex-col md:flex-row items-center gap-10 fade-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
      >
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card planner-card">
          <h4 className="text-xl font-bold mb-3">{f.title}</h4>
          <p>{f.desc}</p>
          <div className="mt-4 text-sm text-slate-500">Built around proven learning techniques.</div>
        </div>
        <Link
          to="/features"
          className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left"
        >
          {i % 2 === 0
            ? "The all in 1 hub for your study sessions with all the tools one could ask for."
            : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}
          <div className="mt-4 text-slate-400">{featureSideText[i]}</div>
        </Link>
      </div>
    );
  }

  // -------------------
  // Render
  // -------------------
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

      {/* Inline minimal styles for cursor blob and flashcard tweaks */}
      <style>{`
        /* Cursor blob styles (Lando-like mask) */
        .cursor-blob {
          position: fixed;
          left: 0;
          top: 0;
          width: 240px;
          height: 240px;
          pointer-events: none;
          z-index: 1400;
          transform: translate3d(-120px, -120px, 0);
          transition: transform 220ms linear, opacity 220ms linear;
          opacity: 0.72;
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }
        .cursor-blob > .inner {
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          filter: blur(34px);
          background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.28) 0%, rgba(14,165,233,0.2) 25%, rgba(14,165,233,0.06) 60%, rgba(2,6,23,0) 100%);
        }
        /* when over interactive elements, tighten and increase opacity */
        .cursor-blob.cursor-blob--active {
          width: 120px;
          height: 120px;
          transform: translate3d(-60px, -60px, 0) scale(0.88);
          opacity: 0.95;
        }
        .cursor-blob.cursor-blob--active > .inner {
          filter: blur(18px);
          background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.5) 0%, rgba(14,165,233,0.35) 30%, rgba(14,165,233,0.12) 65%, rgba(2,6,23,0) 100%);
        }

        /* Flashcard front: use subtle border to look premium on light bg */
        .problem-card-front {
          border: 1px solid rgba(6,10,15,0.04);
        }

        /* small accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
          .cursor-blob { display: none; }
        }
      `}</style>

      {/* Cursor blob only (no white dot) */}
      <div ref={cursorBlobRef} className="cursor-blob" aria-hidden>
        <div className="inner" />
      </div>

      {/* Hero */}
      <section
        className="glass-card px-6 pt-24 pb-16 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 fade-up">
            <div className="relative w-full h-[6.75rem] md:h-[9.25rem] flex items-center justify-center">
              {/* We render the animated text inside a flex column that auto-detects wrap */}
              <h1
                className="text-5xl md:text-7xl font-semibold text-white leading-tight text-center flex flex-col justify-center [--gap:0.4rem] md:[--gap:0.6rem]"
                style={{ lineHeight: 1.05 }}
              >
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
              </h1>
            </div>
          </div>

          <p className="text-lg text-slate-200 mb-10 fade-up">
            An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods like active recall, spaced repetition, and retrieval practice.
          </p>

          <div className="flex gap-4 justify-center fade-up">
            <Link
              to="/main"
              className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-400 ease-in-out shadow-xl hover:scale-105 ring-1 ring-white/10"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-transform duration-400 ease-in-out shadow-md hover:scale-105"
              aria-label="Learn more about VertexED on the About page"
            >
              Learn more about VertexED
            </Link>
          </div>
        </div>
      </section>

      {/* Subtle resources link below hero for crawl paths/brand queries */}
      <div className="max-w-3xl mx-auto px-6 mt-3">
        <div className="text-xs text-slate-400 text-center">
          Looking for how-to guides? <Link to="/resources" className="underline">Explore resources</Link>
        </div>
      </div>

      {/* Storytelling */}
      <section className="mt-12 md:mt-15 text-center px-6 fade-up">
        <div className="w-full mx-auto h-[4.8rem] md:h-auto flex items-center justify-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight flex flex-col justify-center">
            <TypeAnimation
              sequence={[1200, "We hate the way we study.", 1400, "We hate cramming.", 1400, "We hate wasted time.", 1400, "We hate inefficient tools."]}
              speed={40}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </h2>
        </div>
        <p className="text-lg text-slate-200 mb-12">Who wouldn’t?</p>
      </section>

      {/* Why is this a problem? */}
      <section className="max-w-6xl mx-auto px-6 mt-28 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center">Why is this a problem?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => (
            <ProblemCard key={i} p={p} i={i} />
          ))}
        </div>
      </section>

      {/* Mission Paragraph */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center fade-up">
        <div
          ref={missionRef}
          className="glass-card text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-transform duration-300"
          aria-label="Mission panel"
        >
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

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center fade-up">
          <Link to="/features" className="hover:underline">Explore Our Features</Link>
        </h3>
        <div className="text-center mb-8">
          <Link
            to="/features"
            className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300"
          >
            See full features
          </Link>
        </div>

        <div className="space-y-20">
          {features.map((f, i) => (
            <FeatureRow key={i} f={f} i={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">
          Ready to get started?
          <br />
          We guarantee a change!
        </h3>
        <button
          onClick={scrollToTop}
          className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out"
        >
          Back to Top
        </button>
      </section>

      {/* Closing */}
      <section className="mt-16 text-center px-6">
        <p className="text-lg text-slate-200">Learning was never difficult, it just needed a new perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.</p>
      </section>

      {/* Contact Us (Formspree) */}
      <section className="mt-12 px-6 mb-12">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-xl">
          <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
          <p className="text-slate-400 mb-4">Have a question? Fill out the form and we'll get back to you.</p>

          <form
            action="https://formspree.io/f/mldpklqk"
            method="POST"
            className="space-y-4"
          >
            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your email</span>
              <input
                name="email"
                type="email"
                placeholder="steve.jobs@gmail.com"
                required
                className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <div className="text-xs text-slate-500 mt-1">Example: steve.jobs@gmail.com</div>
            </label>

            <label className="block text-left">
              <span className="text-sm text-slate-300 mb-1 block">Your message</span>
              <textarea
                name="message"
                rows={5}
                placeholder="Hi — I'm interested in learning more about VertexED..."
                required
                className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              ></textarea>
              <div className="text-xs text-slate-500 mt-1">Briefly tell us what you'd like help with.</div>
            </label>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-white text-slate-900 shadow hover:scale-105 transition"
              >
                Send
              </button>
              <p className="text-sm text-slate-400">We’ll reply as soon as we can.</p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
