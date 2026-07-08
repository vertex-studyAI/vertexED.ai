import { Outlet, Link, useLocation } from "react-router-dom";
import React, { Suspense, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

import { RouteSemanticHeadings } from "@/components/SemanticHeadings";
import { useAuth } from "@/contexts/AuthContext";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";

export default function SiteLayout() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(`${to}/`));

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/features", label: "Features" },
    { to: "/about", label: "About" },
    ...(!isAuthenticated ? [{ to: "/login", label: "Login" as const }] : []),
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent text-foreground overflow-x-hidden">
      <Helmet>
        <title>VertexED — AI Study Tools for Students | Planner, Notes & Quizzes</title>
        <meta
          name="description"
          content="All‑in‑one AI study toolkit with planner, calendar, notes, flashcards, quizzes, chatbot, answer reviewer, and transcription — built on active recall."
        />
        <meta property="og:site_name" content="VertexED" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta name="theme-color" content="#070b14" />
      </Helmet>

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-grid-soft opacity-40" />
      </div>

      <BreadcrumbsJsonLd />

      <header className="w-full z-50 sticky top-0 glass-nav">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              srcSet="/favicon-32x32.png 32w, /favicon-48x48.png 48w, /apple-touch-icon.png 180w, /logo.png 500w"
              sizes="36px"
              alt="Vertex AI Logo"
              className="w-9 h-9 rounded-full object-cover select-none ring-1 ring-white/20 group-hover:ring-white/40 transition"
              draggable={false}
              loading="eager"
              decoding="async"
              width="36"
              height="36"
            />
            <span className="font-semibold tracking-wide text-sm md:text-base text-white">
              Vertex AI
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className={`nav-link-pill ${
                  isActive(l.to) ? "is-active text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/user-settings"
                className={`nav-link-pill ${
                  isActive("/user-settings")
                    ? "is-active text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Account
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/admin/waitlist"
                className={`nav-link-pill ${
                  isActive("/admin/waitlist")
                    ? "is-active text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                Admin
              </Link>
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
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/8 hover:bg-white/14 hover:border-white/25 transition backdrop-blur-md"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 w-5 bg-white transition-transform ${
                    menuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white transition-opacity ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-0.5 w-5 bg-white transition-transform ${
                    menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 border-t border-white/10 ${
            menuOpen ? "max-h-[460px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col px-5 py-4 gap-1 text-sm font-medium bg-black/25 backdrop-blur-xl">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 ${
                  isActive(l.to) ? "bg-white/12 text-white border border-white/20" : "text-white/80 hover:bg-white/10 hover:text-white"
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
                    ? "bg-white/12 text-white border border-white/20"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                Account
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/admin/waitlist"
                onClick={() => setMenuOpen(false)}
                className={`rounded-xl px-3 py-2.5 ${
                  isActive("/admin/waitlist")
                    ? "bg-white/12 text-white border border-white/20"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
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
                className="mt-2 rounded-full px-4 py-2.5 text-sm font-semibold border border-white/20 bg-white/10 hover:bg-white/15 transition"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex-1 container mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-10 animate-fade-in">
        <RouteSemanticHeadings />
        <Suspense
          fallback={
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-slate-300">
              <div className="h-9 w-9 rounded-full border-2 border-white/20 border-t-white/90 animate-spin" />
              <p className="text-sm text-white/70">Loading…</p>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
