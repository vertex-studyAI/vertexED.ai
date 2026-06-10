import { Outlet, Link, useLocation } from "react-router-dom";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { RouteSemanticHeadings } from "@/components/SemanticHeadings";
import { useAuth } from "@/contexts/AuthContext";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import ParticlesBg from "@/components/ParticlesBg";
import ThemeToggle from "@/components/ThemeToggle";
import { useFocusMode } from "@/contexts/FocusModeContext";
import CommandPalette from "@/components/CommandPalette";
import { Search, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { env } from "@/lib/env";

type NavItem = {
  to: string;
  label: string;
};

const publicNav: NavItem[] = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/resources", label: "Resources" },
  { to: "/about", label: "About" },
];

function NavLinkItem({ to, label, onClick }: NavItem & { onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="rounded-full px-3.5 py-2 text-sm font-medium text-white/82 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
    >
      {label}
    </Link>
  );
}

export default function SiteLayout() {
  const { isAuthenticated, logout, user, profile } = useAuth();
  const { focusMode, toggleFocusMode } = useFocusMode();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useScrollReveal();

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(() => {
    const links = [...publicNav];
    if (!isAuthenticated) {
      links.push({ to: "/login", label: "Login" });
    }
    return links;
  }, [isAuthenticated]);

  const displayName =
    user?.user_metadata?.username ||
    profile?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Student");


  return (
    <div className={`site-shell relative min-h-screen overflow-hidden bg-background text-foreground ${focusMode ? "focus-mode" : ""}`}>
      <Helmet>
        <title>VertexED — AI Study Tools for Students | Planner, Notes & Quizzes</title>
        <meta
          name="description"
          content="All‑in‑one AI study toolkit with planner, calendar, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription — built on active recall."
        />
        <meta property="og:site_name" content="VertexED" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta property="og:locale" content="en_US" />
      </Helmet>

      <ParticlesBg className="particles-bg" />
      <CommandPalette />
      <div className="hero-glow pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_36%),radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.10),_transparent_28%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--background)/0.94))]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.35] [background-image:linear-gradient(to_right,hsl(0_0%_100%/_0.035)_1px,transparent_1px),linear-gradient(to_bottom,hsl(0_0%_100%/_0.035)_1px,transparent_1px)] [background-size:84px_84px] [mask-image:radial-gradient(circle_at_center,black_18%,transparent_82%)]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-[0.10] mix-blend-overlay noise-grain" />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 mesh-texture opacity-80" />

      <BreadcrumbsJsonLd />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0f172a]/72 backdrop-blur-xl supports-[backdrop-filter]:bg-[#0f172a]/58">
        <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/logo.png"
              srcSet="/favicon-32x32.png 32w, /favicon-48x48.png 48w, /apple-touch-icon.png 180w, /logo.png 500w"
              sizes="36px"
              alt="VertexED AI Logo"
              className="h-9 w-9 rounded-full object-cover select-none ring-1 ring-white/10"
              draggable={false}
              loading="eager"
              decoding="async"
              width="36"
              height="36"
            />
            <div className="leading-tight">
              <span className="block text-sm font-semibold tracking-wide text-white">
                VertexED AI
              </span>
              <span className="hidden text-[11px] text-white/45 md:block">
                Study tools that adapt
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/4 p-1.5 lg:flex">
            {navLinks.map((item) => (
              <NavLinkItem key={item.label} {...item} />
            ))}
            {isAuthenticated && <NavLinkItem to="/user-settings" label="Account" />}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("vx:open-command-palette"))}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Open command palette"
              title="Command palette (⌘K)"
            >
              <Search className="h-4 w-4" />
              <span className="hidden xl:inline">Command palette</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/50">⌘K</span>
            </button>
            {env.enableFocusMode && (
              <button
                type="button"
                onClick={toggleFocusMode}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition ${focusMode ? "border-sky-300/30 bg-sky-400/12 text-sky-50 hover:bg-sky-400/18" : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"}`}
                aria-label={focusMode ? "Disable focus mode" : "Enable focus mode"}
                title={focusMode ? "Focus mode on" : "Focus mode"}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden xl:inline">{focusMode ? "Focused" : "Focus"}</span>
              </button>
            )}
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link
                  to="/main"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10"
                >
                  Dashboard
                </Link>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                  Hi, {displayName}
                </div>
                <button
                  onClick={logout}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark transition-transform hover:-translate-y-0.5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/signup"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark transition-transform hover:-translate-y-0.5"
              >
                Try now
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("vx:open-command-palette"))}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition hover:bg-white/10"
              aria-label="Open command palette"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <ThemeToggle />
            {env.enableFocusMode && (
              <button
                type="button"
                onClick={toggleFocusMode}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${focusMode ? "border-sky-300/30 bg-sky-400/12 text-sky-50" : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"}`}
                aria-label={focusMode ? "Disable focus mode" : "Enable focus mode"}
                title={focusMode ? "Focus mode on" : "Focus mode"}
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
            {isAuthenticated ? (
              <Link
                to="/main"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/signup"
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/85"
              >
                Join
              </Link>
            )}
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90 transition-colors hover:bg-white/10"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1.5">
                <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`block h-0.5 w-5 bg-current transition-opacity ${menuOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`block h-0.5 w-5 bg-current transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        <div
          className={`lg:hidden border-t border-white/8 bg-[#101828]/96 px-4 transition-[max-height,opacity,transform] duration-300 ${
            menuOpen ? "max-h-[75vh] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav className="mx-auto flex max-w-[1440px] flex-col gap-2 py-4">
            {navLinks.map((item) => (
              <NavLinkItem key={item.label} {...item} onClick={() => setMenuOpen(false)} />
            ))}
            {isAuthenticated && <NavLinkItem to="/user-settings" label="Account" onClick={() => setMenuOpen(false)} />}
            <div className="mt-3 flex gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={async () => {
                      await logout();
                      setMenuOpen(false);
                    }}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/85"
                  >
                    Sign out
                  </button>
                  <Link
                    to="/main"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-full px-4 py-3 text-center text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-full px-4 py-3 text-center text-sm font-semibold text-[hsl(var(--card-foreground))] brand-cta brand-ink-dark"
                >
                  Try now
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-8">
          <RouteSemanticHeadings />
          <Suspense
            fallback={
              <div className="flex min-h-[55vh] items-center justify-center">
                <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-sm text-white/70 shadow-2xl backdrop-blur-xl">
                  Loading workspace…
                </div>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/8 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between md:px-6">
          <p>VertexED AI — built for focused study, adaptive practice, and calmer planning.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link to="/user-settings" className="hover:text-white transition-colors">Settings</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
