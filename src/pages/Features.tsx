import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Calendar, FileText, CheckCircle, MessageSquare, Activity } from "lucide-react";

/**
 * FeaturesInteractive.tsx
 *
 * Polished, non-demo features page: explanatory, Apple-like section copy and crafted micro-animations.
 * This file intentionally contains no mock backend logic — it's a marketing/explanatory surface where
 * each card explains what the feature does, why it matters, and where to use it.
 *
 * Keep Tailwind + Framer Motion in your project to use this file unchanged.
 */

type Feature = {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  headline: string;
  bullets: string[];
  why: string;
};

const FEATURES: Feature[] = [
  {
    id: "planner",
    title: "AI Planner",
    icon: Calendar,
    headline: "Planning that respects how memory works",
    bullets: ["Schedules spaced-repetition blocks automatically", "Adapts when you miss sessions", "Balances practice across subjects"],
    why: "Students follow short, focused sessions more consistently. Planner encodes spacing and interleaving so practice yields durable retention.",
  },
  {
    id: "notes",
    title: "Smart Notes",
    icon: FileText,
    headline: "From long notes to crisp recall",
    bullets: ["Auto-extract headings & key points", "Turn highlights into flashcards", "One-click summaries for revision"],
    why: "Converting notes into active content removes the friction between exposure and retrieval — the single biggest boost to learning efficiency.",
  },
  {
    id: "reviewer",
    title: "Answer Reviewer",
    icon: CheckCircle,
    headline: "Teacher-level feedback in seconds",
    bullets: ["Curriculum-aligned rubrics", "Scored suggestions & rewrites", "Actionable steps to improve answers"],
    why: "Students often don't know what to fix. Reviewer pinpoints gaps and shows a concrete rewrite path, accelerating improvement.",
  },
  {
    id: "chatbot",
    title: "Academic Chatbot",
    icon: MessageSquare,
    headline: "Ask, explore, and practice — conversationally",
    bullets: ["Works through worked examples", "Generates scaffolded hints", "Encourages conceptual understanding over rote answers"],
    why: "A conversation helps students test their mental models. The bot nudges reasoning, not just answers.",
  },
  {
    id: "studyzone",
    title: "Study Zone",
    icon: Activity,
    headline: "All your tools without breaking flow",
    bullets: ["Activity log & quick utilities", "Tiny calculator and flashcard launcher", "Graphing & resources pane"],
    why: "Interruptions cost focus. Study Zone keeps utilities within reach so deep work continues uninterrupted.",
  },
];

export default function FeaturesInteractive(): JSX.Element {
  const features = useMemo(() => FEATURES, []);
  const [open, setOpen] = useState<string | null>(features[0]?.id ?? null);

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
        {/* Hero */}
        <section className="rounded-3xl bg-white py-20 px-8 shadow-sm text-center">
          <motion.h1 className="text-5xl font-semibold leading-tight mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            Powerful features. Designed for measurable learning gains.
          </motion.h1>
          <motion.p className="text-lg text-slate-600 max-w-3xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
            Each module is intentionally simple to use and built on evidence-based learning: spacing, retrieval, interleaving and regular practice. Here’s how these features make a real difference in classrooms and for individual learners.
          </motion.p>

          <div className="mt-8 flex justify-center gap-3">
            <Link to="/signup" className="px-5 py-3 rounded bg-slate-900 text-white">Try for free</Link>
            <Link to="/contact" className="px-5 py-3 rounded border">Contact sales</Link>
          </div>
        </section>

        {/* Feature showcase (Apple-like explanatory blocks) */}
        <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {features.map((f, i) => (
              <motion.article key={f.id} className="rounded-2xl p-6 bg-white shadow-md border" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.06 }}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-slate-50 border">
                    <f.icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{f.title}</h3>
                    <div className="text-sm text-slate-600 mt-2">{f.headline}</div>
                    <ul className="mt-3 text-sm text-slate-600 list-disc list-inside">
                      {f.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>

                    <div className="mt-4 text-xs text-slate-500">Why it matters: <span className="font-medium text-slate-700">{f.why}</span></div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {/* Right column: usage patterns + case studies (explanatory) */}
          <aside className="space-y-6 sticky top-24">
            <div className="rounded-2xl bg-white p-6 shadow-md border">
              <h4 className="text-lg font-semibold">How teachers use VertexED</h4>
              <ol className="mt-3 text-sm text-slate-600 list-decimal list-inside">
                <li>Seed schedules for a class and track cohort progress with anonymised metrics.</li>
                <li>Set rubric templates that the Answer Reviewer uses to score and suggest rewrites.</li>
                <li>Export mock papers and distribute to students for timed practice.</li>
              </ol>
              <div className="mt-3 text-xs text-slate-500">Designed to integrate with LMS systems and respect student privacy.</div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md border">
              <h4 className="text-lg font-semibold">How students get results</h4>
              <ol className="mt-3 text-sm text-slate-600 list-decimal list-inside">
                <li>Follow short, high-focus study blocks and do quick recall checks.</li>
                <li>Convert notes to flashcards and schedule automatic review windows.</li>
                <li>Practice with tailored mock papers to build timing and exam stamina.</li>
              </ol>
              <div className="mt-3 text-xs text-slate-500">Behavioral tip: short, consistent practice beats occasional marathon sessions.</div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-md border">
              <h4 className="text-lg font-semibold">Security & Data</h4>
              <p className="mt-2 text-sm text-slate-600">We recommend using anonymised performance feeds for algorithmic tailoring. All sensitive student data should be consented and stored according to local regulations.</p>
            </div>
          </aside>
        </section>

        {/* Deep-dive sections (expandable explanations) */}
        <section className="mt-12 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow border">
            <h4 className="text-lg font-semibold">Evidence-first design</h4>
            <p className="mt-2 text-sm text-slate-600">Every feature is built with learning science in mind: spaced repetition schedules, retrieval practice, worked example sequencing and interleaving. These aren't buzzwords — they're the backbone of measurable improvement in retention and transfer.</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow border">
            <h4 className="text-lg font-semibold">Teacher controls & calibration</h4>
            <p className="mt-2 text-sm text-slate-600">Teachers can override suggestions, set difficulty bands, and seed model answers. This lets departments align the product to local assessment policies while still benefiting from AI-driven scale.</p>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 text-center">
          <div className="inline-block rounded-3xl bg-slate-900 text-white p-8">
            <h3 className="text-2xl font-semibold">See it in action</h3>
            <p className="mt-2 text-sm text-slate-200">Schedule a walkthrough for your school or try our free classroom starter pack.</p>
            <div className="mt-4 flex justify-center gap-3">
              <Link to="/signup" className="px-4 py-2 rounded bg-white text-slate-900">Start free</Link>
              <Link to="/contact" className="px-4 py-2 rounded border text-white/90">Contact sales</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-sm text-slate-500 py-8">© {new Date().getFullYear()} VertexED — Built for learners & teachers</footer>
    </div>
  );
}
