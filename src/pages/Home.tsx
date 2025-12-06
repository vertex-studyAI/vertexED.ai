// src/pages/Home.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

const ScrollToPlugin = ScrollToPluginModule?.default ?? ScrollToPluginModule;
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Cinematic Home page:
 * - Full-screen cover with scribble logo + per-letter headline reveal
 * - Cover pins + zooms out on scroll (ScrollTrigger scrub)
 * - Flowing words & horizontal movement + static decorative elements
 * - Gentle section reveals after the hero
 *
 * Notes:
 *  - Requires `gsap` (npm i gsap). We lazy-import gsap + ScrollTrigger at runtime.
 *  - Add the small CSS snippet after this file into your global stylesheet.
 */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Refs
  const pageRef = useRef<HTMLDivElement | null>(null);
  const coverRef = useRef<HTMLElement | null>(null);
  const coverHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const coverScribbleRef = useRef<SVGPathElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const highlightsRef = useRef<Array<HTMLElement | null>>([]);
  const tiltHandlersRef = useRef<Array<() => void>>([]);

  // UI state
  const [introDone, setIntroDone] = useState(false);

  // Content (kept from your original)
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
  const toggleFlip = (index: number) => setFlipped(prev => {
    const copy = [...prev];
    copy[index] = !copy[index];
    return copy;
  });

  // redirect warm-up (kept as-is; bot-safe)
  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => navigate("/main", { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  // Small helper: disable/enable scroll (used while intro plays)
  const disableScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };
  const enableScroll = () => {
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  // -----------------------
  // GSAP: Intro timeline + ScrollTrigger hero zoom
  // -----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Respect reduced motion
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanup: (() => void) | null = null;

    (async () => {
      // lazy import
      const gsapModule = await import("gsap");
      const gsap: any = gsapModule.default ?? gsapModule;
      const ScrollTriggerModule = await import("gsap/ScrollTrigger");
      const ScrollToPluginModule = await import("gsap/ScrollToPlugin").catch(() => ({}));
      const ScrollTrigger: any = ScrollTriggerModule?.default ?? (gsap as any).ScrollTrigger ?? ScrollTriggerModule;
      // register
      gsap.registerPlugin(ScrollTrigger);

      // small helper: split heading to char spans
      const splitToChars = (el: HTMLElement | null) => {
        if (!el) return [] as HTMLElement[];
        const t = el.textContent || "";
        el.innerHTML = "";
        const nodes: HTMLElement[] = [];
        for (const ch of t.split("")) {
          const span = document.createElement("span");
          span.className = "inline-block char";
          span.textContent = ch === " " ? "\u00A0" : ch;
          el.appendChild(span);
          nodes.push(span);
        }
        return nodes;
      };

      // grab elements
      const cover = coverRef.current;
      const coverHeading = coverHeadingRef.current;
      const scribble = coverScribbleRef.current;
      const hero = heroRef.current;

      // if reduced motion, skip heavy animations: just reveal hero and enable scroll
      if (prefersReduced) {
        if (scribble) scribble.style.opacity = "1";
        if (coverHeading) coverHeading.style.opacity = "1";
        setIntroDone(true);
        enableScroll();
        return;
      }

      // block scrolling until intro finished
      disableScroll();

      // build intro timeline (one-shot)
      const introTl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          setIntroDone(true);
          // we keep scroll blocked until ScrollTrigger is set up so there's no jump
        },
      });

      // prepare heading chars
      const chars = splitToChars(coverHeading);
      gsap.set(chars, { y: 40, opacity: 0, rotationX: 8, transformPerspective: 800 });

      // prepare scribble
      if (scribble) {
        const len = scribble.getTotalLength();
        scribble.style.strokeDasharray = `${len}`;
        scribble.style.strokeDashoffset = `${len}`;
      }

      // intro sequence:
      // 1) small paper/cloud fade in behind cover (we can animate cover scale subtly)
      // 2) per-letter reveal
      // 3) scribble draw
      // 4) CTA/chev nudge
      introTl.to(cover, { duration: 0.45, scale: 1.01 }, 0);
      introTl.to(chars, { y: 0, opacity: 1, rotationX: 0, duration: 0.9, stagger: 0.02 }, 0.08);
      if (scribble) introTl.to(scribble, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }, 0.28);
      introTl.to(cover, { duration: 0.9, scale: 1.0, ease: "power2.out" }, 1.3);

      // small pulse to indicate you can scroll (a tiny down arrow could pulse — but keep it minimal)
      introTl.to(cover, { boxShadow: "0 10px 40px rgba(0,0,0,0.16)", duration: 0.6 }, 1.55);

      // after intro finishes, set up ScrollTrigger-based pin + zoom-out effect
      introTl.add(async () => {
        // create a hero scroll timeline that pins the cover and zooms it out while revealing the page
        // The idea: as user scrolls the pinned region, the cover scales down, blurs a tiny bit,
        // and moves up—revealing the real site beneath.
        // NOTE: using scrub makes this smooth and tied to user scrolling.

        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: pageRef.current ?? document.body,
            start: "top top",
            end: "top+=700 top", // 700px scroll zone to animate hero zoom-out
            scrub: 0.8,
            pin: cover, // pin the cover
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // scale down, translate up slightly, make hero content settle into place
        heroTl.to(cover, { scale: 0.86, duration: 1, ease: "power1.out" }, 0);
        heroTl.to(cover, { y: "-8vh", duration: 1, ease: "power1.out" }, 0);
        heroTl.to(coverHeading, { scale: 0.92, opacity: 0.95, duration: 1 }, 0);
        // reduce scribble opacity a little
        if (scribble) heroTl.to(scribble, { opacity: 0.12, duration: 1 }, 0);

        // reveal the hero section (main page content) with slight zoom-in as cover moves away
        heroTl.fromTo(hero, { opacity: 0, scale: 0.99 }, { opacity: 1, scale: 1, duration: 1 }, 0.25);

        // small floating decorative layers horizontally move as user scrolls (parallax-like)
        const flowEls = Array.from(document.querySelectorAll<HTMLElement>(".flow-word"));
        flowEls.forEach((el, idx) => {
          const x = (idx % 2 === 0 ? -1 : 1) * (120 + idx * 30);
          heroTl.to(el, { xPercent: x, duration: 1, ease: "none" }, 0);
        });

        // release scroll (pin still controlled by ScrollTrigger)
        enableScroll();
      }, "+=0.02");

      // cleanup function
      cleanup = () => {
        try {
          introTl.kill();
        } catch (e) {}
        try {
          ScrollTrigger.getAll().forEach((t: any) => t.kill());
        } catch (e) {}
        try {
          gsap.killTweensOf("*");
        } catch (e) {}
      };
    })().catch((err) => {
      // if any error occurs, make sure to allow scrolling
      enableScroll();
      setIntroDone(true);
      // eslint-disable-next-line no-console
      console.error("GSAP intro error:", err);
    });

    return () => {
      if (cleanup) cleanup();
      enableScroll();
    };
  }, []);

  // -----------------------
  // Flowing word horizontal motions & small reveal observers
  // We'll animate these with CSS/Gsap via IntersectionObserver or ScrollTrigger above already moves them.
  // Keep tilt handlers for interactive cards as before.
  // -----------------------
  useEffect(() => {
    // keep tilt for .tilt-card as existing logic (lightweight)
    if (typeof window === "undefined") return;
    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    tiltHandlersRef.current = [];
    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));
    els.forEach((el) => {
      let rect = el.getBoundingClientRect();
      let tx = 0, ty = 0, tz = 0;
      let cx = 0, cy = 0, cz = 0;
      let raf = 0;
      const opts = { maxTilt: 3.2, perspective: 1000, translateZ: 6, ease: 0.12 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        ty = ((x - halfW) / halfW) * opts.maxTilt;
        tx = ((halfH - y) / halfH) * opts.maxTilt;
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        tz = (ang / 90) * 1.6;
        if (!raf) raf = requestAnimationFrame(update);
      };

      const update = () => {
        cx += (tx - cx) * opts.ease;
        cy += (ty - cy) * opts.ease;
        cz += (tz - cz) * opts.ease;
        el.style.transform = `perspective(${opts.perspective}px) rotateX(${cx}deg) rotateY(${cy}deg) rotateZ(${cz}deg) translateZ(${opts.translateZ}px)`;
        raf = 0;
      };

      const onLeave = () => {
        tx = ty = tz = 0;
        if (raf) cancelAnimationFrame(raf);
        el.style.transition = "transform 420ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
        setTimeout(() => { el.style.transition = ""; }, 450);
      };

      el.addEventListener("mousemove", onMove);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("mouseenter", () => (el.style.transition = ""));

      tiltHandlersRef.current.push(() => {
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      tiltHandlersRef.current.forEach(fn => fn());
      tiltHandlersRef.current = [];
    };
  }, []);

  // small reveal util for sections after hero (IntersectionObserver)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.add("in-view"); // Tailwind style toggles will animate via CSS
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.14 });

    document.querySelectorAll<HTMLElement>(".reveal").forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // -----------------------
  // Small UI helpers (ProblemCard, FeatureRow)
  // -----------------------
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    return (
      <div
        key={i}
        onClick={() => toggleFlip(i)}
        className="group relative h-56 glass-tile text-slate-100 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.28)] perspective tilt-card reveal will-change-transform"
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span>{p.stat}</span>
            <span className="text-sm text-slate-400 italic group-hover:text-slate-300 transition-colors">Click to find out</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed glass-tile rounded-2xl text-slate-200"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
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
      <div
        key={i}
        className={`feature-row flex flex-col md:flex-row items-center gap-10 reveal ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
      >
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card planner-card will-change-transform">
          <h4 className="text-xl font-bold mb-3">{f.title}</h4>
          <p>{f.desc}</p>
          <div className="mt-4 text-sm text-slate-500">Built around proven learning techniques.</div>
        </div>

        <Link
          to="/features"
          className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left"
        >
          <span className="highlight-clip" ref={el => (highlightsRef.current[i] = el)}>
            <span className="hl-inner inline-block px-1 -skew-x-[6deg]">{
              i % 2 === 0
                ? "The all in 1 hub for your study sessions with all the tools one could ask for."
                : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."
            }</span>
          </span>
          <div className="mt-4 text-slate-400">{/* small side text kept simple */}</div>
        </Link>
      </div>
    );
  }

  // -----------------------
  // Render
  // -----------------------
  return (
    <>
      <SEO
        title="VertexED — AI Study Tools for Students"
        description="All-in-one AI study toolkit with planner, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription."
        canonical="https://www.vertexed.app/"
      />

      {/* Page wrapper (we animate based on scroll of this container) */}
      <div ref={pageRef} className="relative overflow-x-hidden">

        {/* COVER — full-screen cinematic cover (pinned then zoom-out) */}
        <header
          ref={coverRef}
          aria-hidden={!introDone}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[linear-gradient(180deg,rgba(6,10,15,0.92),rgba(8,12,20,0.93))] glass-card px-6"
          style={{ backdropFilter: "blur(8px) saturate(110%)" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            {/* Big logo/wordmark + scribble */}
            <div className="relative inline-block mb-6">
              <h1 ref={coverHeadingRef} className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
                VertexED
              </h1>

              {/* scribble underline that draws itself */}
              <svg className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-[420px] h-20 overflow-visible pointer-events-none" viewBox="0 0 700 80" preserveAspectRatio="xMidYMid meet" aria-hidden>
                <path ref={coverScribbleRef} d="M10 40 C120 10 200 70 300 48 C380 36 480 18 690 44" stroke="rgba(255,255,255,0.14)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="scribble-path"/>
              </svg>
            </div>

            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto">
              A single study environment that combines planning, practice, and intelligent feedback — designed to make learning simpler and more effective.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link to="/main" className="px-8 py-3 rounded-full bg-white text-slate-900 shadow-lg ring-1 ring-white/10">Try now</Link>
              <Link to="/features" className="px-6 py-3 rounded-full border border-white/20 text-white">Learn more</Link>
            </div>

            {/* small hint to scroll */}
            <div className="mt-10 opacity-80 text-slate-300 text-sm">Scroll to explore</div>
          </div>
        </header>

        {/* MAIN PAGE — sits under the cover */}
        <main ref={heroRef} className="relative z-10 pt-[100vh] bg-[radial-gradient(1200px_600px_at_10%_10%,rgba(20,36,44,0.18),transparent 8%),radial-gradient(900px_360px_at_90%_80%,rgba(10,18,28,0.14),transparent 12%),linear-gradient(180deg,#071018,#0b1016)] min-h-screen text-white">
          {/* Decorative flow words that move horizontally with scroll (parallax) */}
          <div aria-hidden className="pointer-events-none absolute left-0 top-8 w-full overflow-visible">
            <div className="max-w-6xl mx-auto relative">
              <span className="flow-word absolute top-0 left-0 text-[clamp(18px,2.8vw,28px)] text-slate-600/30">learn •</span>
              <span className="flow-word absolute top-10 right-0 text-[clamp(16px,2.2vw,24px)] text-slate-600/24">practice •</span>
              <span className="flow-word absolute top-28 left-20 text-[clamp(14px,1.8vw,20px)] text-slate-600/18">retain •</span>
            </div>
          </div>

          {/* Hero content (what user sees after the cover zooms out) */}
          <section className="glass-card max-w-4xl mx-auto px-6 py-24 rounded-3xl shadow-2xl -mt-48 transform">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">AI study tools for students.</h2>
            <p className="text-lg text-slate-200 leading-relaxed">
              An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods like active recall and spaced repetition.
            </p>

            <div className="mt-8 flex gap-4">
              <Link to="/main" className="px-7 py-3 rounded-full bg-white text-slate-900 shadow">Get Started</Link>
              <Link to="/about" className="px-6 py-3 rounded-full border border-white/20 text-white">Learn more about VertexED</Link>
            </div>
          </section>

          {/* Story / Problem (this is the area the user asked to emphasize — scroll can stop here and zoom out earlier to show it) */}
          <section className="max-w-6xl mx-auto px-6 mt-20 reveal">
            <div className="text-center">
              <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">Studying has become harder than ever.</h3>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                With too much information to know what to do with, resources that rarely construct measurable progress,
                and tools that sometimes make things worse, students need a learning space that adapts to them and encourages continuous improvement.
              </p>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="glass-tile p-6 rounded-2xl">
                <ul className="space-y-3 text-slate-100">
                  <li className="font-semibold">• Improve the way you approach learning</li>
                  <li className="font-semibold">• Improve your performance on exams</li>
                  <li className="font-semibold">• Improve comprehension and long-term retention</li>
                </ul>
              </div>
              <div className="glass-tile p-6 rounded-2xl">
                <p className="text-slate-200 leading-relaxed">
                  We focus equally on progress and curiosity: building tools that help you connect ideas, practice deliberately, and grow at your own pace.
                  Our aim is not only to raise scores using evidence-based techniques, but to create an environment where learning becomes rewarding and sustainable.
                </p>
              </div>
            </div>
          </section>

          {/* Problems cards */}
          <section className="max-w-6xl mx-auto px-6 mt-24">
            <h3 className="text-2xl font-semibold mb-6">Why is this a problem?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {problems.map((p, i) => <div key={i} className="reveal"><ProblemCard p={p} i={i} /></div>)}
            </div>
          </section>

          {/* Features */}
          <section className="max-w-6xl mx-auto px-6 mt-28 space-y-8">
            {features.map((f, i) => <div key={i}><FeatureRow f={f} i={i} /></div>)}
          </section>

          {/* Closing CTA and contact */}
          <section className="max-w-4xl mx-auto px-6 mt-28 text-center reveal">
            <h3 className="text-3xl font-semibold mb-4">Ready to get started? We guarantee a change!</h3>
            <button onClick={scrollToTop} className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl">Back to Top</button>
          </section>

          <section className="mt-16 px-6 mb-16">
            <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-xl">
              <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
              <p className="text-slate-400 mb-4">Have a question? Fill out the form and we'll get back to you.</p>
              <form action="https://formspree.io/f/mldpklqk" method="POST" className="space-y-4">
                <label className="block text-left">
                  <span className="text-sm text-slate-300 mb-1 block">Your email</span>
                  <input name="email" type="email" placeholder="steve.jobs@gmail.com" required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500" />
                </label>
                <label className="block text-left">
                  <span className="text-sm text-slate-300 mb-1 block">Your message</span>
                  <textarea name="message" rows={5} placeholder="Hi — I'm interested in learning more about VertexED..." required className="w-full rounded-md p-3 bg-white/5 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"></textarea>
                </label>
                <div className="flex items-center justify-between">
                  <button type="submit" className="px-6 py-3 rounded-full bg-white text-slate-900 shadow">Send</button>
                  <p className="text-sm text-slate-400">We’ll reply as soon as we can.</p>
                </div>
              </form>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/* Note: ProblemCard and FeatureRow are defined inline below for clarity */
function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(x => !x)}
      className="group relative h-56 glass-tile text-slate-100 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.28)] perspective tilt-card will-change-transform"
    >
      <div style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }} className="absolute inset-0 transition-transform duration-700 transform">
        <div style={{ backfaceVisibility: "hidden" }} className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-bold">
          <span>{p.stat}</span>
          <span className="text-sm text-slate-400 italic">Click to find out</span>
        </div>
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} className="absolute inset-0 flex items-center justify-center p-4 text-lg leading-relaxed glass-tile rounded-2xl text-slate-200">
          <div>
            <div>{p.text}</div>
            <div className="mt-3 text-xs text-slate-500 italic">Backed by active recall, spaced repetition and retrieval practice.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
function FeatureRow({ f, i }: { f: { title: string; desc: string }; i: number }) {
  return (
    <div className={`feature-row flex flex-col md:flex-row items-center gap-10 reveal ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}>
      <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card planner-card will-change-transform">
        <h4 className="text-xl font-bold mb-3">{f.title}</h4>
        <p>{f.desc}</p>
        <div className="mt-4 text-sm text-slate-500">Built around proven learning techniques.</div>
      </div>
      <div className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left">
        <span className="highlight-clip"><span className="hl-inner inline-block px-1 -skew-x-[6deg]">{i % 2 === 0 ? "The all in 1 hub for your study sessions with all the tools one could ask for." : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."}</span></span>
      </div>
    </div>
  );
}
