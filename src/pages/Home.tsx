import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";
import { BookOpen, Calendar, Zap, CheckCircle, Activity } from "lucide-react";

const RESEARCH = [
  {
    title: "Students struggle to find reliable learning resources",
    value: "39%",
    src: "https://leadershipblog.act.org/2024/09/students-college-information-sources.html",
    note: "ACT Research: 39% of students reported trouble finding the information they needed when researching postsecondary options.",
  },
  {
    title: "Student engagement & relevance is low",
    value: "~66%",
    src: "https://www.eschoolnews.com/featured/2022/08/29/students-desperately-need-to-see-relevance-in-their-learning/",
    note: "Reporting of large disengagement rates — students frequently find learning irrelevant or not engaging.",
  },
  {
    title: "Academic procrastination is widespread",
    value: "~60%",
    src: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11353834/",
    note: "Recent literature reviews estimate high prevalence — many students show substantial procrastination levels.",
  },
  {
    title: "Students changed study behaviours after the pandemic",
    value: "81%",
    src: "https://www.mheducation.com/about-us/news-insights/blog/mcgraw-hill-study-trends-report.html",
    note: "McGraw Hill: a large share of students reported changing their studying habits since the pandemic, turning to new digital tools and resources.",
  },
  {
    title: "Strategic studying improves exam performance",
    value: "Study-backed",
    src: "https://news.stanford.edu/stories/2017/05/studying-strategically-equals-improved-exam-scores",
    note: "Stanford research: applying strategic study methods leads to measurable score improvements (evidence for focusing on strategy over raw hours).",
  },
];

export default function HomeInteractive() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      // Fade-up for general elements
      gsap.utils.toArray<HTMLElement>(".fade-up").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%" },
          }
        );
      });

      // Feature rows slide-in
      gsap.utils.toArray<HTMLElement>(".feature-row").forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: i % 2 === 0 ? -140 : 140, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%" },
          }
        );
      });

      // Hero subtle entrance
      gsap.fromTo(
        ".hero-animate",
        { y: 28, opacity: 0, scale: 0.995 },
        { y: 0, opacity: 1, scale: 1, duration: 1.1, stagger: 0.18, ease: "power3.out" }
      );
    }
  }, []);

  const problems = [
    { stat: "39%", text: "Struggle to find relevant learning resources (information friction)", sourceIndex: 0 },
    { stat: "~66%", text: "Report low engagement or questionable relevance in classroom content", sourceIndex: 1 },
    { stat: "~60%", text: "Experience significant academic procrastination or study delay", sourceIndex: 2 },
    { stat: "81%", text: "Changed study habits post-pandemic — more digital tools, scattered workflows", sourceIndex: 3 },
    { stat: "Study-backed", text: "Strategic studying improves measurable exam performance", sourceIndex: 4 },
    { stat: "Many", text: "Rely on multiple apps & workflows which creates fragmentation", sourceIndex: 3 },
  ];

  const goals = [
    "Improve the way you approach learning beyond the classroom",
    "Improve your performance on papers",
    "Improve your understanding of topics beyond the surface across subjects",
  ];

  const [flipped, setFlipped] = useState(Array(problems.length).fill(false));
  const toggleFlip = (i: number) =>
    setFlipped((prev) => {
      const copy = [...prev];
      copy[i] = !copy[i];
      return copy;
    });

  return (
    <>
      <Helmet>
        <title>AI Study Tools for Students | VertexED</title>
      </Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 py-28 bg-gradient-to-b from-slate-900 to-slate-800 text-center rounded-3xl shadow-xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="hero-animate text-5xl md:text-7xl font-normal text-white leading-tight mb-6 tracking-tight">
            <TypeAnimation
              sequence={[
                "Tools that actually lift learning",
                1800,
                "Plan smarter, revise deeper",
                1800,
                "Practice with purpose",
                1800,
              ]}
              speed={45}
              wrapper="span"
              repeat={Infinity}
            />
          </h1>

          <p className="hero-animate text-lg text-slate-200 mb-10 max-w-3xl mx-auto">
            We help students focus on what matters: evidence-backed workflows, precise feedback and realistic practice — not another noisy app stack.
          </p>

          {/* intentionally minimal — main CTA will appear later near features */}

          <div className="mt-8 flex justify-center gap-3">
            <Link to="/features" className="px-6 py-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300">Explore Features</Link>
          </div>
        </div>
      </section>

      {/* Story / Problem spotlight */}
      <section className="mt-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h2 className="text-3xl md:text-4xl font-semibold text-white fade-up">Why existing study workflows fail students</h2>
            <p className="mt-4 text-slate-300 fade-up">
              Most students don't need more content — they need structure, targeted practice, and feedback that maps to the exam. The landscape is noisy: scattered notes, random flashcards, unclear priorities. That leads to wasted time, poor retention, and anxiety.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {problems.map((p, i) => (
                <div
                  key={i}
                  onClick={() => toggleFlip(i)}
                  className="group perspective cursor-pointer"
                >
                  <div className="relative h-44 bg-white text-slate-900 rounded-2xl shadow-xl transition-transform duration-500 hover:scale-105">
                    <div className={`absolute inset-0 transition-transform duration-700 transform ${flipped[i] ? "rotate-y-180" : ""}`} style={{ transformStyle: 'preserve-3d' }}>
                      {/* Front */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${flipped[i] ? 'opacity-0' : 'opacity-100'} transition-opacity p-6`}>
                        <div className="text-3xl font-bold">{p.stat}</div>
                        <div className="text-sm text-slate-500">Tap to learn more</div>
                      </div>

                      {/* Back */}
                      <div className={`absolute inset-0 p-4 bg-slate-50 rounded-2xl text-slate-800 ${flipped[i] ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                        <div className="text-sm leading-relaxed">{p.text}</div>
                        <div className="text-xs mt-3 text-slate-500">Source: <a href={RESEARCH[p.sourceIndex].src} target="_blank" rel="noreferrer" className="underline">{RESEARCH[p.sourceIndex].title}</a></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="hidden lg:block sticky top-24">
            <div className="bg-white/90 text-slate-900 p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-slate-100"><BookOpen className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs text-slate-500">Research-backed</div>
                  <div className="text-lg font-semibold">Selected findings</div>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                {RESEARCH.map((r, i) => (
                  <div key={i} className="border rounded p-3 bg-white">
                    <div className="font-medium">{r.value} — {r.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{r.note}</div>
                    <div className="mt-2 text-xs"><a href={r.src} target="_blank" rel="noreferrer" className="underline">Read source</a></div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Mission & Goals */}
      <section className="mt-20 px-6 fade-up">
        <div className="max-w-4xl mx-auto bg-white text-slate-800 rounded-3xl shadow-2xl p-10">
          <h3 className="text-2xl font-semibold">Our mission — three clear goals</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {goals.map((g, i) => (
              <div key={i} className="p-4 rounded-2xl border bg-slate-50 text-center">
                <div className="text-xl font-semibold mb-2">{g}</div>
                <div className="text-sm text-slate-600">We design workflows and tools that transform each goal into everyday study actions (scheduling, retrieval practice, targeted feedback).</div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm text-slate-700">
            <p>
              Beyond these three outcomes, we want students to grow a lasting passion for learning — to apply ideas, build intuition, and develop transferable skills that matter long after exams.
            </p>
          </div>
        </div>
      </section>

      {/* How we stand out */}
      <section className="mt-20 px-6 fade-up">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-semibold">How we tackle the bigger picture</h3>
            <p className="mt-3 text-slate-300">We aren’t another single-function tool. VertexED brings together three pillars that are rarely combined: personalization, curriculum-grounded feedback, and compact workflows that reduce friction. The result: faster learning loops and clearer progress.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white text-slate-800 border">
                <div className="flex items-center gap-3"><div className="p-2 rounded bg-slate-100"><Zap className="w-5 h-5" /></div><div className="font-medium">Personalized</div></div>
                <div className="text-xs mt-2 text-slate-600">Learner models adapt to your pace, strengths, and exam targets.</div>
              </div>

              <div className="p-4 rounded-2xl bg-white text-slate-800 border">
                <div className="flex items-center gap-3"><div className="p-2 rounded bg-slate-100"><CheckCircle className="w-5 h-5" /></div><div className="font-medium">Curriculum-aware</div></div>
                <div className="text-xs mt-2 text-slate-600">Marking rubrics, past-paper distributions and exam phrasing are baked into feedback and paper creation.</div>
              </div>

              <div className="p-4 rounded-2xl bg-white text-slate-800 border">
                <div className="flex items-center gap-3"><div className="p-2 rounded bg-slate-100"><Activity className="w-5 h-5" /></div><div className="font-medium">To-the-point</div></div>
                <div className="text-xs mt-2 text-slate-600">Minimal friction: convert notes → flashcards → quiz in a click; get targeted review that tells you exactly what to fix.</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-300">
              <strong>Holistic approach:</strong> we pair scheduling, active recall, and high-quality feedback so students don’t just memorize — they understand and apply.
            </div>

          </div>

          <aside className="hidden md:block sticky top-24">
            <div className="bg-white/90 p-6 rounded-2xl shadow-lg text-slate-900">
              <div className="text-sm font-semibold">Impact</div>
              <div className="mt-2 text-xs text-slate-600">Strategic study beats raw hours: small, science-backed changes can raise average grades and reduce wasted time.</div>
            </div>
          </aside>
        </div>
      </section>

      {/* Features preview (keeps layout but keeps only Explore features at bottom) */}
      <section className="mt-20 px-6 fade-up">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-white text-center mb-8">Explore Our Features</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="font-semibold text-lg">Study Zone</div>
              <div className="text-sm text-slate-600 mt-2">All-in-one toolbox: activity logs, mini-calculators, graphing placeholders and quick flashcards.</div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="font-semibold text-lg">Smart Notes & Audio</div>
              <div className="text-sm text-slate-600 mt-2">Transcription, summarisation and 1-click flashcard creation for active recall.</div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="font-semibold text-lg">Answer Reviewer & Paper Maker</div>
              <div className="text-sm text-slate-600 mt-2">Curriculum-aware feedback and realistic mock exams to practice under real conditions.</div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            {/* The only CTA near the bottom — "Explore Features" kept per request */}
            <Link to="/features" className="px-10 py-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 transition-all duration-300">Explore Features</Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mt-20 px-6 text-center fade-up">
        <div className="max-w-4xl mx-auto bg-white/95 rounded-3xl p-10 shadow-xl">
          <h3 className="text-2xl font-semibold">A more focused, evidence-based way to learn</h3>
          <p className="mt-3 text-slate-700">VertexED combines scheduling, retrieval practice, and exam-style feedback in one workspace — so students spend less time deciding what to do, and more time doing the right thing.</p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/signup" className="px-6 py-3 rounded bg-slate-900 text-white">Get started — free</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-6 py-3 rounded border">Back to top</button>
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-400 mt-10">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
    </>
  );
}
