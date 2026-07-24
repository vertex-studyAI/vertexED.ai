import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import ActivityLog from "./components/ActivityLog";
import Calculator from "./components/Calculator";
import Meditation from "./components/Meditation";
import NoteTaker from "./components/NoteTaker";
import TimerApp from "./components/TimerApp";
import GraphingSuite from "./components/GraphingSuite";
import SketchPad from "@/components/sketch/SketchPad";

type WidgetKey =
  | "timer"
  | "activity"
  | "calculator"
  | "meditation"
  | "graphing"
  | "sketch"
  | "notes";

interface WidgetMeta {
  key: WidgetKey;
  title: string;
  description: string;
  accent: string;
  badge?: string;
  span?: "default" | "wide";
}

const StudyZonePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focusMode = searchParams.get("focus") === "timer";

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (focus !== "timer" && focus !== "sketch") return;
    const targetId = focus === "sketch" ? "study-zone-sketch" : "study-zone-timer";
    const id = window.setTimeout(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => window.clearTimeout(id);
  }, [searchParams]);

  useEffect(() => {
    if (!focusMode) return;
    document.body.classList.add("study-focus-mode");
    return () => document.body.classList.remove("study-focus-mode");
  }, [focusMode]);

  const widgetMeta = useMemo<WidgetMeta[]>(
    () => [
      {
        key: "timer",
        title: "Timer Suite",
        description: "Countdown, stopwatch, or Pomodoro — set the length to match your planner block and log when you finish.",
        accent: "hsl(var(--primary))",
        badge: "Focus",
        span: "wide",
      },
      {
        key: "activity",
        title: "Activity Log",
        description: "Record what you covered, where you got stuck, and what to retry — feeds your dashboard and next plan.",
        accent: "hsl(12 78% 54%)",
      },
      {
        key: "calculator",
        title: "Scientific Calculator",
        description: "Trig, logs, roots, and constants for maths and science problems without switching apps.",
        accent: "hsl(47 92% 48%)",
      },
      {
        key: "graphing",
        title: "Graphing Suite",
        description: "Desmos 2D and 3D embedded here — plot functions and check graphs while you revise.",
        accent: "hsl(var(--primary))",
        badge: "New",
        span: "wide",
      },
      {
        key: "meditation",
        title: "Breath Meditation",
        description: "Short guided breathing between blocks — useful before a mock or when anxiety spikes.",
        accent: "hsl(266 72% 58%)",
      },
      {
        key: "sketch",
        title: "Sketch Notepad",
        description: "Draw diagrams, annotate problems, and send sketches to your Study Notebook — built for iPad and Apple Pencil.",
        accent: "hsl(280 68% 58%)",
        badge: "iPad",
        span: "wide",
      },
      {
        key: "notes",
        title: "Quick Notes",
        description: "Capture an idea or worked step during a session. For full AI notes and flashcards, use AI Notes from the dashboard.",
        accent: "hsl(var(--primary))",
      },
    ],
    [],
  );

  const renderWidget = (key: WidgetKey, accent: string) => {
    switch (key) {
      case "timer":
        return <TimerApp accent={accent} />;
      case "activity":
        return <ActivityLog accent={accent} />;
      case "calculator":
        return <Calculator accent={accent} />;
      case "graphing":
        return <GraphingSuite accent={accent} />;
      case "meditation":
        return <Meditation accent={accent} />;
      case "sketch":
        return <SketchPad accent={accent} />;
      case "notes":
        return <NoteTaker accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12 pb-24 flex flex-col gap-8 md:gap-10">
      <Helmet>
        <title>Study Zone — VertexED</title>
        <meta name="description" content="Focus tools for one study session: a timer, calculator, graphing, notes, and a short reset between blocks." />
        <link rel="canonical" href="https://www.vertexed.app/study-zone" />
      </Helmet>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/main"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.04] px-4 py-2 text-sm text-foreground hover:bg-foreground/[0.07] hover:border-primary/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Dashboard
        </Link>
        <Link
          to="/planner"
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-foreground/[0.04] px-4 py-2 text-sm text-foreground hover:bg-foreground/[0.07] hover:border-primary/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CalendarDays className="h-3.5 w-3.5" aria-hidden />
          Planner
        </Link>
      </div>

      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-primary font-medium">
          {focusMode ? "Focus session" : "Focus tools"}
        </span>
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-foreground leading-tight">
          {focusMode ? "Focus block" : "Work without distractions"}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          {focusMode
            ? "Timer below — set length, start, and stay on one task until the block ends. Other widgets stay visible but dimmed."
            : "Use only the tools that help you finish the next block: a timer, calculator, graphing, quick notes, a session log, and a short reset between blocks."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6 md:gap-7">
        {widgetMeta.map((meta) => (
          <section
            key={meta.key}
            id={
              meta.key === "timer"
                ? "study-zone-timer"
                : meta.key === "sketch"
                  ? "study-zone-sketch"
                  : undefined
            }
            className={cn(
              "glass-panel p-6 md:p-7 flex flex-col gap-5 transition-all duration-300",
              meta.span === "wide" && "md:col-span-full",
              focusMode && meta.key !== "timer" && "opacity-45 saturate-[0.7]",
              focusMode && meta.key === "timer" && "ring-2 ring-primary/40",
            )}
            style={{
              borderColor: `color-mix(in srgb, ${meta.accent} 28%, hsl(var(--border)))`,
              ['--widget-accent' as string]: meta.accent,
              boxShadow: focusMode && meta.key === "timer"
                ? `0 0 0 1px color-mix(in srgb, ${meta.accent} 40%, transparent), var(--shadow-soft)`
                : undefined,
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{
                    background: meta.accent,
                    boxShadow: `0 0 14px color-mix(in srgb, ${meta.accent} 45%, transparent)`,
                  }}
                  aria-hidden
                />
                {meta.badge && (
                  <span className="glass-badge">{meta.badge}</span>
                )}
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{meta.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed m-0">{meta.description}</p>
            </div>

            {renderWidget(meta.key, meta.accent)}
          </section>
        ))}
      </div>
    </div>
  );
};

export default StudyZonePage;
