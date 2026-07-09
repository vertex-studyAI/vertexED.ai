import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Calculator,
  Clock,
  FileText,
  FlaskConical,
  Sigma,
  Sparkles,
  Zap,
} from "lucide-react";

import SEO from "@/components/SEO";
import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

type FormulaTab = "math" | "physics" | "chemistry";

const FORMULAS: Record<FormulaTab, { name: string; expr: string }[]> = {
  math: [
    { name: "Quadratic formula", expr: "x = (−b ± √(b²−4ac)) / 2a" },
    { name: "Derivative of xⁿ", expr: "d/dx (xⁿ) = n·xⁿ⁻¹" },
    { name: "Integration by parts", expr: "∫u dv = uv − ∫v du" },
    { name: "Pythagoras", expr: "a² + b² = c²" },
    { name: "Arithmetic sequence", expr: "aₙ = a₁ + (n−1)d" },
    { name: "Geometric sequence", expr: "aₙ = a₁ · rⁿ⁻¹" },
  ],
  physics: [
    { name: "Newton's 2nd law", expr: "F = ma" },
    { name: "Kinetic energy", expr: "KE = ½mv²" },
    { name: "Gravitational PE", expr: "PE = mgh" },
    { name: "Ohm's law", expr: "V = IR" },
    { name: "Power", expr: "P = IV = I²R" },
    { name: "Wave equation", expr: "v = fλ" },
  ],
  chemistry: [
    { name: "Moles", expr: "n = m / M" },
    { name: "Concentration", expr: "c = n / V" },
    { name: "Ideal gas", expr: "PV = nRT" },
    { name: "pH", expr: "pH = −log₁₀[H⁺]" },
    { name: "Percent yield", expr: "% yield = (actual / theoretical) × 100" },
    { name: "Avogadro", expr: "N = n × 6.02×10²³" },
  ],
};

const TECHNIQUES = [
  { title: "Active Recall", desc: "Test yourself before re-reading. Use flashcards and quizzes.", to: "/resources/active-recall-spaced-repetition" },
  { title: "Spaced Repetition", desc: "Review just before you forget. Study Mode in AI Notes uses this.", to: "/notetaker" },
  { title: "Pomodoro", desc: "25 min focus + 5 min break. Built into Study Zone timer.", to: "/study-zone" },
  { title: "Feynman Technique", desc: "Explain a concept in simple words to find gaps.", to: "/chatbot" },
  { title: "Past Papers", desc: "Board-aligned mocks with Paper Maker, then review answers.", to: "/paper-maker" },
  { title: "Rubric Review", desc: "Upload drafts to Answer Reviewer for examiner-style feedback.", to: "/answer-reviewer" },
];

const QUICK_TOOLS = [
  { title: "Study Zone", desc: "Timer, calculator, Desmos, habits", to: "/study-zone", icon: Clock },
  { title: "AI Notes", desc: "Notes → flashcards → quiz", to: "/notetaker", icon: FileText },
  { title: "Paper Maker", desc: "IB, IGCSE, CBSE mock exams", to: "/paper-maker", icon: BookOpen },
  { title: "Planner", desc: "Calendar + AI task scheduling", to: "/planner", icon: Sparkles },
];

export default function StudyTools() {
  const [tab, setTab] = useState<FormulaTab>("math");
  const formulas = useMemo(() => FORMULAS[tab], [tab]);

  return (
    <>
      <SEO
        title="Study Tools & Formula Reference | VertexED"
        description="Quick-reference formulas, study techniques, and one-click access to VertexED tools."
        canonical="https://www.vertexed.app/study-tools"
      />

      <PageSection className="max-w-5xl">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-primary/80">Reference Hub</span>
          <h1 className="text-3xl md:text-4xl font-semibold brand-text-gradient inline-block mt-2">
            Study Tools & Resources
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Formulas, evidence-based techniques, and shortcuts to every VertexED tool — built for exam prep sessions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {QUICK_TOOLS.map((tool) => (
            <Link key={tool.to} to={tool.to} className="group">
              <NeumorphicCard className="p-5 h-full hover:border-primary/30 transition">
                <tool.icon className="h-6 w-6 text-primary mb-3" />
                <h2 className="font-semibold text-foreground group-hover:text-primary transition">{tool.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{tool.desc}</p>
              </NeumorphicCard>
            </Link>
          ))}
        </div>

        <NeumorphicCard className="p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Sigma className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Formula Reference</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {(["math", "physics", "chemistry"] as FormulaTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
                  tab === key
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-white/5 text-muted-foreground border border-white/10 hover:text-foreground"
                }`}
              >
                {key === "math" && <Calculator className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                {key === "physics" && <Zap className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                {key === "chemistry" && <FlaskConical className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                {key}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {formulas.map((f) => (
              <div
                key={f.name}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <p className="text-xs text-muted-foreground mb-1">{f.name}</p>
                <p className="font-mono text-sm text-foreground">{f.expr}</p>
              </div>
            ))}
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Study Techniques</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {TECHNIQUES.map((t) => (
              <Link
                key={t.title}
                to={t.to}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
              >
                <h3 className="font-medium text-foreground">{t.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              </Link>
            ))}
          </div>
        </NeumorphicCard>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">Want deeper guides?</p>
          <Link to="/resources" className="btn-glass px-6 py-2.5 text-sm">
            Browse all resources →
          </Link>
        </div>
      </PageSection>
    </>
  );
}
