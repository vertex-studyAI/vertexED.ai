import { Helmet } from "react-helmet-async";
import React, { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { TypeAnimation } from "react-type-animation";

// Polished Features page — explanatory, immersive, scroll-first (no demo inputs)
// This file intentionally removes header/nav and interactive demo controls.
// It focuses on clear, research-aligned explanations for each tool and
// a smooth, scroll-driven reveal for a premium feel.

export default function Features() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const sections = gsap.utils.toArray<HTMLElement>(".feature-section");

    // Entrance animations for the visible elements in each section
    sections.forEach((sec, i) => {
      gsap.fromTo(
        sec.querySelectorAll(".animate-in"),
        { y: 36, opacity: 0, scale: 0.995 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.06,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec,
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none reverse",
            onEnter: () => setActiveSection(i),
            onEnterBack: () => setActiveSection(i),
          },
        }
      );
    });

    // Soft snap scrolling — one section per viewport for immersive focus
    ScrollTrigger.create({
      trigger: containerRef.current as Element,
      start: "top top",
      end: "bottom bottom",
      snap: 1 / Math.max(sections.length - 1, 1),
      ease: "power2.out",
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  // Static explanatory content (no demos or faux outputs)
  const supportedBoards = [
    "IB MYP",
    "IBDP",
    "IGCSE",
    "ICSE",
    "CBSE",
    "AP",
    "A Level",
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 text-white">
      <Helmet>
        <title>Features · VertexED</title>
      </Helmet>

      <main className="pt-8">
        {/* Intro — short, punchy, and premium */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold animate-in">
                  <TypeAnimation
                    sequence={[600, "A toolkit that improves marks and understanding.", 1200, "Deep learning meets exam-ready practice."]}
                    wrapper="span"
                    cursor={true}
                  />
                </h1>

                <p className="mt-4 text-slate-300 animate-in">
                  Each feature below is engineered to be both research-aligned and learner-first — designed to
actually change how you study. Scroll to focus on one tool at a time and read the practical
ways it helps you build mastery, save time, and perform better on exams.
                </p>

                <div className="mt-6 flex gap-4 animate-in">
                  <a href="/login" className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold">Get started</a>
                </div>
              </div>

              <div className="text-slate-300 animate-in">
                <div className="bg-white/5 p-6 rounded-2xl">
                  <h4 className="font-semibold mb-2">Personalisation at the core</h4>
                  <p className="text-sm">
                    VertexED models what you know and how you learn. It uses short, measurable actions —
                    scheduled practice, targeted papers, and adaptive review — so that every minute you
                    study moves you closer to mastery.
                  </p>
                  <div className="mt-4 text-xs text-slate-400">Outcomes: faster improvement, targeted revision, measurable confidence gains.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Calendar */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-4xl mx-auto px-6 w-full">
            <article className="animate-in">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">AI Calendar — schedule optimizer</h2>

              <p className="text-slate-300 leading-relaxed mb-4">
                The AI Calendar does more than store dates. It builds an evidence-based study layout tailored to your life.
                Instead of filling time with undirected hours, VertexED proposes compact, goal-centred sessions that are aligned
                to the type of learning you need: concept-building, procedural practice, or retrieval practice.
              </p>

              <h4 className="mt-4 font-semibold">How it helps</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Balances extracurriculars and coursework so practice is realistic and sustainable.</li>
                <li>Suggests session types (short recall bursts, problem-solving blocks, and mock-test slots) based on upcoming assessments.</li>
                <li>Builds spaced-repetition schedules automatically for topics you struggle with, reducing forgetting and boosting long-term retention.</li>
              </ul>

              <h4 className="mt-4 font-semibold">Why it matters</h4>
              <p className="text-slate-300 leading-relaxed">
                Time spent studying is not the same as time spent learning. Research shows distributed practice and mixed practice
                improve retention and transfer. Our calendar operationalises these findings into weekly plans you can actually follow.
              </p>
            </article>
          </div>
        </section>

        {/* AI Discussion Agent */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-5xl mx-auto px-6 w-full">
            <article className="animate-in">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">AI Discussion Agent — learn beyond the textbook</h2>

              <p className="text-slate-300 leading-relaxed mb-4">
                The Discussion Agent is a guided research partner. It frames complex topics, suggests structured reading paths, and
                helps you develop argumentative or investigative lines of thought. Instead of shallow Q&amp;A, it offers layered perspectives
                and next-step research directions.
              </p>

              <h4 className="mt-4 font-semibold">What it provides</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Annotated reading lists and concise summaries to bridge textbook gaps.</li>
                <li>Argument maps and counter-positions to help you prepare essays, debates or extended projects.</li>
                <li>Research prompts, hypothesis suggestions and starter experiment designs for inquiry-based work.</li>
              </ul>

              <h4 className="mt-4 font-semibold">Why it matters</h4>
              <p className="text-slate-300 leading-relaxed">
                Deep understanding requires structure. The agent turns vague curiosity into a focused learning plan — ideal for enrichment,
                extended essays, club projects, and university-style exploration while still linking back to curriculum needs.
              </p>
            </article>
          </div>
        </section>

        {/* AI Answer Reviewer */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-5xl mx-auto px-6 w-full">
            <article className="animate-in">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">AI Answer Reviewer — curriculum-aware feedback</h2>

              <p className="text-slate-300 leading-relaxed mb-4">
                The Answer Reviewer reads student responses with the rubric in mind. It highlights where marks were gained, where ideas are missing,
                and precisely what to practise next to move up a grade band. Importantly, feedback is actionable and tied to concrete practice items.
              </p>

              <h4 className="mt-4 font-semibold">Key capabilities</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Marks answers against curriculum rubrics and identifies common misconception patterns.</li>
                <li>Produces a short improvement plan: targeted topics, example questions, and study methods to close gaps.</li>
                <li>Tracks progress across attempts so students &amp; teachers can see measurable growth over time.</li>
              </ul>

              <h4 className="mt-4 font-semibold">Why it matters</h4>
              <p className="text-slate-300 leading-relaxed">
                Generic feedback doesn’t move the needle — specific, rubric-aligned feedback does. When students know exactly what to work on and
                see the small wins, exam performance and confidence rise together.
              </p>
            </article>
          </div>
        </section>

        {/* AI Paper Maker */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <article className="animate-in">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">AI Paper Maker — board-aligned practice papers</h2>

              <p className="text-slate-300 leading-relaxed mb-4">
                Generate practice papers that match the tone, phrasing and mark schemes of the board you study under. Papers are designed to reproduce
                the cognitive load of real exams: clear command words, progressive difficulty, and authentic time demands.
              </p>

              <h4 className="mt-4 font-semibold">Supported boards (representative)</h4>
              <div className="overflow-x-auto py-3 animate-in">
                <div className="inline-flex gap-3">
                  {supportedBoards.map((b) => (
                    <div key={b} className="px-4 py-2 rounded-full bg-white/5 text-slate-300 whitespace-nowrap">{b}</div>
                  ))}
                </div>
              </div>

              <h4 className="mt-4 font-semibold">How it helps</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Produces papers tailored to exam styles — practice with the right language and timing.</li>
                <li>Includes model mark schemes and suggested marking tips so you learn to answer with examiner expectations in mind.</li>
                <li>Mixes question types deliberately: short recall, structured response and extended writing — mirroring real exams.</li>
              </ul>

              <h4 className="mt-4 font-semibold">Why it matters</h4>
              <p className="text-slate-300 leading-relaxed">
                Familiarity breeds performance. Regular exposure to authentic papers reduces test anxiety and builds fluent exam techniques —
                which directly raises performance on test day.
              </p>
            </article>
          </div>
        </section>

        {/* Study Zone */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <article className="animate-in">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Study Zone — focused workspace for deep sessions</h2>

              <p className="text-slate-300 leading-relaxed mb-4">
                The Study Zone aggregates the tools you need when you’re in flow: activity logs, a graphing calculator, concept helpers, and
                quick assistants that point you to worked examples. It’s a single place to start a focused session and track what you actually did.
              </p>

              <h4 className="mt-4 font-semibold">What you’ll find</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Activity log and session analytics so you can measure what you did and how productive it was.</li>
                <li>Lightweight graphing calculator and math helpers — useful for quick checks while solving problems.</li>
                <li>Context-aware assistants that suggest worked examples and short walkthroughs related to the topic you’re on.</li>
              </ul>

              <h4 className="mt-4 font-semibold">Why it matters</h4>
              <p className="text-slate-300 leading-relaxed">
                Deep work requires removal of friction. Having essential tools in one place keeps momentum high and reduces time lost switching apps.
                Over time, session analytics show which study patterns correlate with real improvement so you can replicate what works.
              </p>
            </article>
          </div>
        </section>

        {/* Note Taker */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <article className="animate-in">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Note Taker — record, structure and practise</h2>

              <p className="text-slate-300 leading-relaxed mb-4">
                Notes are the bridge from exposure to mastery. The Note Taker is built to keep that bridge strong: autosave, snapshots, export to
                Word/PDF, and AI-assisted summarisation that converts lecture text into flashcards and short quizzes for active recall practice.
              </p>

              <h4 className="mt-4 font-semibold">Capabilities and flows</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Lecture capture and transcription with timestamped snapshots so you can jump back to the exact moment and context.</li>
                <li>AI summarisation that extracts key ideas and creates concise flashcards and practice questions to support retrieval practice.</li>
                <li>Export options for sharing with teachers or archiving — Word, PDF and structured snapshots that preserve hierarchy and emphasis.</li>
              </ul>

              <h4 className="mt-4 font-semibold">Why it matters</h4>
              <p className="text-slate-300 leading-relaxed">
                Students who convert notes into active practice materials (flashcards, self-tests) retain far more than those who only re-read notes.
                The Note Taker intentionally closes the loop: capture → condense → practise.
              </p>
            </article>
          </div>
        </section>

        {/* Final messaging + CTA */}
        <section className="min-h-[60vh] flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl md:text-4xl font-semibold mb-4">Designed to improve scores and understanding</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              VertexED intentionally balances exam preparation with conceptual learning. Every feature is linked to measurable outcomes:
              improved exam fluency, stronger long-term retention, and clearer insight into what to practise next.
            </p>

            <a href="/login" className="px-8 py-4 rounded-full bg-white text-slate-900 font-semibold">Get started</a>

            <div className="mt-8 text-xs text-slate-400">Personalisation analyses strengths and weaknesses and proposes concrete next steps — not generic advice.</div>
          </div>
        </section>

        <footer className="py-12 text-center text-slate-400">© {new Date().getFullYear()} VertexED — built for curious learners.</footer>
      </main>
    </div>
  );
}
