import React, { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarDays, GripVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import ActivityLog from "./components/ActivityLog";
import Calculator from "./components/Calculator";
import Meditation from "./components/Meditation";
import NoteTaker from "./components/NoteTaker";
import TimerApp from "./components/TimerApp";
import GraphingSuite from "./components/GraphingSuite";
import HabitTracker from "./components/HabitTracker";
import SketchPad from "@/components/sketch/SketchPad";
import { useLocalStorage } from '@/hooks/useLocalStorage';

type WidgetKey =
  | "timer"
  | "activity"
  | "calculator"
  | "meditation"
  | "graphing"
  | "sketch"
  | "notes"
  | "habits";

interface WidgetMeta {
  key: WidgetKey;
  title: string;
  description: string;
  accent: string;
  badge?: string;
  span?: "default" | "wide";
}

const DEFAULT_WIDGET_ORDER: WidgetKey[] = ['timer', 'activity', 'habits', 'calculator', 'graphing', 'meditation', 'sketch', 'notes'];

const StudyZonePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focusMode = searchParams.get("focus") === "timer";
  const [savedWidgetOrder, setSavedWidgetOrder] = useLocalStorage<WidgetKey[]>('studyzone_widget_order_v1', DEFAULT_WIDGET_ORDER);
  const [draggedWidget, setDraggedWidget] = React.useState<WidgetKey | null>(null);

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
        description: "Countdown, stopwatch, or Pomodoro - set the length to match your planner block and log when you finish.",
        accent: "hsl(var(--primary))",
        badge: "Focus",
        span: "wide",
      },
      {
        key: "activity",
        title: "Activity Log",
        description: "Record what you covered, where you got stuck, and what deserves another attempt.",
        accent: "hsl(12 78% 54%)",
      },
      {
        key: "habits",
        title: "Daily Habits",
        description: "Set a few repeatable study routines and check them off each day.",
        accent: "hsl(154 64% 43%)",
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
        description: "Plot 2D functions locally, inspect sample values, or open the embedded 3D graph while you revise.",
        accent: "hsl(var(--primary))",
        badge: "New",
        span: "wide",
      },
      {
        key: "meditation",
        title: "Breath Meditation",
        description: "Short guided breathing between blocks - useful before a mock or when anxiety spikes.",
        accent: "hsl(266 72% 58%)",
      },
      {
        key: "sketch",
        title: "Sketch Notepad",
        description: "Draw diagrams, annotate problems, and send sketches to your Study Notebook - built for iPad and Apple Pencil.",
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
  const orderedWidgets = useMemo(() => {
    const valid = Array.isArray(savedWidgetOrder)
      ? savedWidgetOrder.filter((key, index, list): key is WidgetKey => DEFAULT_WIDGET_ORDER.includes(key) && list.indexOf(key) === index)
      : [];
    return [...valid, ...DEFAULT_WIDGET_ORDER.filter((key) => !valid.includes(key))]
      .map((key) => widgetMeta.find((meta) => meta.key === key))
      .filter((meta): meta is WidgetMeta => Boolean(meta));
  }, [savedWidgetOrder, widgetMeta]);

  const moveWidget = (key: WidgetKey, direction: -1 | 1) => {
    const current = orderedWidgets.map((meta) => meta.key);
    const index = current.indexOf(key);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    setSavedWidgetOrder(current);
  };

  const dropWidgetBefore = (target: WidgetKey) => {
    if (!draggedWidget || draggedWidget === target) return;
    const current = orderedWidgets.map((meta) => meta.key).filter((key) => key !== draggedWidget);
    current.splice(current.indexOf(target), 0, draggedWidget);
    setSavedWidgetOrder(current);
    setDraggedWidget(null);
  };

  const renderWidget = (key: WidgetKey, accent: string) => {
    switch (key) {
      case "timer":
        return <TimerApp accent={accent} />;
      case "activity":
        return <ActivityLog accent={accent} />;
      case "habits":
        return <HabitTracker accent={accent} />;
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
        <title>Study Zone - VertexED</title>
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
            ? "Timer below - set length, start, and stay on one task until the block ends. Other widgets stay visible but dimmed."
            : "Use only the tools that help you finish the next block: a timer, calculator, graphing, quick notes, a session log, and a short reset between blocks."}
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-foreground/[0.025] px-4 py-3">
        <p className="text-sm text-muted-foreground"><GripVertical className="mr-2 inline h-4 w-4" aria-hidden />Drag tools into your preferred order, or use each tool&apos;s move buttons.</p>
        <button type="button" className="btn-glass text-xs inline-flex items-center gap-2" onClick={() => setSavedWidgetOrder(DEFAULT_WIDGET_ORDER)}><RotateCcw className="h-3.5 w-3.5" aria-hidden />Reset layout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6 md:gap-7">
        {orderedWidgets.map((meta, index) => (
          <section
            key={meta.key}
            id={
              meta.key === "timer"
                ? "study-zone-timer"
                : meta.key === "sketch"
                  ? "study-zone-sketch"
                  : undefined
            }
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
            onDrop={(event) => { event.preventDefault(); dropWidgetBefore(meta.key); }}
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
                <span className="ml-auto flex items-center gap-1">
                  <span draggable title={`Drag ${meta.title}`} className="cursor-grab p-2 text-muted-foreground active:cursor-grabbing" onDragStart={(event) => { setDraggedWidget(meta.key); event.dataTransfer.effectAllowed = 'move'; }} onDragEnd={() => setDraggedWidget(null)}><GripVertical className="h-4 w-4" aria-hidden /><span className="sr-only">Drag {meta.title}</span></span>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-35" disabled={index === 0} onClick={() => moveWidget(meta.key, -1)} aria-label={`Move ${meta.title} earlier`}><ArrowUp className="h-3.5 w-3.5" aria-hidden /></button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:text-foreground disabled:opacity-35" disabled={index === orderedWidgets.length - 1} onClick={() => moveWidget(meta.key, 1)} aria-label={`Move ${meta.title} later`}><ArrowDown className="h-3.5 w-3.5" aria-hidden /></button>
                </span>
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
