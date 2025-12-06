// src/pages/Home.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Home — cinematic hero intro + per-letter rotator + GSAP reveals (non-scroll-driven)
 *
 * - Lazy-loads gsap & keeps the main thread light.
 * - Locks scroll for intro timeline and releases automatically.
 * - Uses IntersectionObserver for below-the-fold reveals that zoom & fade when visible.
 *
 * NOTE: install gsap (`npm i gsap`) since we lazy-import it at runtime.
 */

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Refs
  const heroRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const scribbleRef = useRef<SVGPathElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const missionRef = useRef<HTMLDivElement | null>(null);
  const tiltHandlersRef = useRef<Array<() => void>>([]);
  const rotatorRef = useRef<HTMLDivElement | null>(null); // container for the custom rotator
  const rotatorCharsRef = useRef<Array<HTMLElement | null>>([]); // per-letter nodes for rotator

  // content
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
  const toggleFlip = (idx: number) => setFlipped(prev => {
    const copy = [...prev];
    copy[idx] = !copy[idx];
    return copy;
  });

  // --- Keep original redirect behavior (bot-safe)
  useEffect(() => {
    if (!isAuthenticated) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isBot = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|linkedinbot|embedly|quora|pinterest|vkshare|facebot|outbrain|ia_archiver/.test(ua);
    if (!isBot) {
      const warm = () => import("@/pages/Main").catch(() => {});
      warm().finally(() => navigate("/main", { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  // -----------------------
  // Utility: disable/enable page scroll (for intro)
  // -----------------------
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
  // GSAP intro + rotator + scribble
  // -----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    // idle helper
    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== "undefined"
        ? // @ts-ignore
          requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);

    const cancelIdle = (id: any) =>
      // @ts-ignore
      typeof cancelIdleCallback !== "undefined" ? cancelIdleCallback(id) : clearTimeout(id);

    let killAll: (() => void) | null = null;
    let idleId: any = null;

    const run = async () => {
      const [{ gsap }, { MorphSVGPlugin }] = await Promise.all([
        import("gsap"),
        // MorphSVG is optional and won't break if not available. We check but don't rely on it.
        import("gsap/MotionPathPlugin").catch(() => ({})),
      ]);
      // we will use core gsap only (ScrollTrigger not used intentionally)
      // build a cinematic timeline for the hero
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // lock scroll while the intro plays
      disableScroll();

      // Helper: split an element's text into span chars (returns array of elements)
      const splitToChars = (el: HTMLElement | null) => {
        if (!el) return [] as HTMLElement[];
        const txt = el.textContent || "";
        el.innerHTML = "";
        const arr: HTMLElement[] = [];
        for (const ch of txt.split("")) {
          const s = document.createElement("span");
          s.className = "inline-block char";
          s.style.display = "inline-block";
          s.textContent = ch === " " ? "\u00A0" : ch;
          el.appendChild(s);
          arr.push(s);
        }
        return arr;
      };

      // HERO letter split
      const headingEl = headingRef.current;
      const subtitleEl = subtitleRef.current;
      const ctaEl = ctaRef.current;
      const scrib = scribbleRef.current;

      const headingChars = splitToChars(headingEl);
      rotatorCharsRef.current = headingChars;

      // set initial states
      gsap.set([headingChars, subtitleEl, ctaEl, scrib], { opacity: 0 });
      gsap.set(headingChars, { y: 40, rotationX: 6, transformOrigin: "50% 50% -50px" });
      gsap.set(subtitleEl, { y: 12, opacity: 0 });
      gsap.set(ctaEl, { scale: 0.92, opacity: 0, transformOrigin: "50% 50%" });
      if (scrib) {
        const len = scrib.getTotalLength();
        scrib.style.strokeDasharray = `${len}`;
        scrib.style.strokeDashoffset = `${len}`;
      }

      // cinematic: background glass zoom a touch, then headline per-letter reveal, scribble draw, subtitle pop, CTA pop
      tl.to(heroRef.current, { scale: 0.995, duration: 0.001 }); // ensure will-change
      tl.to(heroRef.current, { scale: 1.01, duration: 1.2, ease: "power2.out" }, 0); // slight breath
      tl.to(headingChars, { y: 0, rotationX: 0, opacity: 1, duration: 0.85, stagger: 0.02 }, 0.12);
      if (scrib) {
        tl.to(scrib, { strokeDashoffset: 0, duration: 1.2, ease: "power2.out" }, 0.36);
      }
      tl.to(subtitleEl, { y: 0, opacity: 1, duration: 0.9 }, 0.6);
      tl.to(ctaEl, { scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }, 0.84);

      // a tiny nudge on hero glass to complete intro
      tl.to(heroRef.current, { scale: 1, duration: 0.7, ease: "power2.out" }, "+=0.15");

      // release scroll when timeline finishes
      tl.add(() => enableScroll());

      // store cleanup
      killAll = () => {
        try {
          tl.kill();
        } catch (e) {}
        gsap.killTweensOf("*");
      };

      // AFTER hero intro — start rotator loop (per-phrase)
      // We'll run a separate rotator timeline cycling through phrases on the same heading element
      const phrases = [
        "AI study tools for students.",
        "Focused learning. Real results.",
        "Study smarter, not longer."
      ];

      // small helper to render phrase to heading element by replacing innerText but keep char spans for animation
      const playRotator = async () => {
        const rotG = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        for (const phrase of phrases) {
          rotG.add(() => {
            // rebuild char spans for the phrase
            if (!headingEl) return;
            headingEl.innerHTML = "";
            const chars: HTMLElement[] = [];
            for (const ch of phrase.split("")) {
              const s = document.createElement("span");
              s.className = "inline-block char rot-char";
              s.textContent = ch === " " ? "\u00A0" : ch;
              s.style.display = "inline-block";
              headingEl.appendChild(s);
              chars.push(s);
            }
            // store for potential debugging
            rotatorCharsRef.current = chars;
            gsap.set(chars, { y: 28, opacity: 0, rotationX: 8 });
          }, 0);

          // animate in
          rotG.to(".rot-char", { y: 0, opacity: 1, rotationX: 0, duration: 0.7, stagger: 0.02, ease: "power3.out" }, ">");

          // hold
          rotG.to({}, { duration: 1.6 });

          // animate out (staggered)
          rotG.to(".rot-char", { y: -18, opacity: 0, duration: 0.45, stagger: 0.01, ease: "power3.in" }, ">");
        }
        // start rotator after hero tl completes
        tl.add(() => rotG.play(), "+=0.05");
      };

      // start rotator after the main timeline completes (we queued above)
      playRotator().catch(() => {});

    }; // end run

    idleId = idle(run);

    return () => {
      cancelIdle(idleId);
      if (killAll) killAll();
      enableScroll();
    };
  }, []);

  // -----------------------
  // IntersectionObserver reveals (zoom + fade) for feature rows & problem cards
  // non-scroll-driven: triggers once when element enters view
  // -----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    let observer: IntersectionObserver | null = null;
    let gsapLocal: any = null;
    let idleId: any = null;

    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== "undefined"
        ? // @ts-ignore
          requestIdleCallback(cb, { timeout: 1200 })
        : (setTimeout(cb, 250) as unknown as number);

    idleId = idle(async () => {
      const { gsap } = await import("gsap");
      gsapLocal = gsap;

      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // animate zoom + fade
            gsap.to(el, { scale: 1, opacity: 1, y: 0, duration: 0.75, ease: "power3.out", overwrite: true });
            observer?.unobserve(el);
          }
        });
      }, { threshold: 0.14 });

      // register elements
      const toReveal = Array.from(document.querySelectorAll<HTMLElement>(".reveal-zoom"));
      toReveal.forEach((el) => {
        gsap.set(el, { scale: 0.98, opacity: 0, y: 18, transformOrigin: "center center" });
        observer?.observe(el);
      });
    });

    return () => {
      if (observer) observer.disconnect();
      if (idleId) {
        // @ts-ignore
        if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(idleId);
        // else clearTimeout won't have the id type match necessarily, but it's fine
        else clearTimeout(idleId);
      }
      if (gsapLocal) try { gsapLocal.killTweensOf("*"); } catch {}
    };
  }, []);

  // -----------------------
  // Tilt helper (kept, slightly optimized)
  // -----------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const canTilt = window.matchMedia ? window.matchMedia("(hover:hover) and (pointer:fine)").matches : true;
    if (!canTilt) return;

    tiltHandlersRef.current = [];
    const els = Array.from(document.querySelectorAll<HTMLElement>(".tilt-card"));

    els.forEach((el) => {
      let rect = el.getBoundingClientRect();
      let tX = 0, tY = 0, tZ = 0;
      let cX = 0, cY = 0, cZ = 0;
      let raf = 0;
      const opts = { maxTilt: 3.2, perspective: 1000, translateZ: 6, ease: 0.12 };

      const onMove = (e: MouseEvent) => {
        rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        tY = ((x - halfW) / halfW) * opts.maxTilt;
        tX = ((halfH - y) / halfH) * opts.maxTilt;
        const ang = Math.atan2(y - halfH, x - halfW) * (180 / Math.PI);
        tZ = (ang / 90) * 1.6;
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
        el.style.transition = "transform 420ms cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = `perspective(${opts.perspective}px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)`;
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // -----------------------
  // Render helpers (ProblemCard, FeatureRow)
  // Add .reveal-zoom class to elements we want to animate via IntersectionObserver
  // -----------------------
  function ProblemCard({ p, i }: { p: { stat: string; text: string }; i: number }) {
    return (
      <div
        key={i}
        onClick={() => toggleFlip(i)}
        className="group relative h-56 glass-tile text-slate-100 rounded-2xl shadow-xl cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_10px_40px_rgba(2,6,23,0.28)] perspective tilt-card reveal-zoom will-change-transform"
        aria-hidden={false}
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
        className={`feature-row flex flex-col md:flex-row items-center gap-10 reveal-zoom ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
      >
        <div className="flex-1 glass-tile rounded-2xl shadow-xl p-6 text-slate-100 tilt-card planner-card will-change-transform">
          <h4 className="text-xl font-bold mb-3">{f.title}</h4>
          <p>{f.desc}</p>
          <div className="mt-4 text-sm text-slate-500">Built around proven learning techniques.</div>
        </div>

        <Link to="/features" className="flex-1 text-slate-300 text-lg md:text-xl leading-relaxed text-center md:text-left">
          <span className="highlight-clip inline-block">
            <span className="hl-inner inline-block px-1 -skew-x-[6deg]">
              { i % 2 === 0
                ? "The all in 1 hub for your study sessions with all the tools one could ask for."
                : "Designed to keep you motivated and productive, no matter how overwhelming your syllabus seems."
              }
            </span>
          </span>
          <div className="mt-4 text-slate-400"></div>
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

      {/* HERO */}
      <section ref={heroRef} className="glass-card px-6 pt-24 pb-16 text-center will-change-transform">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="relative w-full h-[6.75rem] md:h-[9.25rem] flex items-center justify-center">
              <h1
                ref={headingRef}
                className="text-5xl md:text-7xl font-semibold text-white leading-tight text-center flex flex-col justify-center [--gap:0.4rem] md:[--gap:0.6rem]"
                style={{ lineHeight: 1.05 }}
              >
                AI study tools for students.
              </h1>

              {/* scribble underline */}
              <svg className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[380px] md:w-[620px] h-[36px] overflow-visible" viewBox="0 0 700 80" preserveAspectRatio="xMidYMid meet" aria-hidden>
                <path ref={scribbleRef} d="M20 40 C110 70 190 10 300 45 C410 80 500 18 680 40" stroke="rgba(255,255,255,0.12)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" className="scribble-path"/>
              </svg>
            </div>
          </div>

          <p ref={subtitleRef} className="text-lg text-slate-200 mb-10">
            <span className="highlight-clip inline-block">
              <span className="hl-inner inline-block px-1 -skew-x-[6deg]">An all-in-one toolkit: planner, notes, flashcards, quizzes, chatbot, answer reviewer — built around research-backed learning methods.</span>
            </span>
          </p>

          <div ref={ctaRef} className="flex gap-4 justify-center">
            <Link to="/main" className="px-8 py-4 rounded-full bg-white text-slate-900 hover:bg-slate-200 transition-transform duration-400 ease-in-out shadow-xl hover:scale-105 ring-1 ring-white/10">
              Get Started
            </Link>
            <Link to="/about" className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white hover:bg-white/5 transition-transform duration-400 ease-in-out shadow-md hover:scale-105" aria-label="Learn more">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mt-12 md:mt-15 text-center px-6">
        <div className="w-full mx-auto h-[4.8rem] md:h-auto flex items-center justify-center mb-6">
          <h2 className="text-4xl md:text-5xl font-semibold text-white leading-tight flex flex-col justify-center">
            {/* Keep a static type-like line but we used a custom rotator in the hero; keep this one subtle */}
            We hate inefficient tools.
          </h2>
        </div>
        <p className="text-lg text-slate-200 mb-12">Who wouldn’t?</p>
      </section>

      {/* Problems */}
      <section className="max-w-6xl mx-auto px-6 mt-28">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-10 text-center">Why is this a problem?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {problems.map((p, i) => <ProblemCard key={i} p={p} i={i} />)}
        </div>
      </section>

      {/* Mission panel */}
      <section className="max-w-4xl mx-auto mt-24 px-6 text-center">
        <div ref={missionRef} className="glass-card text-slate-100 rounded-3xl shadow-2xl p-10 transform transition-transform duration-300 will-change-transform reveal-zoom" aria-label="Mission panel">
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
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6 text-center">
          <Link to="/features" className="hover:underline">Explore Our Features</Link>
        </h3>
        <div className="text-center mb-8">
          <Link to="/features" className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300">See full features</Link>
        </div>

        <div className="space-y-20">
          {features.map((f, i) => <FeatureRow key={i} f={f} i={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-28 text-center px-6">
        <h3 className="text-3xl md:text-4xl font-semibold text-white mb-6">
          Ready to get started?
          <br />
          We guarantee a change!
        </h3>
        <button onClick={scrollToTop} className="mt-4 px-8 py-4 rounded-full bg-white text-slate-900 shadow-xl hover:scale-105 hover:bg-slate-200 transition-all duration-500 ease-in-out">Back to Top</button>
      </section>

      {/* Closing */}
      <section className="mt-16 text-center px-6">
        <p className="text-lg text-slate-200">Learning was never difficult, it just needed a new perspective. VertexED — (<strong>Vertex ED</strong>) — is here to deliver it.</p>
      </section>

      {/* Contact */}
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
    </>
  );
}
