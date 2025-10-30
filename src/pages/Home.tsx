import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TypeAnimation } from "react-type-animation";

// Home page — Landon Norris inspired take on VertexED
// Single-file React component (TypeScript + Tailwind). Drop into your pages folder.

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // refs
  const missionRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const bgRef = useRef<HTMLDivElement | null>(null);

  // tilt cleanup
  const tiltHandlersRef = useRef<Array<() => void>>([]);

  // preserve the warm-up redirect (with bot detection)
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

  // GSAP-driven scroll/entrance animations + subtle parallax for blobs
  useEffect(() => {
    if (typeof window === "undefined") return;

    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== "undefined"
        ? // @ts-ignore
          requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);
    const cancelIdle = (id: any) =>
      // @ts-ignore
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    let cleanup = () => {};

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);

      // subtle floating for decorative blobs
      const blobs = gsap.utils.toArray<HTMLElement>(".bg-blob");
      gsap.to(blobs, {
        y: (i) => (i % 2 === 0 ? -40 : 40),
        x: (i) => (i % 2 === 0 ? -20 : 20),
        duration: 14,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // fade-up plus small scale for typical elements
      const elements = gsap.utils.toArray<HTMLElement>(".fade-up");
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { y: 48, opacity: 0, scale: 0.995 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "bottom 30%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // small header shrink on scroll
      const header = headerRef.current;
      if (header) {
        ScrollTrigger.create({
          start: "top -10",
          onUpdate: (self: any) => {
            const amt = Math.min(1, self.progress * 1.1);
            header.style.backdropFilter = `saturate(${1 - amt * 0.15}) blur(${amt * 3}px)`;
            header.style.transform = `translateY(${amt * -6}px)`;
            header.style.opacity = `${1 - amt * 0.06}`;
          },
        });
      }

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

  // Tilt interactions (keeps the existing implementation but slightly tuned)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const canTilt = window.matchMedia
      ? window.matchMedia("(hover:hover) and (pointer:fine)").matches
      : true;
    if (!canTilt) return;

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

      const options = { maxTilt: 4.0, perspective: 900, translateZ: 8, ease: 0.12 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        targetY = ((x - halfW) / halfW) * options.maxTilt; // rotateY
        targetX = ((halfH - y) / halfH) * options.maxTilt; // rotateX

        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        targetZ = (ang / 90) * 2; // small twist

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
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => {
      tiltHandlersRef.current.forEach((fn) => fn());
      tiltHandlersRef.current = [];
    };
  }, []);

  // content arrays (kept from your version but tweaked copy)
  const problems = [
    { stat: "65%", text: "of students report struggling to find relevant resources despite studying for long hours." },
    { stat: "70%", text: "say note-taking takes up more time than actual learning, making revision less effective." },
    { stat: "80%", text: "feel that current test papers lack rigor and fail to prepare them for real exams." },
    { stat: "60%", text: "admit procrastination is easier because studying feels overwhelming and tedious." },
    { stat: "75%", text: "use 3+ different apps for studying, which makes their workflow scattered and inefficient." },
    { stat: "50%", text: "wish there was a single platform that combines planning, practice, and AI-powered help in one place." },
  ];

  const features = [
    { title: "Study Zone", desc: "A calm, focused hub for calculators, activity logs and learning artifacts — with powerful search and session playback." },
    { title: "AI Chatbot", desc: "A dialog-first tutor that asks questions back and helps you build explanations — not just give answers." },
    { title: "Study Planner", desc: "Smart schedules that adapt as you study. Built-in reviews based on spaced repetition and your real performance." },
    { title: "Answer Reviewer", desc: "Detailed, evidence-based feedback so you know exactly how to improve each response." },
    { title: "Paper Maker", desc: "Generate exam-style papers tailored to your syllabus — practice with confidence." },
    { title: "Notes + Flashcards + Quiz", desc: "A single flow from notes -> cards -> quiz so nothing gets lost between ideas and recall." },
  ];

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));
  const toggleFlip = (index: number) => setFlipped((prev) => { const updated = [...prev]; updated[index] = !updated[index]; return updated; });

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // small helper subcomponents below
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    return (
      <div
        key={i}
        onClick={() => toggleFlip(i)}
        className="group relative h-56 glass-tile text-slate-100 rounded-2xl shadow-2xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_12px_60px_rgba(2,6,23,0.36)] perspective tilt-card fade-up"
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
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-4xl font-extrabold backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-fuchsia-300 to-indigo-200">{p.stat}</span>
            <span className="text-sm text-slate-400 italic group-hover:text-slate-300 transition-colors">Click to reveal</span>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-6 text-lg leading-relaxed glass-tile rounded-2xl text-slate-200"
            style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          >
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
      <div
        key={i}
        className={`feature-row flex flex-col md:flex-row items-center gap-10 fade-up ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
      >
        <div className="flex-1 glass-tile rounded-2xl shadow-2xl p-6 text-slate-100 tilt-card planner-card">
          <h4 className="text-2xl font-bold mb-3">{f.title}</h4>
          <p className="text-base leading-relaxed">{f.desc}</p>
          <div className="mt-4 text-sm text-slate-400">Built around proven learning techniques.</div>
        </div>
        <div className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left">
          {i % 2 === 0 ? (
            <>
              <p className="text-xl font-semibold">The all-in-one hub for focused sessions.</p>
              <p className="mt-4 text-slate-400">This feature is designed to be your primary workspace — minimal, fast and respectful of attention.</p>
            </>
          ) : (
            <>
              <p className="text-xl font-semibold">Designed to keep you motivated.</p>
              <p className="mt-4 text-slate-400">Small, consistent wins compound. VertexED helps you find them.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Extra decorative CSS injected into the page (small set of keyframes + helper classes)
  const extraStyles = `
    .glass-tile { background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)); border: 1px solid rgba(255,255,255,0.06); }
    .backface-hidden { -webkit-backface-visibility: hidden; backface-visibility: hidden; }

    /* Animated background movement */
    .bg-gradient-animated { background-size: 200% 200%; animation: gradientShift 12s linear infinite; }
    @keyframes gradientShift { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }

    /* decorative blob visual helpers */
    .bg-blob { filter: blur(36px) saturate(1.1); opacity: 0.9; transform-origin: center; }
    @media (max-width: 768px) { .bg-blob { filter: blur(30px) saturate(1.05); opacity: 0.85; } }

    /* subtle utility so text contrast feels same on light/dark */
    .tone-muted { color: rgba(226, 232, 240, 0.88); }

    /* micro-interaction for floating CTA */
    .pulse-cta { animation: pulse 4.2s infinite; }
    @keyframes pulse { 0% { transform: translateY(0) } 50% { transform: translateY(-6px) } 100% { transform: translateY(0) } }

  `;

  return (
    <>
      <SEO
        title="VertexED — AI Study Tools for Students - Reimagined"
        description="All-in-one AI study toolkit with planner, calendar, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription. Beautiful UI inspired by modern product sites."
        canonical="https://www.vertexed.app/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "VertexED — AI Study Toolkit",
          url: "https://www.vertexed.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.vertexed.app/?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />

      {/* Inject extra styles for this page only */}
      <style>{extraStyles}</style>

      {/* Background canvas with animated blobs */}
      <div ref={bgRef} className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-20 w-[48rem] h-[48rem] bg-gradient-to-tr from-[#ff7ab6] via-[#7c5cff] to-[#4dd0e1] rounded-full opacity-80 bg-blob transform-gpu animate-[spin_160s_linear_infinite]" style={{ mixBlendMode: 'overlay' }} />
        <div className="absolute -right-28 bottom-8 w-[38rem] h-[38rem] bg-gradient-to-br from-[#ffd37a] via-[#ff7a7a] to-[#9b6bff] rounded-full opacity-80 bg-blob" style={{ mixBlendMode: 'overlay', animation: 'none' }} />
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <filter id="grain">
            <feTurbulence baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.06" />
            </feComponentTransfer>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" opacity="0.02" />
        </svg>
      </div>

      {/* Header */}
      <header ref={headerRef} className="fixed top-4 left-0 right-0 mx-auto max-w-7xl px-6 flex items-center justify-between z-30 transition-all duration-300 rounded-full bg-white/4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-400 via-fuchsia-400 to-rose-300 flex items-center justify-center text-slate-900 font-bold">VE</div>
          <div className="hidden sm:block text-slate-100 font-semibold">VertexED</div>
        </div>
        <nav className="flex items-center gap-4">
          <Link to="/features" className="text-slate-200 hidden md:inline">Features</Link>
          <Link to="/pricing" className="text-slate-200 hidden md:inline">Pricing</Link>
          <Link to="/resources" className="text-slate-200 hidden md:inline">Resources</Link>
          <Link to="/about" className="text-slate-200 hidden md:inline">About</Link>
          <Link to="/main" className="px-4 py-2 rounded-full bg-white text-slate-900 shadow-sm ml-2">Try VertexED</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="min-h-[70vh] flex items-center justify-center text-center px-6">
        <div className="max-w-5xl mx-auto">
          <div className="fade-up mb-8">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white tracking-tight">
              <TypeAnimation
                sequence={[
                  900,
                  "Design your study. Master your exams.",
                  1600,
                  "Focus that actually lasts.",
                  1600,
                  "Built for learners who want deep work.",
                ]}
                speed={45}
                wrapper="span"
                cursor={true}
                repeat={Infinity}
              />
            </h1>
          </div>

          <p className="text-lg text-slate-200 mb-8 fade-up">
            An elegant, distraction-first UI with powerful AI under the hood. Planner, notes, flashcards, quizzes and a tutor — all in one beautiful workspace.
          </p>

          <div className="flex items-center justify-center gap-4 fade-up">
            <Link to="/main" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-semibold shadow-lg transform-gpu hover:scale-[1.03] transition">
              Get Started
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/features" className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition">
              Explore features
            </Link>
          </div>

          {/* floating small CTA */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/6 border border-white/6 text-slate-100 pulse-cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span className="text-sm">Join our weekly study ritual — 10 mins, proven impact</span>
            </div>
          </div>
        </div>
      </section>

      {/* quick stats / problems grid (now with diagonal layout like creative sites) */}
      <section className="max-w-6xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-1 glass-tile p-6 rounded-2xl shadow-2xl fade-up tilt-card">
            <h4 className="text-2xl font-bold text-white mb-2">Why VertexED?</h4>
            <p className="text-slate-300">We combine attention-first design with science-backed study systems so what you learn actually stays.</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {problems.slice(0,2).map((p, i) => (
                <div key={i} className="p-3 bg-white/3 rounded-lg">
                  <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-300 via-fuchsia-300 to-indigo-200">{p.stat}</div>
                  <div className="text-xs text-slate-200 mt-1">{p.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-1 p-6 rounded-2xl shadow-2xl fade-up">
            <div className="glass-tile p-6 rounded-2xl">
              <h4 className="text-2xl font-bold text-white mb-4">Focused tools</h4>
              <p className="text-slate-300">From a planner that adapts to your performance to an answer reviewer that explains exactly where you went wrong — build mastery with clarity.</p>
              <div className="mt-6 space-y-3">
                {features.slice(0,3).map((f, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/8 text-white font-semibold">{i+1}</div>
                    <div>
                      <div className="font-semibold text-white">{f.title}</div>
                      <div className="text-sm text-slate-300">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-1 glass-tile p-6 rounded-2xl shadow-2xl fade-up tilt-card">
            <h4 className="text-2xl font-bold text-white mb-3">Quick demo</h4>
            <p className="text-slate-300 mb-4">Watch how a study session converts notes into flashcards and then schedules reviews automatically.</p>
            <div className="w-full h-40 bg-gradient-to-r from-slate-800/30 to-transparent rounded-lg flex items-center justify-center">
              <div className="text-slate-300">(Animated demo placeholder)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem cards — improved visual rhythm */}
      <section className="max-w-6xl mx-auto px-6 mt-16">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-8 fade-up">The problems students face</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <ProblemCard key={i} p={p} i={i} />
          ))}
        </div>
      </section>

      {/* Mission panel — centered and elevated with subtle tilt behaviour */}
      <section className="max-w-4xl mx-auto mt-20 px-6 text-center">
        <div
          ref={missionRef}
          className="glass-card text-slate-100 rounded-3xl shadow-[0_30px_80px_rgba(2,6,23,0.6)] p-10 transform transition-transform duration-300 fade-up tilt-card"
          aria-label="Mission panel"
        >
          <p className="text-lg md:text-xl leading-relaxed">
            Studying should be simple, human and measurable. We build tools that encourage curiosity and make progress visible — one session at a time.
          </p>

          <ul className="text-left mt-6 space-y-3">
            <li className="font-semibold">• Improve the way you approach learning</li>
            <li className="font-semibold">• Improve your performance on exams</li>
            <li className="font-semibold">• Improve comprehension and long-term retention</li>
          </ul>

          <p className="text-lg md:text-xl mt-6 leading-relaxed font-semibold">
            Our aim is not only to raise scores, but to build lasting skills.
          </p>
        </div>
      </section>

      {/* Feature list */}
      <section className="max-w-6xl mx-auto px-6 mt-24">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center fade-up">Explore our features</h3>
        <div className="space-y-16">
          {features.map((f, i) => (
            <FeatureRow key={i} f={f} i={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6 fade-up">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">Ready to get started? We guarantee a change.</h3>
        <div className="flex items-center justify-center gap-4">
          <Link to="/main" className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-xl hover:scale-105 transition">Get Started</Link>
          <button onClick={scrollToTop} className="px-6 py-3 rounded-full bg-white/6 text-white border border-white/10">Back to top</button>
        </div>
      </section>

      {/* Footer / Contact */}
      <section className="mt-16 px-6 mb-16">
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 text-slate-100 shadow-2xl fade-up">
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

    </>
  );
}
