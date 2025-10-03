import { Helmet } from "react-helmet-async";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TypeAnimation } from "react-type-animation";

// Features page — immersive, scroll-driven, one-feature-per-view design
// Keep styling consistent with Tailwind usage in the rest of the app.

export default function Features() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const sections = gsap.utils.toArray<HTMLElement>(".feature-section");

    // Basic entrance animation and ScrollTrigger snap to sections (1 section per viewport)
    sections.forEach((sec, i) => {
      gsap.fromTo(
        sec.querySelectorAll(".animate-in"),
        { y: 40, opacity: 0, scale: 0.995 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
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

    // Snap scrolling to each section for a full-bleed effect
    ScrollTrigger.create({
      trigger: containerRef.current as Element,
      start: "top top",
      end: "bottom bottom",
      snap: 1 / (sections.length - 1),
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  // ----- Mocked interactive states for each feature -----

  // Calendar (AI-Optimizer)
  const [calendarInput, setCalendarInput] = useState("Math exam on May 12; Football practice Tue/Thu; Science project due May 20");
  const [calendarOutput, setCalendarOutput] = useState<string | null>(null);
  const optimizeCalendar = () => {
    // small faux-optimizer to show interactivity
    setCalendarOutput(
      "Optimized schedule: Short focused sessions (45m) with 10m breaks; prioritise past-paper slots on Mon/Wed; reserve weekend for deep projects."
    );
    // subtle animation cue
    gsap.fromTo(
      ".calendar-result",
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    );
  };

  // Discussion Agent
  const [discussionPrompt, setDiscussionPrompt] = useState("Explain the role of dark matter in galaxy formation.");
  const [discussionOutput, setDiscussionOutput] = useState<string | null>(null);
  const generateDiscussion = () => {
    setDiscussionOutput(
      "Deep-dive: Dark matter acts as a gravitational scaffold — simulations show it drives early structure formation. For research: compare cold vs warm dark matter models; examine rotation curves; look at weak lensing surveys for constraints. Suggested next readings provided." 
    );
    gsap.fromTo(
      ".discussion-result",
      { x: 12, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
    );
  };

  // Answer Reviewer
  const [answerText, setAnswerText] = useState("Your answer goes here...");
  const [reviewOutput, setReviewOutput] = useState<string | null>(null);
  const reviewAnswer = () => {
    // basic mocked feedback
    setReviewOutput(
      "Score: 6/10. Strengths: clear structure, good command of concepts. Improvements: expand the explanation of methodology, include a real-world example, and fix minor calculation errors in paragraph 3. Practice targeted past-paper questions on similar topics."
    );
    gsap.fromTo(
      ".review-result",
      { scale: 0.98, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
    );
  };

  // Paper Maker — boards carousel
  const boards = ["IB MYP", "IBDP", "IGCSE", "ICSE", "CBSE", "AP", "A Level"];
  const [selectedBoard, setSelectedBoard] = useState(boards[2]);
  const [paperConfig, setPaperConfig] = useState({ subject: "Physics", difficulty: "Higher" });
  const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);
  const generatePaper = () => {
    setGeneratedPaper(
      `Generated 10-question paper for ${selectedBoard} — ${paperConfig.subject} (${paperConfig.difficulty})\n1) Explain ... (FRQ)\n2) 4-mark calculation ... (Show workings)\n...` 
    );
    gsap.fromTo(
      ".paper-preview",
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }
    );
  };

  // Study Zone
  const [activityLog, setActivityLog] = useState<Array<{ t: string; activity: string }>>([
    { t: "2025-04-10 18:00", activity: "Physics past-paper (45m)" },
    { t: "2025-04-11 09:00", activity: "Math: calculus practice (30m)" },
  ]);
  const addActivity = (a: string) => {
    setActivityLog((prev) => [{ t: new Date().toLocaleString(), activity: a }, ...prev].slice(0, 20));
    gsap.fromTo(
      ".activity-list",
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45 }
    );
  };

  // Note taker
  const [notes, setNotes] = useState("# Lecture notes\n\nStart typing...\n");
  const [autosaveStatus, setAutosaveStatus] = useState<string | null>(null);
  useEffect(() => {
    const id = setTimeout(() => {
      setAutosaveStatus(new Date().toLocaleTimeString() + " — saved");
      gsap.fromTo(
        ".autosave",
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }, 800);
    return () => clearTimeout(id);
  }, [notes]);

  const exportNotes = (type: "pdf" | "doc") => {
    // quick mocked export (client-side blob)
    const blob = new Blob([notes], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `notes_export.${type === "pdf" ? "pdf" : "doc"}`;
    a.click();
    URL.revokeObjectURL(url);
    setAutosaveStatus("Exported " + a.download);
  };

  // Flashcards & Quiz (very small demo)
  const [flashcards] = useState([
    { q: "What is active recall?", a: "A technique where you actively try to retrieve information from memory." },
    { q: "What is spaced repetition?", a: "A scheduling technique to review material at increasing intervals." },
  ]);
  const [cardIndex, setCardIndex] = useState(0);

  // helper small UI components inside the file for simplicity
  const SectionHeader: React.FC<{ title: string; accent?: string }> = ({ title, accent = "" }) => (
    <div className="mb-6 text-center">
      <h2 className="text-3xl md:text-4xl font-semibold text-white">{title}</h2>
      {accent && <p className="mt-2 text-slate-300">{accent}</p>}
    </div>
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-900 text-white">
      <Helmet>
        <title>Features · VertexED</title>
      </Helmet>

      <header className="sticky top-4 z-50 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">VertexED</div>
          <nav className="flex gap-4">
            <Link to="/" className="text-slate-300 hover:text-white">Home</Link>
            <Link to="/features" className="text-white font-semibold">Features</Link>
            <Link to="/login" className="px-4 py-2 rounded-full bg-white text-slate-900 font-medium">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="pt-8">
        {/* Hero / Intro */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <TypeAnimation
                  sequence={[800, "Explore features that change how you learn.", 1200, "Each tool is personalised and research backed."]}
                  wrapper="h1"
                  cursor={true}
                  className="text-4xl md:text-5xl font-bold"
                />
                <p className="mt-4 text-slate-300">Scroll to explore — one feature per view. Interactive previews below help you get a feel for how VertexED assists learning beyond the paper.</p>
                <div className="mt-6 flex gap-4">
                  <Link to="/login" className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold">Login to try</Link>
                  <Link to="/" className="px-6 py-3 rounded-full border border-white/20">Back</Link>
                </div>
              </div>
              <div className="text-slate-300">
                <div className="bg-white/5 p-6 rounded-2xl">
                  <h4 className="font-semibold mb-2">Personalization</h4>
                  <p className="text-sm">Vertex assesses strengths and weaknesses, identifies learning patterns and proposes personalised solutions — from scheduling to practice paper selection.</p>
                  <div className="mt-4 text-xs text-slate-400">Examples: Strength-based scheduling, targeted paper practice, adaptive review lists.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calendar */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-5xl mx-auto px-6 w-full">
            <SectionHeader title="AI Calendar — schedule optimizer" accent="Optimise study time around life: clubs, sport, school and family." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg animate-in">
                <label className="block text-sm font-medium mb-2">Tell us your commitments</label>
                <textarea value={calendarInput} onChange={(e) => setCalendarInput(e.target.value)} className="w-full p-3 rounded-md border" rows={6} />
                <div className="mt-4 flex gap-3">
                  <button onClick={optimizeCalendar} className="px-4 py-2 bg-slate-900 text-white rounded-md">Optimize</button>
                  <button onClick={() => setCalendarInput("")} className="px-4 py-2 border rounded-md">Clear</button>
                </div>
              </div>

              <div className="animate-in">
                <div className="bg-white/5 p-6 rounded-2xl min-h-[220px]">
                  <h4 className="font-semibold mb-2">Smart schedule preview</h4>
                  {!calendarOutput ? (
                    <p className="text-slate-400">Optimized suggestions will appear here — tailored to your inputs and priorities.</p>
                  ) : (
                    <div className="calendar-result text-slate-200">{calendarOutput}</div>
                  )}
                  <div className="mt-6 text-xs text-slate-400">Powered by personalised constraints & priorities. You keep full control — accept edits or tweak preferences.</div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-sm text-slate-400">Tip: Vertex's calendar also recommends practice type (recall vs. problem-solving) depending on your upcoming assessments.</div>
          </div>
        </section>

        {/* Discussion Agent */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <SectionHeader title="AI Discussion Agent" accent="Go beyond textbooks — research, argumentation and creative exploration." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg animate-in">
                <label className="block text-sm font-medium mb-2">Research / discussion prompt</label>
                <textarea value={discussionPrompt} onChange={(e) => setDiscussionPrompt(e.target.value)} className="w-full p-3 rounded-md border" rows={6} />
                <div className="mt-4 flex gap-3">
                  <button onClick={generateDiscussion} className="px-4 py-2 bg-slate-900 text-white rounded-md">Explore</button>
                  <button onClick={() => setDiscussionPrompt("")} className="px-4 py-2 border rounded-md">Clear</button>
                </div>
              </div>

              <div className="animate-in">
                <div className="bg-white/5 p-6 rounded-2xl min-h-[220px]">
                  <h4 className="font-semibold mb-2">Deep research preview</h4>
                  {!discussionOutput ? (
                    <p className="text-slate-400">Ask the agent to generate argumentative outlines, reading lists, or experimental ideas.</p>
                  ) : (
                    <div className="discussion-result text-slate-200">{discussionOutput}</div>
                  )}
                  <div className="mt-6 text-xs text-slate-400">Suggested uses: Extended essays, club research sessions, science fair planning, and enrichment reading paths.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Answer Reviewer */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <SectionHeader title="AI Answer Reviewer" accent="Curriculum-aware grading and targeted feedback." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg animate-in">
                <label className="block text-sm font-medium mb-2">Paste your answer / upload (mock)</label>
                <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)} className="w-full p-3 rounded-md border" rows={8} />
                <div className="mt-4 flex gap-3">
                  <button onClick={reviewAnswer} className="px-4 py-2 bg-slate-900 text-white rounded-md">Review</button>
                  <button onClick={() => { setAnswerText(""); setReviewOutput(null); }} className="px-4 py-2 border rounded-md">Clear</button>
                </div>
              </div>

              <div className="animate-in">
                <div className="bg-white/5 p-6 rounded-2xl min-h-[280px]">
                  <h4 className="font-semibold mb-2">Feedback preview</h4>
                  {!reviewOutput ? (
                    <p className="text-slate-400">Upload or paste answers to receive a curriculum-aligned score and improvement plan.</p>
                  ) : (
                    <div className="review-result text-slate-200 whitespace-pre-wrap">{reviewOutput}</div>
                  )}
                  <div className="mt-6 text-xs text-slate-400">Reviewer highlights misconceptions, marks against rubrics, and suggests targeted practice items.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Paper Maker */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <SectionHeader title="AI Paper Maker" accent="Generate board-aligned practice papers in seconds." />

            <div className="mb-6 animate-in">
              <div className="overflow-x-auto py-2">
                <div className="inline-flex gap-4 items-center">
                  {boards.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSelectedBoard(b)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedBoard === b ? "bg-white text-slate-900" : "bg-white/5 text-slate-300"}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-xs text-slate-400">Supported boards are shown above — scroll or click to choose. The paper maker adapts question styles and mark schemes accordingly.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg animate-in">
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input value={paperConfig.subject} onChange={(e) => setPaperConfig({ ...paperConfig, subject: e.target.value })} className="w-full p-3 rounded-md border mb-4" />
                <label className="block text-sm font-medium mb-2">Level</label>
                <select value={paperConfig.difficulty} onChange={(e) => setPaperConfig({ ...paperConfig, difficulty: e.target.value })} className="w-full p-3 rounded-md border">
                  <option>Standard</option>
                  <option>Higher</option>
                  <option>Foundation</option>
                </select>
                <div className="mt-4 flex gap-3">
                  <button onClick={generatePaper} className="px-4 py-2 bg-slate-900 text-white rounded-md">Generate</button>
                  <button onClick={() => setGeneratedPaper(null)} className="px-4 py-2 border rounded-md">Clear</button>
                </div>
              </div>

              <div className="animate-in">
                <div className="bg-white/5 p-6 rounded-2xl min-h-[240px]">
                  <h4 className="font-semibold mb-2">Paper preview</h4>
                  {!generatedPaper ? (
                    <p className="text-slate-400">Choose board & subject and generate a quick paper in seconds.</p>
                  ) : (
                    <pre className="paper-preview text-slate-200 whitespace-pre-wrap">{generatedPaper}</pre>
                  )}
                  <div className="mt-6 text-xs text-slate-400">Export or practice instantly — questions include mark schemes and exam-style wording.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Study Zone */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <SectionHeader title="Study Zone" accent="Everything you need during deep study sessions: logs, tools and assistants." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg animate-in">
                <h4 className="font-semibold mb-2">Activity log</h4>
                <div className="mb-3">
                  <input placeholder="Describe activity (e.g. 'Calculus practice 30m')" id="act" className="w-full p-3 rounded-md border" />
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => { const el = document.getElementById("act") as HTMLInputElement; if (el && el.value.trim()) { addActivity(el.value.trim()); el.value = ""; } }} className="px-3 py-2 rounded-md bg-slate-900 text-white">Add</button>
                    <button onClick={() => setActivityLog([])} className="px-3 py-2 rounded-md border">Clear</button>
                  </div>
                </div>

                <div className="activity-list space-y-2 max-h-48 overflow-y-auto text-sm text-slate-700">
                  {activityLog.length === 0 ? (
                    <div className="text-slate-400">No activities yet — start tracking to build better habits.</div>
                  ) : (
                    activityLog.map((a, idx) => (
                      <div key={idx} className="p-2 rounded-md bg-white/80 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-900">{a.activity}</div>
                          <div className="text-xs text-slate-600">{a.t}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="animate-in">
                <div className="bg-white/5 p-6 rounded-2xl min-h-[320px]">
                  <h4 className="font-semibold mb-2">Graphing calculator & assistants</h4>
                  <div className="mb-3 text-slate-400">A lightweight graphing calculator, unit converter and quick helpers are available in the zone. (Demo placeholder)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-md bg-white/10">Graphing Calculator — enter simple functions to preview graphs.</div>
                    <div className="p-3 rounded-md bg-white/10">Concept helper — quick steps for common techniques (derivatives, integrals)</div>
                  </div>
                  <div className="mt-4 text-xs text-slate-400">Integrated doubt assistant helps when you get stuck — ask targeted follow-up questions or request worked examples.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Note taker */}
        <section className="feature-section min-h-screen flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-6xl mx-auto px-6 w-full">
            <SectionHeader title="Note Taker" accent="Record, autosave, export, and convert notes into flashcards or quizzes." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg animate-in">
                <label className="block text-sm font-medium mb-2">Notes (autosave)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-3 rounded-md border" rows={12} />
                <div className="mt-3 flex gap-3">
                  <button onClick={() => exportNotes("pdf")} className="px-3 py-2 bg-slate-900 text-white rounded-md">Export PDF</button>
                  <button onClick={() => exportNotes("doc")} className="px-3 py-2 border rounded-md">Export DOC</button>
                  <button onClick={() => { setNotes(""); setAutosaveStatus(null); }} className="px-3 py-2 border rounded-md">Clear</button>
                </div>
                <div className="mt-2 text-xs text-slate-500 autosave">{autosaveStatus || "Unsaved"}</div>
              </div>

              <div className="animate-in">
                <div className="bg-white/5 p-6 rounded-2xl min-h-[320px]">
                  <h4 className="font-semibold mb-2">From notes to practice</h4>
                  <div className="mb-3 text-slate-400">Convert any paragraph into flashcards or a short quiz to practise active recall.</div>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 rounded-md bg-white/10">Flashcards (auto-generated):</div>
                    <div className="p-3 rounded-md bg-white/10">Quiz generator: Choose MCQ or FRQ — mix of recall & application.</div>
                    <div className="p-3 rounded-md bg-white/10">Lecture recorder (demo): Record audio + auto-transcribe into notes with snapshots.</div>
                  </div>
                  <div className="mt-4 text-xs text-slate-400">Exports include Word/PDF with snapshots that preserve your study structure.</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm text-slate-300 mb-2">Example flashcard</h4>
              <div className="p-4 bg-white/5 rounded-md inline-block">
                <div className="font-semibold">Q: {flashcards[cardIndex].q}</div>
                <div className="mt-2 text-slate-400">A: {flashcards[cardIndex].a}</div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setCardIndex((c) => (c + 1) % flashcards.length)} className="px-3 py-1 rounded-md border">Next</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="min-h-[60vh] flex items-center" style={{ scrollSnapAlign: "start" }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="text-3xl md:text-4xl font-semibold mb-4">Ready to make studying feel different?</h3>
            <p className="text-slate-300 mb-6">Sign up or log in to try personalized features, get adaptive schedules and practice that targets both your exam performance and deep understanding.</p>
            <div className="flex gap-4 justify-center">
              <Link to="/login" className="px-8 py-4 rounded-full bg-white text-slate-900 font-semibold">Get Started</Link>
              <Link to="/" className="px-8 py-4 rounded-full border border-white/20">Back to Home</Link>
            </div>

            <div className="mt-8 text-xs text-slate-400">VertexED improves exam performance and deep understanding — both matter. Personalization analyses your strengths and weaknesses to propose concrete next steps.</div>
          </div>
        </section>

        <footer className="py-12 text-center text-slate-400">© {new Date().getFullYear()} VertexED — built for curious learners.</footer>
      </main>
    </div>
  );
}
