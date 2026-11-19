import { Outlet, Link, useLocation } from "react-router";
import React, { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";

import { useAuth } from "@/contexts/AuthContext";
import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import BreadcrumbsJsonLd from "@/components/BreadcrumbsJsonLd";
import RouteErrorBoundary from "@/components/RouteErrorBoundary";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import CloudSaveBanner from "@/components/CloudSaveBanner";
import ThemeToggle from "@/components/ThemeToggle";
import PageLoader from "@/components/PageLoader";
import GlobalStudySearch from "@/components/GlobalStudySearch";
import { useStudySessionTracker } from "@/hooks/useStudySessionTracker";
import { toast } from "@/hooks/use-toast";
import { logoutWithLocalFallback } from "@/lib/logoutFlow.mjs";
import { authUiError } from "@/lib/authUi.mjs";
import { shouldOfferApex } from "@/lib/apexRoute.mjs";
import { observeFooterVisibility } from "@/lib/companionDock.mjs";
import { PUBLIC_INTAKE_ROUTES } from "@/lib/intakeRoutes.mjs";
import '@/styles/navigation.css';
import '@/styles/beta-access.css';
import { BetaAccessDisplayContext } from '@/contexts/BetaAccessDisplayContext';

const GlobalChatPanel = lazy(() => import("@/components/chat/GlobalChatPanel"));
const ApexCompanion = lazy(() => import("@/components/ApexCompanion"));
const LearningMethodBand = lazy(() => import("@/components/LearningMethodBand"));

export default function SiteLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const { themeColor, settings } = useAppPreferences();
  const { isAdmin } = useIsAdmin();
  const showAdmin = isAuthenticated && isAdmin;
  const location = useLocation();
  const previousFocusPath = useRef(location.pathname);
  useStudySessionTracker(isAuthenticated);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tutorRequest, setTutorRequest] = useState(0);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [accessPanelVisible, setAccessPanelVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const footerRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileNavRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const updateHeight = () => document.documentElement.style.setProperty("--vertex-header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
    updateHeight();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateHeight);
    observer?.observe(header);
    window.addEventListener("resize", updateHeight);
    return () => { observer?.disconnect(); window.removeEventListener("resize", updateHeight); document.documentElement.style.removeProperty("--vertex-header-height"); };
  }, []);
  const isActive = (to: string) => {
    if (to.includes("?")) return location.pathname + location.search === to;
    if (to === "/learn") return location.pathname === "/learn" && !location.search.includes("tab=");
    const [pathname, hash] = to.split('#');
    if (hash) return location.pathname === pathname && location.hash === `#${hash}`;
    return location.pathname === pathname || (pathname !== "/" && location.pathname.startsWith(`${pathname}/`));
  };
  const chatEligibleRoute =
    shouldOfferApex(location.pathname) &&
    location.pathname !== "/chatbot" && location.pathname !== "/learn" &&
    !["/login", "/signup", "/auth/callback", "/onboarding", "/", "/home", "/about", "/features"].includes(
      location.pathname,
    ) &&
    !location.pathname.startsWith("/resources") && !location.pathname.startsWith("/study-guides");
  const shouldLoadGlobalChat = chatEligibleRoute && isAuthenticated;
  const companionEligible = shouldOfferApex(location.pathname) && location.pathname !== "/learn";
  const companionVisible = companionEligible && settings.studyCompanion && !settings.simpleMode;
  const showLearningMethod = ![
    '/login',
    '/signup',
    '/auth/callback',
    '/onboarding',
    '/privacy',
    '/terms',
  ].includes(location.pathname) && !location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!footerRef.current) return;
    return observeFooterVisibility(footerRef.current, setFooterVisible);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const targetId = location.hash.replace(/^#/, "");
      if (targetId) {
        document.getElementById(targetId)?.scrollIntoView({ block: "start", behavior: "auto" });
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const routeChanged = previousFocusPath.current !== location.pathname;
    previousFocusPath.current = location.pathname;
    // Query-backed search and filters must keep focus in the active control.
    if (!routeChanged || location.hash) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const handleLogout = async () => {
    try {
      const result = await logoutWithLocalFallback(logout);
      if (result.scope === "local") {
        toast({
          title: "Signed out on this device",
          description: "Other active sessions could not be revoked. Sign out there separately if needed.",
        });
      }
      setMenuOpen(false);
    } catch (error) {
      toast({
        title: "Could not sign out",
        description: authUiError(error, "logout"),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    if (mobileNavRef.current) mobileNavRef.current.inert = !menuOpen;
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    // Logo, search and browser-history navigation also leave the menu behind.
    setMenuOpen(false);
  }, [location.key]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const controls = [...(headerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [])].filter(element => element.getClientRects().length && !element.closest('[inert]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenuOpen(false);
      window.requestAnimationFrame(() => menuButtonRef.current?.focus());
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const navLinks = isAuthenticated
    ? [
        { to: "/main", label: "Today" },
        { to: "/learn?tab=knowledge", label: "Courses" },
        { to: "/resources", label: "Library" },
        { to: "/learn", label: "Practise" },
        { to: "/learn?tab=mistakes", label: "Mistakes" },
        { to: "/planner", label: "Study plan" },
        { to: "/exam-prep", label: "Exam prep" },
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/features", label: "Features" },
        { to: "/resources", label: "Library" },
        { to: "/projects", label: "Projects" },
        { to: "/#concept-lens", label: "Try the lens" },
        { to: "/about", label: "About" },
        { to: "/login", label: "Login" },
      ];

  return (
    <BetaAccessDisplayContext.Provider value={setAccessPanelVisible}>
    <div data-footer-visible={footerVisible ? 'true' : undefined} className={`site-shell relative min-h-screen flex flex-col text-foreground ${['/', '/home'].includes(location.pathname) ? 'site-landing' : 'site-workspace bg-transparent'}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      {isAuthenticated && <nav className="learning-bottom-nav" aria-label="Mobile learning navigation">{[
        { to: '/main', label: 'Today' }, { to: '/learn?tab=knowledge', label: 'Learn' }, { to: '/learn', label: 'Practise' }, { to: '/learn?tab=mistakes', label: 'Mistakes' }, { to: '/user-settings', label: 'Profile' }
      ].map(item => <Link key={item.to} to={item.to} aria-current={isActive(item.to) ? 'page' : undefined}>{item.label}</Link>)}</nav>}
      <Helmet>
        <title>VertexED: Revision planning and exam practice</title>
        {!location.pathname.startsWith("/myp/subjects/") && <meta
          name="description"
          content="Plan revision, practise papers, review answers, and revisit topics with notes and flashcards in VertexED."
        />}
        <meta property="og:site_name" content="VertexED" />
        <meta property="og:image" content="https://www.vertexed.app/socialpreview.jpg" />
        <meta property="og:locale" content="en_US" />
        <meta name="theme-color" content={themeColor} />
      </Helmet>


      <BreadcrumbsJsonLd />

      <header ref={headerRef} data-authenticated={isAuthenticated} data-surface={isAuthenticated ? 'account' : 'public'} className="vertex-navigation w-full z-50 sticky top-0 glass-nav">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <Link to={isAuthenticated ? "/main" : "/"} className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              alt="VertexED logo"
              className="w-9 h-9 rounded-full object-cover select-none ring-1 ring-border/60 group-hover:ring-primary/40 transition-shadow duration-200"
              draggable={false}
              loading="eager"
              decoding="async"
              width="36"
              height="36"
            />
            <span className="font-semibold tracking-tight text-sm md:text-base text-foreground">
              Vertex<span className="text-primary">ED</span>
            </span>
          </Link>

          <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-1 text-sm font-medium">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                aria-current={isActive(l.to) ? "page" : undefined}
                className={`nav-link-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isActive(l.to) ? "is-active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link
                to="/user-settings"
                aria-current={isActive("/user-settings") ? "page" : undefined}
                className={`nav-link-pill ${isActive("/user-settings") ? "is-active" : ""}`}
              >
                Account
              </Link>
            )}
            {showAdmin && (
              <Link
                to="/admin/waitlist"
                aria-current={isActive("/admin/waitlist") ? "page" : undefined}
                className={`nav-link-pill ${isActive("/admin/waitlist") ? "is-active" : ""}`}
              >
                Admin
              </Link>
            )}
            <ThemeToggle compact className="ml-1" />
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="nav-link-pill"
              >
                Sign out
              </button>
            )}
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="ml-2 rounded-lg px-4 py-2 text-sm font-semibold brand-cta brand-ink-dark transition hover:brightness-110"
              >
                Join beta
              </Link>
            )}
          </nav>

          <div className="flex xl:hidden items-center gap-2 ml-auto">
            <ThemeToggle compact />
            {!isAuthenticated && (
              <Link
                to="/signup"
                className="mobile-join-link rounded-lg px-3 py-1.5 text-xs font-semibold brand-cta brand-ink-dark"
              >
                Join
              </Link>
            )}
            <button
              ref={menuButtonRef}
              type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
              className="relative w-10 h-10 inline-flex items-center justify-center rounded-lg border border-border/60 bg-background/50 hover:bg-accent/20 transition-colors backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

        <GlobalStudySearch />

        <div
          aria-hidden={!menuOpen}
          className={`xl:hidden overflow-hidden transition-[max-height,opacity] duration-150 border-t border-border/60 ${
            menuOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <nav
            ref={mobileNavRef}
            id="mobile-nav"
            aria-label="Mobile navigation"
            className="flex flex-col px-5 py-4 gap-1 text-sm font-medium bg-background/80 backdrop-blur-xl"
          >
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                aria-current={isActive(l.to) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 ${
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
                aria-current={isActive("/user-settings") ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 ${
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
                aria-current={isActive("/admin/waitlist") ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 ${
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
                className="mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-center brand-cta brand-ink-dark"
              >
                Join the private beta
              </Link>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold border border-border bg-accent/20 hover:bg-accent/30 transition"
              >
                Sign Out
              </button>
            )}
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="immersive-main relative z-10 flex-1 container mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-10"
      >
        <CloudSaveBanner />
        <RouteErrorBoundary resetKey={`${location.pathname}${location.search}${location.hash}`}>
          <Suspense fallback={<PageLoader label="Opening" />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
        {showLearningMethod && <Suspense fallback={null}><LearningMethodBand pathname={location.pathname} /></Suspense>}
      </main>

      {shouldLoadGlobalChat && (
        <Suspense fallback={null}>
          <GlobalChatPanel openRequest={tutorRequest} hideLauncher={companionVisible} onOpenChange={setTutorOpen} />
        </Suspense>
      )}

      <footer ref={footerRef} className="relative z-10 border-t border-border/60 bg-background/50 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VertexED. Plan, practise, review, remember.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {isAuthenticated ? (
              <>
                <Link to="/main" className="hover:text-foreground transition">Today</Link>
                <Link to="/planner" className="hover:text-foreground transition">Planner</Link>
                <Link to="/resources" className="hover:text-foreground transition">Learning library</Link>
                <Link to="/myp" className="hover:text-foreground transition">MYP 5</Link>
                <Link to="/user-settings" className="hover:text-foreground transition">Account</Link>
                <Link to="/privacy" className="hover:text-foreground transition">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition">Terms</Link>
              </>
            ) : (
              <>
                <Link to="/features" className="hover:text-foreground transition">Features</Link>
                <Link to="/resources" className="hover:text-foreground transition">Learning library</Link>
                <Link to="/curricula" className="hover:text-foreground transition">Curricula</Link>
                <Link to="/myp" className="hover:text-foreground transition">MYP 5</Link>
                <Link to="/projects" className="hover:text-foreground transition">Projects</Link>
                <Link to="/about" className="hover:text-foreground transition">About</Link>
                <Link to="/privacy" className="hover:text-foreground transition">Privacy</Link>
                <Link to="/terms" className="hover:text-foreground transition">Terms</Link>
                <Link to="/login" className="hover:text-foreground transition">Login</Link>
              </>
            )}
            <a href={PUBLIC_INTAKE_ROUTES.support} className="hover:text-foreground transition">Support</a>
            <a href={PUBLIC_INTAKE_ROUTES.privacyRequest} className="hover:text-foreground transition">Privacy request</a>
            <a href={PUBLIC_INTAKE_ROUTES.security} className="hover:text-foreground transition">Security</a>
            {!isAuthenticated && (
              <a href={PUBLIC_INTAKE_ROUTES.schoolPilot} className="hover:text-foreground transition">School pilot</a>
            )}
            <a href="mailto:vertexed.25@gmail.com" className="hover:text-foreground transition">Contact</a>
            {companionEligible && (
              <Suspense fallback={null}>
                <ApexCompanion docked={footerVisible || accessPanelVisible || location.pathname === "/user-settings" || location.pathname === "/study-zone" || location.pathname === "/saved-work" || location.pathname.startsWith("/study-guides") || location.pathname.startsWith("/myp") || location.pathname === "/ap" || location.pathname.startsWith("/ap/")} suspended={menuOpen || (shouldLoadGlobalChat && tutorOpen)}
                  onOpenTutor={shouldLoadGlobalChat ? () => setTutorRequest((request) => request + 1) : undefined} />
              </Suspense>
            )}
          </nav>
        </div>
      </footer>
    </div>
    </BetaAccessDisplayContext.Provider>
  );
}
