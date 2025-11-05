import React, { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import ActivityLog from "./components/ActivityLog";
import Assistant from "./components/Assistant";
import Calendar from "./components/Calendar";
import Calculator from "./components/Calculator";
import HabitTracker from "./components/HabitTracker";
import Meditation from "./components/Meditation";
import NoteTaker from "./components/NoteTaker";
import TimerApp from "./components/TimerApp";
import { sectionHeadingStyle, subtleBadgeStyle, subtleTextStyle, surfaceStyle } from "./styles";

type WidgetKey =
  | "timer"
  | "assistant"
  | "activity"
  | "calendar"
  | "calculator"
  | "habits"
  | "meditation"
  | "notes";

interface WidgetMeta {
  key: WidgetKey;
  title: string;
  description: string;
  accent: string;
  badge?: string;
  span?: "default" | "wide";
}

const pageWrapperStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: "48px 24px 96px",
  maxWidth: "1280px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "36px",
};

const backLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 18px",
  fontSize: "14px",
  borderRadius: "999px",
  border: "1px solid hsla(199, 45%, 36%, 0.24)",
  background: "linear-gradient(135deg, hsla(216, 18%, 18%, 0.52), hsla(216, 18%, 12%, 0.48))",
  color: "hsl(var(--foreground))",
  textDecoration: "none",
  width: "fit-content",
};

const heroWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const heroTitleStyle: React.CSSProperties = {
  fontSize: "clamp(2.4rem, 2.8vw, 3rem)",
  fontWeight: 700,
  letterSpacing: "-0.015em",
  margin: 0,
};

const heroSubtitleStyle: React.CSSProperties = {
  ...subtleTextStyle,
  maxWidth: "640px",
};

const widgetGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "28px",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const withAlpha = (color: string, alpha: number) => {
  if (color.startsWith("hsl(")) {
    if (color.includes("/")) {
      return color.replace(/\/[^)]+\)/, `/ ${alpha})`);
    }
    return color.replace(")", ` / ${alpha})`);
  }
  return color;
};

const accentDotStyle = (accent: string): React.CSSProperties => ({
  width: "12px",
  height: "12px",
  borderRadius: "999px",
  background: accent,
  boxShadow: `0 0 18px ${withAlpha(accent, 0.4)}`,
});

const sectionWrapperStyle = (accent: string, span?: "default" | "wide"): React.CSSProperties => ({
  ...surfaceStyle,
  gap: "24px",
  border: `1px solid ${withAlpha(accent, 0.28)}`,
  boxShadow: `0 32px 74px rgba(5, 9, 18, 0.52), 0 0 0 1px ${withAlpha(accent, 0.22)}`,
  gridColumn: span === "wide" ? "1 / -1" : undefined,
});

const StudyZonePage: React.FC = () => {
  const widgetMeta = useMemo<WidgetMeta[]>(
    () => [
      {
        key: "timer",
        title: "Timer Suite",
        description: "Classic countdown, stopwatch, and Pomodoro flows for structured focus blocks.",
        accent: "hsl(199 84% 62%)",
        badge: "Focus",
        span: "wide",
      },
      {
        key: "assistant",
        title: "AI Assistant",
        description: "Chat with Vertex AI for study plans, clarifications, or quick brainstorming.",
        accent: "hsl(168 72% 58%)",
        badge: "AI",
        span: "wide",
      },
      {
        key: "activity",
        title: "Activity Log",
        description: "Capture wins, setbacks, and milestones across your study journey.",
        accent: "hsl(12 78% 64%)",
      },
      {
        key: "calendar",
        title: "Monthly Calendar",
        description: "Visualize upcoming work, anchor habits, and plan deep work rotations.",
        accent: "hsl(222 74% 72%)",
      },
      {
        key: "calculator",
        title: "Scientific Calculator",
        description: "Evaluate expressions with trig, logs, roots, and constants at your fingertips.",
        accent: "hsl(47 92% 68%)",
      },
      {
        key: "habits",
        title: "Habit Tracker",
        description: "Design routines, monitor streaks, and keep momentum every single day.",
        accent: "hsl(199 68% 60%)",
        badge: "New",
      },
      {
        key: "meditation",
        title: "Breath Meditation",
        description: "Reset with inhale/exhale guidance tuned to your ideal cadence.",
        accent: "hsl(266 72% 74%)",
      },
      {
        key: "notes",
        title: "Note Taker",
        description: "Rich-text capture for lecture notes, quick ideas, or revision prompts.",
        accent: "hsl(199 62% 60%)",
      },
    ],
    [],
  );

  const renderWidget = (key: WidgetKey, accent: string) => {
    switch (key) {
      case "timer":
        return <TimerApp accent={accent} />;
      case "assistant":
        return <Assistant accent={accent} />;
      case "activity":
        return <ActivityLog accent={accent} />;
      case "calendar":
        return <Calendar accent={accent} />;
      case "calculator":
        return <Calculator accent={accent} />;
      case "habits":
        return <HabitTracker accent={accent} />;
      case "meditation":
        return <Meditation accent={accent} />;
      case "notes":
        return <NoteTaker accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <Helmet>
        <title>Vertex — Study Zone</title>
        <meta name="description" content="ProductivityHub-inspired study dashboard with timers, notes, AI, meditation, and more." />
        <link rel="canonical" href="https://www.vertexed.app/study-zone" />
      </Helmet>

      <div>
        <Link to="/main" style={backLinkStyle}>
          <span aria-hidden="true">←</span>
          Back to main
        </Link>
      </div>

      <header style={heroWrapperStyle}>
        <span style={{ fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", color: "hsla(199, 45%, 72%, 0.75)" }}>
          Study Zone 2.0
        </span>
        <h1 style={heroTitleStyle}>Craft Your Focus Command Center</h1>
        <p style={heroSubtitleStyle}>
          Everything from ProductivityHub reimagined for Vertex — timers, AI coaching, notes, and restorative breathing, all flowing directly on this page.
        </p>
      </header>

      <div style={widgetGridStyle}>
        {widgetMeta.map((meta) => (
          <section key={meta.key} style={sectionWrapperStyle(meta.accent, meta.span)}>
            <div style={sectionHeaderStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={accentDotStyle(meta.accent)} />
                {meta.badge ? <span style={subtleBadgeStyle(meta.accent)}>{meta.badge}</span> : null}
              </div>
              <h2 style={sectionHeadingStyle}>{meta.title}</h2>
              <p style={{ ...subtleTextStyle, margin: 0 }}>{meta.description}</p>
            </div>

            {renderWidget(meta.key, meta.accent)}
          </section>
        ))}
      </div>
    </div>
  );
};

export default StudyZonePage;
