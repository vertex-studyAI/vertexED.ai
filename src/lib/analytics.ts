// Lightweight client-side analytics. Tracks pageviews and custom events
// locally (privacy-friendly), with an optional sink (Vercel Analytics already wired).
// Use:
//   import { track, trackPageview, useAnalyticsRouter, useAnalyticsSnapshot } from "@/lib/analytics";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type AnalyticsEvent = {
  name: string;
  path: string;
  props?: Record<string, unknown>;
  ts: number;
};

const STORAGE_KEY = "vx-analytics-events-v1";
const MAX_EVENTS = 500;

function readEvents(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeEvents(events: AnalyticsEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    window.dispatchEvent(new CustomEvent("vx-analytics-update"));
  } catch {
    /* quota — silently ignore */
  }
}

export function track(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const event: AnalyticsEvent = {
    name,
    path: window.location.pathname,
    props,
    ts: Date.now(),
  };
  const events = readEvents();
  events.push(event);
  writeEvents(events);
  // Forward to Vercel Analytics if present
  try {
    const w = window as unknown as { va?: (...a: unknown[]) => void };
    if (typeof w.va === "function") w.va("event", { name, ...(props || {}) });
  } catch {
    /* noop */
  }
}

export function trackPageview(path: string) {
  track("pageview", { path });
}

export function clearAnalytics() {
  writeEvents([]);
}

export function getEvents(): AnalyticsEvent[] {
  return readEvents();
}

/** Hook: subscribe to events; re-renders when storage updates. */
export function useAnalyticsSnapshot() {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => readEvents());
  useEffect(() => {
    const refresh = () => setEvents(readEvents());
    window.addEventListener("vx-analytics-update", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("vx-analytics-update", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const total = events.length;
  const pageviews = events.filter((e) => e.name === "pageview").length;
  const byPath = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.path] = (acc[e.path] || 0) + 1;
    return acc;
  }, {});
  const byEvent = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.name] = (acc[e.name] || 0) + 1;
    return acc;
  }, {});
  const topPaths = Object.entries(byPath)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const topEvents = Object.entries(byEvent)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return { events, total, pageviews, topPaths, topEvents };
}

/** Mount inside Router to auto-track route changes. */
export function AnalyticsRouterTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageview(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}
