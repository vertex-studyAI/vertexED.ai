import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { track } from "@/lib/analytics";
import { useTheme } from "@/contexts/ThemeContext";
import { useFocusMode } from "@/contexts/FocusModeContext";
import { env } from "@/lib/env";

type Cmd = { id: string; label: string; to?: string; hint?: string; action?: () => void };

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const nav = useNavigate();
  const { theme, setTheme, toggle: toggleTheme } = useTheme();
  const { focusMode, toggleFocusMode } = useFocusMode();

  const openPalette = (via: string) => {
    setOpen(true);
    track("command_palette_open", { via });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          track(v ? "command_palette_close" : "command_palette_open", { via: "shortcut" });
          return !v;
        });
      } else if (e.key === "Escape") {
        setOpen((v) => {
          if (v) track("command_palette_close", { via: "escape" });
          return false;
        });
      }
    };
    const onCustomOpen = () => openPalette("button");
    window.addEventListener("keydown", onKey);
    window.addEventListener("vx:open-command-palette", onCustomOpen as EventListener);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("vx:open-command-palette", onCustomOpen as EventListener);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      const id = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  const commands = useMemo<Cmd[]>(
    () => [
      {
        id: "theme-toggle",
        label:
          theme === "light"
            ? "Switch to dark mode"
            : theme === "dark"
              ? "Switch to AMOLED mode"
              : theme === "amoled"
                ? "Follow system theme"
                : "Switch to light mode",
        hint: "Appearance",
        action: () => {
          track("command_palette_action", { action: "toggle_theme", from: theme });
          toggleTheme();
        },
      },
      {
        id: "theme-light",
        label: "Use light mode",
        hint: "Appearance",
        action: () => {
          track("command_palette_action", { action: "set_theme", to: "light" });
          setTheme("light");
        },
      },
      {
        id: "theme-dark",
        label: "Use dark mode",
        hint: "Appearance",
        action: () => {
          track("command_palette_action", { action: "set_theme", to: "dark" });
          setTheme("dark");
        },
      },
      {
        id: "theme-amoled",
        label: "Use AMOLED mode",
        hint: "Appearance",
        action: () => {
          track("command_palette_action", { action: "set_theme", to: "amoled" });
          setTheme("amoled");
        },
      },
      {
        id: "theme-system",
        label: "Follow system theme",
        hint: "Appearance",
        action: () => {
          track("command_palette_action", { action: "set_theme", to: "system" });
          setTheme("system");
        },
      },
      ...(env.enableFocusMode
        ? [
            {
              id: "focus",
              label: focusMode ? "Exit focus mode" : "Enter focus mode",
              hint: "Calmer UI",
              action: () => {
                track("command_palette_action", { action: "toggle_focus_mode", from: focusMode ? "on" : "off" });
                toggleFocusMode();
              },
            },
          ]
        : []),
      { id: "home", label: "Home", to: "/", hint: "Landing" },
      { id: "main", label: "Dashboard", to: "/main", hint: "All tools" },
      { id: "study", label: "Study Zone", to: "/study-zone" },
      { id: "chat", label: "AI Chatbot", to: "/chatbot" },
      { id: "planner", label: "Study Planner", to: "/planner" },
      { id: "review", label: "Answer Reviewer", to: "/answer-reviewer" },
      { id: "paper", label: "Paper Maker", to: "/paper-maker" },
      { id: "notes", label: "Note Taker", to: "/notetaker" },
      { id: "archives", label: "Archives", to: "/archives" },
      { id: "exam", label: "Exam Hub ✨", to: "/exam-hub" },
      { id: "analytics", label: "Analytics", to: "/analytics", hint: "Local insights" },
      { id: "features", label: "Features", to: "/features" },
      { id: "resources", label: "Resources", to: "/resources" },
      { id: "about", label: "About", to: "/about" },
      { id: "settings", label: "Settings", to: "/user-settings" },
    ],
    [theme, focusMode, toggleTheme, toggleFocusMode, setTheme],
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(s) || c.to?.includes(s) || c.hint?.toLowerCase().includes(s));
  }, [q, commands]);

  const go = (c: Cmd) => {
    setOpen(false);
    if (c.action) {
      c.action();
      return;
    }
    if (!c.to) return;
    track("command_palette_navigate", { to: c.to });
    nav(c.to);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh] animate-fade-in"
      onClick={() => { track("command_palette_close", { via: "backdrop" }); setOpen(false); }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/12 bg-[#0f172a]/85 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        style={{ animation: "scale-in 180ms ease-out" }}
      >
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
          <span className="text-white/55 text-xs uppercase tracking-widest">⌘K</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, filtered.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              else if (e.key === "Enter" && filtered[active]) { e.preventDefault(); go(filtered[active]); }
            }}
            placeholder="Jump to anywhere…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  i === active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5"
                }`}
              >
                <span className="font-medium">{c.label}</span>
                <span className="text-xs text-white/45">{c.hint ?? c.to ?? ""}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-white/55">No matches.</li>
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-white/8 px-4 py-2 text-[11px] text-white/45">
          <span>↑ ↓ navigate • ↵ open • esc close</span>
          <span>Vertex AI</span>
        </div>
      </div>
    </div>
  );
}
