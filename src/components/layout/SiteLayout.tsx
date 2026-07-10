import { Outlet, Link, useLocation } from "react-router-dom";
import React, { Suspense, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { RouteSemanticHeadings } from "@/components/SemanticHeadings";
import { useAuth } from "@/contexts/AuthContext";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import { isAdminUser } from "@/lib/admin";
import GlobalChatPanel from "@/components/chat/GlobalChatPanel";
import CloudSaveBanner from "@/components/CloudSaveBanner";
import ThemeToggle from "@/components/ThemeToggle";
import ParticleDrift from "@/components/ParticleDrift";
import AmbientBackground from "@/components/AmbientBackground";
import FluidCursorLayer from "@/components/FluidCursorLayer";
import PageLoader from "@/components/PageLoader";
import { useStudySessionTracker } from "@/hooks/useStudySessionTracker";

function usePointerGlass() {
  const { settings } = useAppPreferences();

  useEffect(() => {
    if (settings.reducedMotion) return;
    const root = document.documentElement;
    const onMove = (e: MouseEvent) => {
      root.style.setProperty("--pointer-x", `${(e.clientX / window.innerWidth) * 100}%`);
      root.style.setProperty("--pointer-y", `${(e.clientY / window.innerHeight) * 100}%`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [settings.reducedMotion]);
}

export default function SiteLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const { themeColor } = useAppPreferences();
  usePointerGlass();
  const showAdmin = isAuthenticated && isAdminUser(user);
  const location = useLocation();
  useStudySessionTracker(isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(`${to}/`));

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = isAuthenticated
    ? [
        { to: "/main", label: "Dashboard" },
        { to: "/learning-hub", label: "Learning Hub" },
        { to: "/study-zone", label: "Study Zone" },
        { to: "/notetaker", label: "Notes" },
        { to: "/study-notebook", label: "Notebook" },
        { to: "/resources", label: "Resources" },
        { to: "/study-tools", label: "Study Tools" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/features", label: "Features" },
        { to: "/about", label: "About" },
        { to: "/login", label: "Login" },
      ];

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-foreground overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Helmet>
        <title>VertexED — AI Study Tools for Students | Planner, Notes & Quizzes</title>
        <meta
          name="description"
          content="All‑in‑one AI study toolkit with planner, calendar, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription — built on active recall."
        />
        <meta property="og:site_name" content="VertexED" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta name="theme-color" content={themeColor} />
      </Helmet>

      <AmbientBackground />
      <ParticleDrift />
      <FluidCursorLayer />

      <BreadcrumbsJsonLd />

      <header className="w-full z-50 sticky top-0 glass-nav">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link to={isAuthenticated ? "/main" : "/"} className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              srcSet="/favicon-32x32.png 32w, /favicon-48x48.png 48w, /apple-touch-icon.png 180w, /logo.png 500w"
              sizes="36px"
              alt="Vertex AI Logo"
              className="w-9 h-9 rounded-full object-cover select-none ring-1 ring-border/60 group-hover:ring-primary/40 transition"
              draggable={false}
              loading="eager"
              decoding="async"
              width="36"
              height="36"
            />
            <span className="font-semibold tracking-wide text-sm md:text-base text-foreground">
              Vertex AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`nav-link-pill ${isActive(l.to) ? "is-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/user-settings"
                className={`nav-link-pill ${isActive("/user-settings") ? "is-active" : ""}`}
              >
                Account
              </Link>
            )}
            {showAdmin && (
              <Link
                to="/admin/waitlist"
                className={`nav-link-pill ${isActive("/admin/waitlist") ? "is-active" : ""}`}
              >
                Admin
              </Link>
            )}
            <ThemeToggle compact className="ml-1" />
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => void logout()}
                className="nav-link-pill"
              >
                Sign out
              </button>
            )}
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="ml-2 rounded-full px-4 py-2 text-sm font-semibold brand-cta brand-ink-dark transition hover:brightness-110"
              >
                Try Now
              </Link>
            )}
          </nav>

          <div className="flex md:hidden items-center gap-2 ml-auto">
            <ThemeToggle compact />
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="rounded-full px-3 py-1.5 text-xs font-semibold brand-cta brand-ink-dark"
              >
                Try
              </Link>
            )}
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-xl border border-border/60 bg-background/50 hover:bg-accent/20 transition backdrop-blur-md"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 w-5 bg-foreground transition-transform ${
                    menuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-foreground transition-opacity ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-foreground transition-transform ${
                    menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 border-t border-border/60 ${
            menuOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-5 py-4 gap-1 text-sm font-medium bg-background/80 backdrop-blur-xl">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 ${
                  isActive(l.to)
                    ? "bg-primary/12 text-foreground border border-primary/25"
                    : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/user-settings"
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 ${
                  isActive("/user-settings")
                    ? "bg-primary/12 text-foreground border border-primary/25"
                    : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                }`}
              >
                Account
              </Link>
            )}
            {showAdmin && (
              <Link
                to="/admin/waitlist"
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 ${
                  isActive("/admin/waitlist")
                    ? "bg-primary/12 text-foreground border border-primary/25"
                    : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                }`}
              >
                Admin
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full px-4 py-2.5 text-sm font-semibold text-center brand-cta brand-ink-dark"
              >
                Try Now
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={async () => {
                  await logout();
                  setMenuOpen(false);
                }}
                className="mt-2 rounded-full px-4 py-2.5 text-sm font-semibold border border-border bg-accent/20 hover:bg-accent/30 transition"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="relative z-10 flex-1 container mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-10 animate-fade-in"
      >
        <RouteSemanticHeadings />
        <CloudSaveBanner />
        <RouteErrorBoundary>
          <Suspense fallback={<PageLoader label="Opening" />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      </main>

      <GlobalChatPanel />

      <footer className="relative z-10 border-t border-border/60 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VertexED — AI study tools for students.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/main" className="hover:text-foreground transition">Dashboard</Link>
                <Link to="/learning-hub" className="hover:text-foreground transition">Learning Hub</Link>
                <Link to="/user-settings" className="hover:text-foreground transition">Account</Link>
              </>
            ) : (
              <>
                <Link to="/features" className="hover:text-foreground transition">Features</Link>
                <Link to="/about" className="hover:text-foreground transition">About</Link>
                <Link to="/login" className="hover:text-foreground transition">Login</Link>
              </>
            )}
            <a href="mailto:vertexed.25@gmail.com" className="hover:text-foreground transition">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
