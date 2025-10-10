import { Outlet, Link } from "react-router-dom";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { RouteSemanticHeadings } from "@/components/SemanticHeadings";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/features', label: 'Features' },
  { to: '/about', label: 'About' },
  { to: '/login', label: 'Login' },
];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Helmet>
        <title>VertexED — AI Study Toolkit</title>
        <meta name="description" content="AI study tools for students — IB & IGCSE paper maker, study planner & calendar, notes, flashcards, quiz generator, answer reviewer, AI chatbot, and transcription — all in one place." />
        <meta property="og:site_name" content="VertexED" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta name="theme-color" content="#0f172a" />
      </Helmet>
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-soft opacity-[0.22]" />
        {/* Multi-orb background covering full page length */}
        <div className="orb-field">
          <div className="orb o1" />
          <div className="orb o2" />
          <div className="orb o3" />
          <div className="orb o4" />
          <div className="orb o5" />
          <div className="orb o6" />
        </div>
        <div className="ambient-corner top-[-10%] left-[-10%]" />
        <div className="ambient-corner bottom-[-20%] right-[-15%]" />
      </div>

    {/* JSON-LD breadcrumbs aligned with route headings */}
    <BreadcrumbsJsonLd />

      {/* Header */}
  <header className="w-full z-50 fixed top-0 left-0 md:relative bg-[#0f172a]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0f172a]/70 border-b border-white/10 md:bg-transparent md:backdrop-blur-0 md:supports-[backdrop-filter]:bg-transparent md:border-b-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo.png"
              alt="Vertex AI Logo"
              className="w-9 h-9 rounded-full object-cover select-none"
              draggable={false}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width="36"
              height="36"
            />
            <span className="font-semibold tracking-wide text-sm md:text-base text-[#ffffff]">
              Vertex AI
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="text-white/90 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/signup"
              className="rounded-full px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] transition-colors brand-cta brand-ink-dark"
            >
              Try Now
            </Link>
          </nav>

          {/* Mobile nav button */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            <Link
              to="/signup"
              className="rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] brand-cta brand-ink-dark"
            >
              Try
            </Link>
            <button
              aria-label="Toggle navigation menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-lg border border-white/10 hover:border-white/25 transition-colors"
            >
              <span className="sr-only">Menu</span>
              <div className="flex flex-col gap-1.5">
                <span
                  className={`block h-0.5 w-5 bg-white transition-transform ${
                    menuOpen ? "translate-y-1.5 rotate-45" : ""
                  }`}
                ></span>
                <span
                  className={`block h-0.5 w-5 bg-white transition-opacity ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`block h-0.5 w-5 bg-white transition-transform ${
                    menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        <div
          className={`md:hidden fixed inset-x-0 top-14 origin-top shadow-lg border-t border-white/10 bg-[#1d1d1d]/95 backdrop-blur-lg transition-[max-height] overflow-hidden z-40 ${
            menuOpen ? "max-h-[420px]" : "max-h-0"
          }`}
        >
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-white/5 last:border-b-0 text-white/90 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))] brand-cta brand-ink-dark"
            >
              Try Now
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
  <main className="relative z-10 flex-1 container mx-auto px-4 md:px-6 pt-24 md:pt-8 pb-8 animate-fade-in">
        {/* Hidden semantic headings for SEO & accessibility; no visual impact */}
        <RouteSemanticHeadings />
        <Suspense fallback={<div className="min-h-[40vh]" />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
