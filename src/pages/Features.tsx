import { Helmet } from "react-helmet-async";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import { TypeAnimation } from "react-type-animation";

export default function Features() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cleanup: () => void = () => {};
    const idle = (cb: () => void) =>
      // @ts-ignore
      typeof requestIdleCallback !== 'undefined' ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 400);
    const cancel = (id: any) =>
      // @ts-ignore
      typeof cancelIdleCallback !== 'undefined' ? cancelIdleCallback(id) : clearTimeout(id);

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      gsap.registerPlugin(ScrollTrigger);

      // Fade-up animations (same style as Home)
      const elements = gsap.utils.toArray<HTMLElement>(".fade-up");
      elements.forEach((el) => {
        gsap.fromTo(
          el as any,
          { y: 60, opacity: 0, scale: 0.995 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.3,
            ease: "power4.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
            stagger: 0.04,
          }
        );
      });

      // Feature row slide-in (left/right)
      const featureRows = gsap.utils.toArray<HTMLElement>(".feature-row");
      featureRows.forEach((row, i) => {
        gsap.fromTo(
          row as any,
          { x: i % 2 === 0 ? -80 : 80, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power4.out",
            scrollTrigger: {
              trigger: row as any,
              start: "top 85%",
            },
          }
        );
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    };

    const id = idle(run);
    return () => { cancel(id); cleanup(); };
  }, []);

  const supportedBoards = [
    "IB MYP",
    "IBDP",
    "IGCSE",
    "ICSE",
    "CBSE",
    "AP",
    "A Level",
  ];

  // Lift persona state so other components can react to it
  const [persona, setPersona] = useState("student");

  // Small reusable interactive components (no live data or external calls)
  function ExpandableCard({ title, children, compact = false }: { title: string; children: React.ReactNode; compact?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
      <div
        className={`rounded-2xl p-4 ${compact ? "p-3" : "p-4"} bg-white/4 border border-white/6 shadow-sm`}
      >
        <button
          onClick={() => setOpen((s) => !s)}
          className="w-full text-left flex items-center justify-between gap-4"
          aria-expanded={open}
        >
          <div>
            <div className="font-semibold text-white">{title}</div>
            <div className="text-xs text-slate-300 mt-1">{open ? "Tap to collapse" : "Tap to expand for details"}</div>
          </div>
          <div className={`text-slate-300 text-sm transition-transform ${open ? "rotate-180" : ""}`}>
            ▼
          </div>
        </button>

        <div
          className={`mt-3 text-slate-300 text-sm transition-[max-height,opacity] overflow-hidden ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {children}
        </div>
      </div>
    );
  }

  function FeatureCard({ heading, blurb, bullets = [], right }: { heading: React.ReactNode; blurb: React.ReactNode; bullets?: React.ReactNode[]; right?: React.ReactNode }) {
    const [showMore, setShowMore] = useState(false);
    return (
      <div className="rounded-2xl bg-white/4 p-6 border border-white/6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{heading}</h3>
            <p className="text-slate-300 mt-2 text-sm">{blurb}</p>
          </div>

          {right}
        </div>

        <ul className="list-disc ml-5 text-slate-300 text-sm">
          {bullets.slice(0, showMore ? bullets.length : 3).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        {bullets.length > 3 && (
          <button
            onClick={() => setShowMore((s) => !s)}
            className="self-start text-xs mt-1 text-white/80 hover:underline"
          >
            {showMore ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  }

  // Persona toggle now controlled by parent so other parts of the UI can change subtext
  function PersonaToggle({ persona, setPersona }: { persona: string; setPersona: (p: string) => void }) {
    return (
      <div className="mt-6 inline-flex items-center gap-2 bg-white/3 p-1 rounded-full">
        <button
          onClick={() => setPersona("student")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            persona === "student" ? "bg-white text-slate-900" : "text-white/80"
          }`}
        >
          Student
        </button>
        <button
          onClick={() => setPersona("teacher")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            persona === "teacher" ? "bg-white text-slate-900" : "text-white/80"
          }`}
        >
          Teacher
        </button>

        <div className="ml-4 text-xs text-slate-300">Persona: <span className="font-medium text-white">{persona}</span></div>
      </div>
    );
  }

  // Interactive topic card used in Note Taker — cycles between topics
  function InteractiveTopicCard({ topics, persona }: { topics: { title: string; excerpt: string; studentHint: string; teacherHint: string; flashcard: string }[]; persona: string }) {
    const [index, setIndex] = useState(0);
    function nextTopic() {
      setIndex((i) => (i + 1) % topics.length);
    }
    function prevTopic() {
      setIndex((i) => (i - 1 + topics.length) % topics.length);
    }

    return (
      <div className="rounded-2xl p-4 bg-white/6 border border-white/6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-white font-semibold">{topics[index].title}</h4>
            <p className="text-slate-300 text-sm mt-2">{topics[index].excerpt}</p>

            <div className="mt-3 text-xs text-slate-400">
              {persona === "student" ? topics[index].studentHint : topics[index].teacherHint}
            </div>

            <div className="mt-3 text-xs text-slate-300">Example flashcard:</div>
            <div className="mt-1 text-sm text-slate-300">{topics[index].flashcard}</div>
          </div>

          <div className="flex flex-col gap-2">
            <button onClick={nextTopic} className="px-3 py-1 rounded-full bg-white/5 text-white text-sm">Next</button>
            <button onClick={prevTopic} className="px-3 py-1 rounded-full bg-white/5 text-white text-sm">Prev</button>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-400">Click Next/Prev to browse curated note examples for quick practice.</div>
      </div>
    );
  }

  // Topics to cycle through in the Note Taker interactive card
  const noteTopics = [
    {
      title: "Potsdam Conference (1945)",
      excerpt:
        "Key decisions at Potsdam shaped post-war Europe: zones of occupation, reparations, and the outline for Germany's administration.",
      studentHint: "Student tip: focus on who attended, main outcomes, and consequences for Germany and Eastern Europe.",
      teacherHint: "Teacher note: useful for scaffolded prompts — ask students to compare Potsdam with Yalta and evaluate shifts in Allied priorities.",
      flashcard:
        "Front: What were the three main agreements at Potsdam? — Back: Division of Germany, reparations approach, and boundaries/Poland administration."
    },
    {
      title: "Transformation of Functions",
      excerpt:
        "A quick review of how translations, stretches, reflections and compressions alter y = f(x) — essential for algebra and precalculus.",
      studentHint: "Student tip: practice by sketching a base function and applying one transformation at a time.",
      teacherHint: "Teacher note: use ordered practice (translate, then scale) and ask students to explain inverse operations.",
      flashcard:
        "Front: How does y = f(x - 3) differ from y = f(x)? — Back: It's translated 3 units right."
    },
    {
      title: "Photosynthesis — quick summary",
      excerpt:
        "Capture the light-dependent and Calvin cycle steps in concise bullets to convert lecture notes into active practice.",
      studentHint: "Student tip: memorise the inputs/outputs of each stage and link them to cellular location.",
      teacherHint: "Teacher note: provide prompts that require linking structure to function (e.g., thylakoid role).",
      flashcard:
        "Front: Where does the Calvin cycle occur? — Back: In the stroma of the chloroplast."
    },
  ];

  return (
    <>
      <SEO
        title="Features · VertexED AI Study Toolkit"
        description="Explore VertexED features: AI Calendar, Discussion Agent, Study Zone, Paper Maker, Answer Reviewer, Notes, Flashcards, and Quizzes."
        canonical="https://www.vertexed.app/features"
      />

      {/* Hero — lightweight (no boxed panel) so it sits in your existing backdrop */}
      <section className="pt-12 pb-16 px-6 fade-up">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight mb-4">
              <TypeAnimation
                sequence={[700, "Meet your tools ready to transform you", 1200, "Where deep learning meets exam driven performance"]}
                wrapper="span"
                cursor={true}
              />
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Each feature below is engineered to be research-aligned and learner-first, designed to actually change how you study.
              Focus on one tool at a time and discover the specific ways VertexED raises exam performance whist deepening your understanding.
            </p>

            {/* persona-specific subtext */}
            <div className="mt-3 text-sm text-slate-400">
              {persona === "student" ? (
                "What yoy gain — Effective learning, Limitless Resources, Endless Practes"
              ) : (
                "What your teachers gain — More material, Easier grading, Quicker Learning"
              )}
            </div>

              <div className="mt-6 flex gap-4 items-center">
              <Link
                to="/login"
                className="inline-block px-6 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-md hover:scale-105 transition-transform duration-300"
              >
                Get started
              </Link>
              <Link
                to="/"
                className="inline-block px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition duration-300"
              >
                Back
              </Link>

              {/* Persona toggle fills empty spacing in hero without changing design language */}
              <div className="ml-auto md:ml-0">
                <PersonaToggle persona={persona} setPersona={setPersona} />
              </div>
            </div>

            {/* Small explanatory chips that live in the hero whitespace */}
            <div className="mt-6 flex gap-2 flex-wrap">
              <div className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-xs">Exam Driven Performance</div>
              <div className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-xs">Inquiry Based Iearning</div>
              <div className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-xs">Limitless Opportunities</div>
              <Link to="/resources" className="px-3 py-1 bg-white/5 text-slate-200 rounded-full text-xs underline">Guides</Link>
            </div>
          </div>

          <aside className="w-full md:w-1/3 text-slate-300">
            <div className="p-6 rounded-2xl bg-white/5">
              <h4 className="font-semibold mb-2">Performance, Understanding and Personalization at the core</h4>
              <p className="text-sm">
                VertexED models what you know and how you learn. From studying resources made by students just like you
                to constant practice, review and access to a new way of learning, ensure every minute moves you closer to mastery.
              </p>
              <div className="mt-4 text-xs text-slate-400">The Outcome? : Better Understanding, Quicker Progress, Better Perfromances.</div>

              {/* Add a compact expandable card to use vertical empty space */}
              <div className="mt-4">
                <ExpandableCard title="Quick metrics" compact>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-xs">
                      <div className="text-slate-300">Average Beta Test Session</div>
                      <div className="font-semibold text-white">28 min</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-300">Recall boost</div>
                      <div className="font-semibold text-white">+14%</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">These numbers are just the beginning; get ready to see updates real soon</div>
                </ExpandableCard>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* AI Calendar */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="feature-row flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">AI Calendar — schedule optimizer</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The AI Calendar constructs an evidence-based study layout tailored to your commitments. Rather than undirected hours,
                VertexED suggests compact, goal-centred sessions aligned to what you need to do: learning sessions, problem practice,
                or retrieval drills all whilst keeping your priorities in mind.
              </p>

              <h4 className="font-semibold mt-3 text-white">How it helps</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Balances extracurriculars and coursework so practice is realistic and sustainable.</li>
                <li>Schedules session types (recall bursts, problem-solving blocks, mock-test slots) based on upcoming assessments.</li>
                <li>Builds a system where room is kept to review for weaker topics; reducing stress and boosting retention.</li>
              </ul>

              {/* Interactive mini-card grid fills whitespace and explains variants */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FeatureCard
                  heading="Post School Study Session?"
                  blurb="The calanders there ready to sort your evening out"
                  bullets={["20 minutes of active recall", "2 hours of homework", "1 hour practice paper"]}
                />

                <FeatureCard
                  heading="Running tight on time"
                  blurb="The calanders there to help chart your schedule and help you decide whats best"
                  bullets={["Formative Assessment Prep, School Project Work, Research Paper Drafting"]}
                />

                <FeatureCard
                  heading="Weekly plan"
                  blurb="Sort your week (or even month) out with us with you in charge"
                  bullets={["Extracurricular Commitments, E-Assessment Mocks, Lab Work"]}
                />
              </div>
            </div>

            <div className="flex-1 text-slate-300">
              <p className="mb-2 font-semibold">Why it matters?</p>
              <p className="text-slate-300 leading-relaxed">
                Distributed and mixed practice are proven to improve retention and transfer, even for the most sproadic of people. The calendar turns a mess into a weekly plan
                you can actually follow with you in control of what to change, increasing efficient learning and reducing burnout.
              </p>

              {/* Add an expandable card that sits in empty right-hand space */}
              <div className="mt-6">
                <ExpandableCard title="What we reccomened">
                  <ul className="list-disc ml-5 text-slate-300">
                    <li>Plan your evenings effectively in advance to increase productivity</li>
                    <li>This would take less than 5 minutes a day and keep you in flow</li>
                    <li>Always leave room for the unpredictable or if you feel the session may go a little overboard</li>
                    <li>For Exam Season, let it handle the draft plan</li>
                    <li>Yet remember, you're in charge</li>
                    <li>Feel free to customize the plan to what you want or if any last minute changes come up</li>
                  </ul>
                </ExpandableCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Discussion Agent */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="feature-row flex flex-col md:flex-row items-start gap-8 md:gap-16">
            <div className="flex-1 text-slate-300 md:order-2">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Apex; Your new learning buddy</h2>
              <p className="leading-relaxed mb-4">
                A guided learning partner that frames complex topics, suggests structured reading, and helps you build argumentative or investigative
                lines of thought. It may be efficent yet small now, but trust me when we say it; Apex is set to grow and expand in a way like never before.
              </p>

              <h4 className="font-semibold mt-3 text-white">What can Apex provide?</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Detailed doubt explanations and clarifications for when your understanding needs correction</li>
                <li>Helps explain new concepts in an approachable manner keeping your caliber in mind.</li>
                <li>Open to discussion and deliberation on various perspectives across numerous topics</li>
              </ul>
            </div>

            <div className="flex-1 md:order-1">
              <p className="mb-2 font-semibold text-white">Why it matters?</p>
              <p className="text-slate-300 leading-relaxed">
                Deep understanding requires guidance. Apex is here to help bridge the gap, being patient and open to
                academic investigations and discussions. Moreover, it's here to help bridge the gap between doubt and understanding.
              </p>

              {/* Small interactive card: switch between 'essay' and 'research' modes to illustrate how the agent frames support */}
              <div className="mt-6">
                <ExpandableCard title="Example Use-Cases">
                  <div className="text-sm text-slate-300">
                    <div className="font-medium text-white">Discussions on histographys and merits of perspectives which can be replicated in essays</div>
                    <div className="mt-2">Explaining the applications of harmonic series in real life whilst also enforcing conceptual understanding</div>
                    <div className="font-medium text-white mt-4">Deliberating the merits and limitations of physics models whilst understanding their core concepts</div>
                    <div className="font-medium text-white mt-4">Learning the sequence of DNA translation whilst also understanding a cells structure</div>
                    <div className="mt-2">Understanding patterns in a language whilst also building familarity.</div>
                  </div>
                </ExpandableCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Answer Reviewer */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="feature-row flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">AI Answer Reviewer: curriculum-aware feedback</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The Reviewer grades responses using rubric-aware analysis, highlights marks gained and missing ideas, and prescribes a short,
                actionable improvement plan tied to concrete practice items.
              </p>

              <h4 className="font-semibold mt-3 text-white">Key capabilities</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Marks against curriculum rubrics and identifies misconception patterns.</li>
                <li>Produces targeted improvement steps: topics, exemplar questions, and study methods to close gaps.</li>
                <li>Tracks progress across attempts so growth is measurable for students and teachers.</li>
              </ul>
            </div>

            <div className="flex-1 text-slate-300">
              <p className="mb-2 font-semibold">Why it matters</p>
              <p className="text-slate-300 leading-relaxed">
                Specific, rubric-aligned feedback moves the needle. When students know precisely what to work on and get small wins, exam performance
                and confidence improve together.
              </p>

              {/* Example interactive card showing rubric highlights */}
              <div className="mt-6">
                <FeatureCard
                  heading="Rubric snapshot"
                  blurb="Shows where marks were gained and lost."
                  bullets={[
                    "Knowledge & understanding: 4/6",
                    "Application: 3/5",
                    "Analysis & evaluation: 2/6",
                    "Missing key example(s) and clearer linkage",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Paper Maker */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="feature-row flex flex-col md:flex-row items-start gap-8 md:gap-16">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">AI Paper Maker — board-aligned practice papers</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Produce practice papers that mimic the tone, phrasing and mark schemes of your board. Papers are crafted to reproduce the cognitive
                load of actual exams: clear command words, progressive difficulty and realistic timing. If a paper seems too long, try a question segment!
              </p>

              <h4 className="font-semibold mt-3 text-white">How it helps</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Tailors question phrasing and mark schemes to your syllabus.</li>
                <li>Helps test conceptual understanding and application with the same intent your board aims to</li>
                <li>Aims to mix high order thinking and understanding with critical and creative exam based task performance demands.</li>
              </ul>
            </div>

            <div className="flex-1">
              <p className="mb-2 font-semibold text-white">Supported boards (unaffiliated)</p>
              <div className="inline-flex gap-2 flex-wrap">
                {supportedBoards.map((b) => (
                  <div key={b} className="px-3 py-1 bg-white/5 text-slate-300 rounded-full text-sm">{b}</div>
                ))}
              </div>

              <p className="mt-4 text-slate-300 leading-relaxed">
                Regular practice with authentic papers reduces anxiety and builds fluent exam technique — directly improving test day performance.
              </p>

              {/* Fill whitespace with a compact card showing paper composition examples */}
              <div className="mt-6">
                <FeatureCard
                  heading="Sample composition (IB MYP)"
                  blurb="How a mixed Chemistry Paper may be composed (E-Assessment)"
                  bullets={[
                    "Criteria A: 24",
                    "Criteria B:23",
                    "Criteria C: 27 extended essays (35%)",
                    "Criteria D: 26 Marks",
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Zone */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="feature-row flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Study Zone — focused workspace for deep sessions</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                A single workspace containing the tools you need while in flow: activity logs, graphing helpers, concept walkthroughs and quick
                assistants that point to worked examples. Track sessions, keep momentum, and remove friction.
              </p>

              <h4 className="font-semibold mt-3 text-white">What you’ll find</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Activity log & session analytics to measure real productivity.</li>
                <li>Graphing calculator and quick math helpers for on-the-spot checks.</li>
                <li>Context-aware assistants offering short walkthroughs and related worked examples.</li>
              </ul>
            </div>

            <div className="flex-1 text-slate-300">
              <p className="mb-2 font-semibold">Why it matters</p>
              <p className="text-slate-300 leading-relaxed">
                Keeping tools in one workspace preserves focus. Over time, analytics reveal the study patterns that actually correlate with improvement,
                so you can repeat what works.
              </p>

              {/* Add interactive cards that explain components of the Study Zone */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <FeatureCard
                  heading="Session analytics"
                  blurb="Quick view of time on task and accuracy trends."
                  bullets={["Daily / weekly time-on-task", "Topic-wise accuracy", "Retention graph hints"]}
                />

                <FeatureCard
                  heading="Quick helpers"
                  blurb="Tools surfaced in context so you don't leave flow."
                  bullets={["Mini-graphing window", "Step-by-step idea hints", "Paste a worked problem to compare"]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Note Taker */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="feature-row flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-3">Note Taker — record, structure and practise</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Capture lectures, autosave snapshots, export structured notes, and convert content into flashcards and quizzes for retrieval practice.
                The Note Taker closes the loop from exposure to active practice.
              </p>

              <h4 className="font-semibold mt-3 text-white">Capabilities</h4>
              <ul className="list-disc ml-6 mt-2 text-slate-300">
                <li>Lecture capture + transcription with timestamped snapshots for easy review.</li>
                <li>AI summarisation that creates concise flashcards and practice questions for active recall.</li>
                <li>Export to Word/PDF with preserved structure for sharing or archiving.</li>
              </ul>
            </div>

            <div className="flex-1 text-slate-300">
              <p className="mb-2 font-semibold">Why it matters</p>
              <p className="text-slate-300 leading-relaxed">
                Students who convert notes into active practice retain far more than those who only re-read. The Note Taker intentionally makes that
                conversion simple and fast: capture → condense → practise.
              </p>

              {/* Fill right-hand whitespace with an example card and an expandable sample flashcard */}
              <div className="mt-6 grid grid-cols-1 gap-4">
                <FeatureCard
                  heading="Lecture snapshot"
                  blurb="Timestamps + highlights for quick review."
                  bullets={["Highlighted quotes", "Timestamped Q/A", "Exportable flashcards"]}
                />

                {/* Interactive topic card that alternates between curated topics on click */}
                <InteractiveTopicCard topics={noteTopics} persona={persona} />

                <ExpandableCard title="Sample flashcard">
                  <div className="text-sm text-slate-300">
                    <div className="font-medium text-white">Front:</div>
                    <div className="mt-1">Explain distributed practice and why it helps retention.</div>
                    <div className="font-medium text-white mt-3">Back:</div>
                    <div className="mt-1">Distributed practice spaces learning over time which reduces forgetting and strengthens retrieval pathways.</div>
                  </div>
                </ExpandableCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="fade-up px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">Designed to improve scores and understanding</h3>
          <p className="text-slate-300 mb-6">
            VertexED balances exam fluency with conceptual learning. Every feature maps to measurable outcomes — improved exam technique,
            stronger long-term retention, and clear next steps for what to practise next.
          </p>

          <Link to="/login" className="inline-block px-8 py-3 rounded-full bg-white text-slate-900 font-semibold shadow-md hover:scale-105 transition-transform duration-300">
            Get started
          </Link>

          <div className="mt-6 text-xs text-slate-400">Personalisation analyses your strengths and weaknesses and proposes concrete next steps — not generic advice.</div>
        </div>
      </section>
    </>
  );
}
