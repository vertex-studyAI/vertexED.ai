import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Calendar, FileText, CheckCircle, MessageSquare, Activity } from "lucide-react";

/**
 * Features_updated.tsx
 *
 * Finalised features page — strictly explanatory (non-demo). Each section explains the feature,
 * its classroom/student use-cases, and why it matters. Micro-animations for polish only; no mock/demo logic.
 *
 * The copy and layout are tuned to match the polished marketing-style screens you shared: clear headlines,
 * supportive bullets, and contrast-safe card backgrounds.
 */

type Feature = {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  headline: string;
  bullets: string[];
  useCases: string[];
};

const FEATURES: Feature[] = [
  {
    id: "planner",
    title: "AI Planner",
    icon: Calendar,
    headline: "Plan study that respects how memory forms",
    bullets: ["Schedules spaced repetition automatically", "Balances interleaving across topics", "Adapts to missed sessions and feedback"],
    useCases: ["Weekly planning for students", "Pre-exam ramp-up", "Teacher-managed cohort schedules"],
  },
  {
    id: "notes",
    title: "Smart Notes",
    icon: FileText,
    headline: "Turn long notes into recallable content",
    bullets: ["Auto-extract key points", "Create flashcards from highlights", "One-click summaries for revision"],
    useCases: ["Lecture consolidation", "Group revision packs", "Personal study archives"],
  },
  {
    id: "reviewer",
    title: "Answer Reviewer",
    icon: CheckCircle,
    headline: "Rubric-led feedback that teaches revision",
    bullets: ["Curriculum-aware scoring", "Concrete rewrite suggestions", "Highlight missing evidence & command-terms"],
    useCases: ["Essay practice", "Timed answer calibration", "Teacher moderation and standardisation"],
  },
  {
    id: "chatbot",
    title: "Academic Chatbot",
    icon: MessageSquare,
    headline: "A conversation that builds intuition",
    bullets: ["Guide through worked examples", "Produce scaffolded hints", "Prompt students to reflect and reason"],
    useCases: ["Concept checks", "Homework scaffolding", "Extra practice outside class"],
  },
  {
    id: "studyzone",
    title: "Study Zone",
    icon: Activity,
    headline: "A focused workspace with everything you need",
    bullets: ["Activity log & quick utilities", "Mini-calculator and flashcard launcher", "Resources pane for links and embeds"],
    useCases: ["Deep study sessions", "Quick practice bursts", "Exam day checklist"],
  },
];

export default function FeaturesUpdated(): JSX.Element {
  const features = useMemo(() => FEATURES, []);
  const [openId, setOpenId] = useState<string | null>(features[0]?.id ?? null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 py-10">
      <Helmet>
        <title>Features — VertexED</title>
      </Helmet>

      <header className="max-w-7xl mx-auto px-6 flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-900 w-10 h-10 flex items-center justify-center text-white">
            <Zap className="w-5 h-5" />
          </div>
          <div className="font-semibold">VertexED</div>
        </div>

        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/pricing" className="hover:underline">Pricing</Link>
          <Link to="/schools" className="hover:underline">Schools</Link>
          <Link to="/login" className="hover:underline">Login</Link>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        <section className="rounded-3xl bg-white py-20 px-8 shadow-sm text-center">
          <motion.h1 className="text-5xl font-semibold leading-tight mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Features designed to improve learning — not just measure it.
          </motion.h1>

          <motion.p className="text-lg text-slate-600 max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
            Each feature is built from the classroom outwards and grounded in learning science. Below, we explain what each module does, where to use it and why it matters.
          </motion.p>

          <div className="mt-8 flex justify-center gap-3">
            <Link to="/contact" className="px-5 py-3 rounded border">Contact sales</Link>
            <Link to="/schools" className="px-5 py-3 rounded bg-slate-900 text-white">Schools</Link>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <article key={f.id} className="rounded-2xl bg-white p-6 shadow border" aria-labelledby={`feature-${f.id}`} onClick={() => setOpenId(openId === f.id ? null : f.id)}>
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-slate-50 border">
                  <f.icon className="w-6 h-6 text-slate-700" />
                </div>
                <div className="flex-1">
                  <h3 id={`feature-${f.id}`} className="text-lg font-semibold text-slate-900">{f.title}</h3>
                  <div className="text-sm text-slate-600 mt-2">{f.headline}</div>

                  <ul className="mt-3 text-sm text-slate-600 list-disc list-inside">
                    {f.bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>

                  <div className="mt-4 text-xs text-slate-500">Where to use:</div>
                  <div className="mt-2 text-sm text-slate-700">
                    {f.useCases.join(" • ")}
                  </div>
                </div>
              </div>

              {/* Expandable explanation area for the selected feature */}
              {openId === f.id && (
                <div className="mt-4 bg-slate-50 p-4 rounded text-sm text-slate-700">
                  <strong>Why this matters:</strong>
                  <p className="mt-2">This feature reduces friction between exposure and retrieval. By making active practice easy and contextual, students convert study time to durable learning faster.</p>
                  <div className="mt-3 text-xs text-slate-500">Implementation note: connect these cards to your product's detailed pages or teacher onboarding flows for deeper configuration and examples.</div>
                </div>
              )}
            </article>
          ))}
        </section>

        <section className="mt-12">
          <div className="rounded-2xl bg-white p-6 shadow border">
            <h4 className="text-lg font-semibold">Adoption & classroom fit</h4>
            <p className="mt-2 text-sm text-slate-600">We recommend starting with a single class pilot: seed the planner, use the reviewer for one assignment cycle, and export a set of mock papers for practice. Collect teacher feedback and scale from there.</p>
          </div>
        </section>

        <section className="mt-12 text-center">
          <div className="inline-block rounded-3xl bg-slate-900 text-white p-8">
            <h3 className="text-2xl font-semibold">Want a walkthrough?</h3>
            <p className="mt-2 text-sm text-slate-200">Schedule a tailored walkthrough for your department — we'll show alignment examples and deployment options.</p>
            <div className="mt-4">
              <Link to="/contact" className="px-4 py-2 rounded bg-white text-slate-900">Request a walkthrough</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-sm text-slate-500 py-8">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
    </div>
  );
}
