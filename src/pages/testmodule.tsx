import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Eye,
  Layers,
  LineChart,
  Lock,
  PenLine,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Wand2,
} from "lucide-react";

import PageSection from "@/components/PageSection";
import NeumorphicCard from "@/components/NeumorphicCard";

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type RouteCardProps = {
  to: string;
  title: string;
  description: string;
  badge?: string;
  reduceMotion: boolean;
};

type MetricProps = {
  label: string;
  value: string;
  detail: string;
};

type SystemLine = {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
};

const features: Feature[] = [
  {
    title: "Digital exam engine",
    description:
      "Timed sessions, autosave, question palettes, flagging, answer persistence, and submission logic in a calm, exam-first interface.",
    icon: <ClipboardList size={18} aria-hidden />,
  },
  {
    title: "IB-style response workspace",
    description:
      "Short response, long response, and math response flows with a layout designed for clarity, focus, and structured writing.",
    icon: <PenLine size={18} aria-hidden />,
  },
  {
    title: "Math-first tools",
    description:
      "Equation entry, graphing space, and working-area support that keeps mathematical reasoning visible and organized.",
    icon: <Calculator size={18} aria-hidden />,
  },
  {
    title: "AI marking layer",
    description:
      "Criterion-based reports, banded scoring, and feedback blocks built for teacher review and student reflection.",
    icon: <Brain size={18} aria-hidden />,
  },
  {
    title: "Teacher dashboard",
    description:
      "Create exams, assign papers, inspect submissions, and compare performance across classes and tasks.",
    icon: <Users size={18} aria-hidden />,
  },
  {
    title: "Assessment security",
    description:
      "Focus-loss tracking, fullscreen readiness, copy-paste controls, and event logs for exam integrity.",
    icon: <ShieldCheck size={18} aria-hidden />,
  },
];

const metrics: MetricProps[] = [
  {
    label: "Question types",
    value: "3",
    detail: "Short answers, essays, and math responses.",
  },
  {
    label: "Exam states",
    value: "4",
    detail: "Not visited, active, answered, and flagged.",
  },
  {
    label: "Core layers",
    value: "6",
    detail: "UI, timer, autosave, AI, security, analytics.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Launch the paper",
    description:
      "Students enter a focused exam room with the timer, palette, and response panel already ready.",
  },
  {
    step: "02",
    title: "Work through questions",
    description:
      "The interface preserves answers, supports flagging, and lets students move without losing context.",
  },
  {
    step: "03",
    title: "Submit and review",
    description:
      "The paper closes into a structured report that can be used for grading, reflection, or next steps.",
  },
];

const systemLines: SystemLine[] = [
  { label: "Frontend", value: "React + motion UI", tone: "success" },
  { label: "Storage", value: "Autosave + resume", tone: "success" },
  { label: "Math", value: "Equation + graph tools", tone: "neutral" },
  { label: "Evaluation", value: "Criteria A/B/C/D", tone: "warning" },
  { label: "Security", value: "Focus loss + logs", tone: "warning" },
  { label: "Teacher view", value: "Analytics + assignment", tone: "success" },
];

function MetricCard({ label, value, detail }: MetricProps) {
  return (
    <NeumorphicCard className="h-full p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{value}</div>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{detail}</p>
    </NeumorphicCard>
  );
}

function FeatureCard({ title, description, icon }: Feature) {
  return (
    <NeumorphicCard className="h-full p-5 transition-transform hover:scale-[1.01]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-black/5 bg-black/[0.03] p-2 text-gray-700">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
      </div>
    </NeumorphicCard>
  );
}

function RouteCard({ to, title, description, badge, reduceMotion }: RouteCardProps) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Link
        to={to}
        aria-label={`Open ${title}`}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
      >
        <NeumorphicCard className="p-5 transition-transform hover:scale-[1.01]">
          <div className="flex items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-medium text-gray-900">{title}</h3>
                {badge ? (
                  <span className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[11px] font-medium text-gray-600">
                    {badge}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p>
            </div>
            <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" aria-hidden />
          </div>
        </NeumorphicCard>
      </Link>
    </motion.div>
  );
}

function WorkflowStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <NeumorphicCard className="h-full p-5">
      <div className="text-xs font-semibold tracking-[0.24em] text-gray-400">{step}</div>
      <h3 className="mt-3 text-base font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
    </NeumorphicCard>
  );
}

function DemoPanel() {
  return (
    <NeumorphicCard className="h-full overflow-hidden p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-gray-400">LIVE DEMO LAYOUT</div>
          <h2 className="mt-2 text-lg font-medium text-gray-900">Exam room preview</h2>
        </div>
        <div className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-gray-600">
          Ready for build
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock3 size={16} aria-hidden />
              <span className="font-medium">01:24:10 remaining</span>
            </div>
            <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-medium text-white">Paper 1</span>
          </div>

          <div className="mt-4 grid grid-cols-8 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex h-9 items-center justify-center rounded-lg text-xs font-medium ${
                  i === 2
                    ? "bg-black text-white"
                    : i === 1 || i === 5
                      ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                      : i === 4
                        ? "border border-amber-300 bg-amber-50 text-amber-800"
                        : "border border-black/10 bg-black/[0.02] text-gray-500"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-black/5 bg-black/[0.02] p-4">
            <div className="text-sm font-medium text-gray-900">Question 3</div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Explain one cause and one consequence of industrialization using a clear PEEL structure.
            </p>
            <div className="mt-4 rounded-xl border border-black/5 bg-white p-3 text-sm text-gray-500 shadow-sm">
              Student response area with autosave, flagging, and structured scoring hooks.
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <LineChart size={16} aria-hidden />
              Analytics snapshot
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Answered</span>
                  <span>6 / 8</span>
                </div>
                <div className="h-2 rounded-full bg-black/[0.08]">
                  <div className="h-2 w-[75%] rounded-full bg-black" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Flagged</span>
                  <span>1</span>
                </div>
                <div className="h-2 rounded-full bg-black/[0.08]">
                  <div className="h-2 w-[12%] rounded-full bg-amber-400" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Focus loss events</span>
                  <span>0</span>
                </div>
                <div className="h-2 rounded-full bg-black/[0.08]">
                  <div className="h-2 w-[4%] rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <Brain size={16} aria-hidden />
              AI rubric output
            </div>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                <span>Criterion A</span>
                <span className="font-medium text-gray-900">6/8</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                <span>Criterion B</span>
                <span className="font-medium text-gray-900">7/8</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                <span>Criterion C</span>
                <span className="font-medium text-gray-900">5/8</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-black/[0.03] px-3 py-2">
                <span>Criterion D</span>
                <span className="font-medium text-gray-900">6/8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NeumorphicCard>
  );
}

function SystemBlueprint() {
  return (
    <NeumorphicCard className="p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-gray-400">ARCHITECTURE SNAPSHOT</div>
          <h2 className="mt-2 text-lg font-medium text-gray-900">How the platform is structured</h2>
        </div>
        <div className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs text-gray-600">
          System view
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {systemLines.map((line) => (
          <div
            key={line.label}
            className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-sm"
          >
            <div className="text-xs font-semibold tracking-[0.18em] text-gray-400">{line.label}</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-gray-900">{line.value}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  line.tone === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : line.tone === "warning"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-black/[0.03] text-gray-600"
                }`}
              >
                {line.tone === "success" ? "Ready" : line.tone === "warning" ? "Planned" : "Core"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </NeumorphicCard>
  );
}

export default function ExamSystemHome(): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Helmet>
        <title>Exam System — VertexED</title>
        <meta
          name="description"
          content="A full digital assessment system for IB MYP style exams, math response workflows, AI marking, and teacher analytics."
        />
      </Helmet>

      <PageSection>
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium text-gray-600">
            <Sparkles size={14} aria-hidden />
            Assessment platform demo
          </div>

          <h1 className="mt-4 flex items-center gap-2 text-2xl font-medium text-gray-900">
            <BookOpen size={20} aria-hidden />
            Exam System
          </h1>
          <p className="mt-1 max-w-4xl text-sm leading-relaxed text-gray-500">
            A polished digital exam environment with IB-style navigation, math tools,
            criterion-based feedback, autosave, and a teacher-ready workflow.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <NeumorphicCard className="h-full p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="text-xs font-semibold tracking-[0.2em] text-gray-400">FULL SYSTEM OVERVIEW</div>
                  <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
                    A clean exam room, built for real assessments.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
                    Students move through questions with confidence. Answers persist. Math work stays organized.
                    Teachers get a review layer with score bands, feedback, and analytics.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/exam"
                      className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
                    >
                      Open exam demo
                      <ChevronRight size={16} aria-hidden />
                    </Link>
                    <Link
                      to="/teacher"
                      className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-transform hover:scale-[1.01]"
                    >
                      Teacher dashboard
                      <ChevronRight size={16} aria-hidden />
                    </Link>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-black/5 bg-white/75 p-3 text-sm text-gray-600 shadow-sm">
                      <div className="font-medium text-gray-900">Autosave</div>
                      Saves answers while the student works.
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-white/75 p-3 text-sm text-gray-600 shadow-sm">
                      <div className="font-medium text-gray-900">Flagging</div>
                      Mark questions for review instantly.
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-white/75 p-3 text-sm text-gray-600 shadow-sm">
                      <div className="font-medium text-gray-900">AI rubrics</div>
                      Structured feedback per criterion.
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-black/5 bg-gradient-to-br from-black/[0.04] to-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.2em] text-gray-400">SYSTEM STATUS</div>
                      <div className="mt-2 text-lg font-medium text-gray-900">Ready for production build</div>
                    </div>
                    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      Online
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      ["Exam engine", "Completed", <CheckCircle2 size={16} aria-hidden />],
                      ["Math workflow", "In progress", <Calculator size={16} aria-hidden />],
                      ["Teacher tools", "In progress", <Users size={16} aria-hidden />],
                      ["Security layer", "Ready", <Lock size={16} aria-hidden />],
                    ].map(([label, status, icon]) => (
                      <div
                        key={label as string}
                        className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/80 px-3 py-3 text-sm shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-500">{icon as React.ReactNode}</span>
                          <span>{label as string}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500">{status as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </NeumorphicCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <MetricCard {...metrics[0]} />
              <MetricCard {...metrics[1]} />
              <MetricCard {...metrics[2]} />
            </div>
          </div>

          <div className="space-y-6">
            <NeumorphicCard className="h-full p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <Layers size={18} aria-hidden />
                What this system includes
              </h2>
              <ul className="space-y-3 text-sm leading-relaxed text-gray-600">
                <li className="flex gap-2">
                  <span className="mt-1 text-gray-400"><Clock3 size={16} aria-hidden /></span>
                  Timed exam sessions with autosubmit behavior.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-gray-400"><BookOpen size={16} aria-hidden /></span>
                  Subject archives for notes and exemplars.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-gray-400"><Brain size={16} aria-hidden /></span>
                  AI-style criteria reports and feedback.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-gray-400"><Lock size={16} aria-hidden /></span>
                  Focus tracking and basic exam security signals.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 text-gray-400"><UploadCloud size={16} aria-hidden /></span>
                  Contribution flow for reviewed submissions.
                </li>
              </ul>
            </NeumorphicCard>

            <NeumorphicCard className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-gray-900">
                <ShieldCheck size={18} aria-hidden />
                Design principles
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-gray-600">
                <p>
                  The interface stays calm and uncluttered so the student sees the task, not the tool.
                </p>
                <p>
                  The structure supports assessment integrity, long-form writing, and math-heavy papers without breaking flow.
                </p>
                <p>
                  The teacher view mirrors the same clarity: fast review, simple feedback, and clear analytics.
                </p>
              </div>
            </NeumorphicCard>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <DemoPanel />
          </div>
          <div className="xl:col-span-2">
            <SystemBlueprint />
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Layers size={18} aria-hidden />
              Core capabilities
            </h2>
            <span className="text-sm text-gray-500">Built to scale from MVP to full platform</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <Sparkles size={18} aria-hidden />
              How it works
            </h2>
            <span className="text-sm text-gray-500">A simple flow from paper to report</span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {workflowSteps.map((item) => (
              <WorkflowStep key={item.step} {...item} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <header className="mb-5">
            <h2 className="flex items-center gap-2 text-lg font-medium text-gray-900">
              <BookOpen size={18} aria-hidden />
              Connected collections
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-500">
              The exam module connects naturally to archives, subject notes, and future teacher tooling.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RouteCard
              to="/archives"
              title="Archives"
              description="Subject-wise notes, exemplars, and long-term reference material for student revision."
              badge="Library"
              reduceMotion={reduceMotion}
            />

            <RouteCard
              to="/exam"
              title="Exam workspace"
              description="The main assessment interface with timer, palette, answer persistence, and submission flow."
              badge="Core"
              reduceMotion={reduceMotion}
            />

            <RouteCard
              to="/teacher"
              title="Teacher tools"
              description="Create, assign, review, and analyze assessments from one dashboard."
              badge="Admin"
              reduceMotion={reduceMotion}
            />
          </div>
        </section>

        <section className="mt-10">
          <NeumorphicCard className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] text-gray-400">NEXT BUILD STEP</div>
                <h2 className="mt-2 text-xl font-medium text-gray-900">Turn this prototype into a real product shell.</h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
                  Add routed pages, real question data, teacher creation tools, and a production-grade assessment backend.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/exam"
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.01]"
                >
                  Build exam page
                  <ChevronRight size={16} aria-hidden />
                </Link>
                <Link
                  to="/archives"
                  className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-transform hover:scale-[1.01]"
                >
                  Open archives
                  <ChevronRight size={16} aria-hidden />
                </Link>
              </div>
            </div>
          </NeumorphicCard>
        </section>
      </PageSection>
    </>
  );
}
